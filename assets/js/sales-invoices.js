
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('invoice-date').valueAsDate = new Date();
    
    // انتظار جلب البيانات من الخادم
    if (typeof window.initBackendSync === 'function') {
        try { await window.initBackendSync(); } catch(e) { console.error(e); }
    }
    
    // تعبئة القوائم
    loadInvoiceDropdowns();
    addInvoiceRow();
});

function loadInvoiceDropdowns() {
    try {
        const custSelect = document.getElementById('invoice-customer');
        custSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
        getCustomers().forEach(c => {
            custSelect.innerHTML += `<option value="${c.id}" data-name="${c.name}">${c.code} - ${c.name}</option>`;
        });

        const branchSelect = document.getElementById('invoice-branch');
        branchSelect.innerHTML = '<option value="">-- اختر الفرع --</option>';
        getCostCenters().forEach(c => {
            branchSelect.innerHTML += `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`;
        });

        const whSelect = document.getElementById('invoice-warehouse');
        whSelect.innerHTML = '<option value="">-- اختر --</option>';
        getWarehouses().forEach(wh => {
            whSelect.innerHTML += `<option value="${wh.id}" data-name="${wh.name}">${wh.name}</option>`;
        });

        const currencySelect = document.getElementById('invoice-currency');
        currencySelect.innerHTML = '<option value="">-- اختر --</option>';
        getCurrencies().forEach(c => {
            currencySelect.innerHTML += `<option value="${c.code}" data-rate="${c.rate}" ${c.isBase ? 'selected' : ''}>${c.code} - ${c.name}</option>`;
        });
    } catch(e) { console.error("خطأ في تحميل القوائم:", e); }
}


function buildItemOptions(selectElement) {
    selectElement.innerHTML = '<option value="">-- اختر الصنف --</option>';
    try {
        getItems().forEach(item => {
            if (item.qty > 0) {
                selectElement.innerHTML += `<option value="${item.id}" data-price="${item.salePrice}" data-cost="${item.purchasePrice}" data-qty="${item.qty}" data-name="${item.name}">${item.code} - ${item.name} (متوفر: ${item.qty})</option>`;
            }
        });
    } catch(e) { console.error("خطأ في الأصناف:", e); }
}

function addInvoiceRow() {
    const tbody = document.getElementById('invoice-items-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><select class="item-select" onchange="updateRow(this)" style="width:100%; padding:8px;"></select></td>
        <td><input type="text" class="item-avail-qty" readonly style="width:100%; text-align:center; background:#f8fafc;"></td>
        <td><input type="text" inputmode="decimal" class="item-qty" value="1" oninput="calcTotal()" onfocus="this.select()" style="width:100%; text-align:center;"></td>
        <td><input type="text" class="item-price" readonly style="width:100%; text-align:center; background:#f8fafc;"></td>
        <td><button class="btn-delete" onclick="this.parentElement.parentElement.remove(); calcTotal();">حذف</button></td>
    `;
    tbody.appendChild(tr);
    buildItemOptions(tr.querySelector('.item-select'));
}

function updateRow(select) {
    const row = select.parentElement.parentElement;
    if(select.value) {
        row.querySelector('.item-avail-qty').value = select.options[select.selectedIndex].getAttribute('data-qty');
        row.querySelector('.item-price').value = select.options[select.selectedIndex].getAttribute('data-price');
    } else {
        row.querySelector('.item-avail-qty').value = '';
        row.querySelector('.item-price').value = '';
    }
    calcTotal();
}

function calcTotal() {
    let sub = 0;
    document.querySelectorAll('#invoice-items-body tr').forEach(row => {
        const q = parseFloat(row.querySelector('.item-qty').value) || 0;
        const p = parseFloat(row.querySelector('.item-price').value) || 0;
        sub += (q * p);
    });
    const vatRate = parseFloat(document.getElementById('vat-rate').value.replace(/[^0-9.]/g, '')) || 0;
    const vatAmt = sub * (vatRate / 100);
    const grand = sub + vatAmt;
    document.getElementById('subtotal').textContent = sub.toFixed(2);
    document.getElementById('vat-amount').textContent = vatAmt.toFixed(2);
    document.getElementById('invoice-total').textContent = grand.toFixed(2);
    return { sub, vatAmt, grand };
}

// الدالة الأساسية للحفظ
async function saveInvoice() {
    console.log("🚀 [1] بدء عملية حفظ الفاتورة...");
    
    try {
        const t = calcTotal();
        if (t.grand <= 0) return Swal.fire({ icon: 'info', title: 'أدخل أصنافا صحيحة.', confirmButtonColor: '#10b981' });
        
        const custSelect = document.getElementById('invoice-customer');
        const custIdStr = custSelect.value;
        if (!custIdStr) return Swal.fire({ icon: 'info', title: 'يرجى اختيار العميل.', confirmButtonColor: '#10b981' });
        const custName = custSelect.options[custSelect.selectedIndex].getAttribute('data-name');
        
        const branchName = document.getElementById('invoice-branch').options[document.getElementById('invoice-branch').selectedIndex]?.getAttribute('data-name') || '';
        const whName = document.getElementById('invoice-warehouse').options[document.getElementById('invoice-warehouse').selectedIndex]?.getAttribute('data-name') || '';
        
        const date = document.getElementById('invoice-date').value;
        
        let itemsDet = [];
        document.querySelectorAll('#invoice-items-body tr').forEach(row => {
            const sel = row.querySelector('.item-select');
            if(!sel.value) return;
            itemsDet.push({ 
                itemId: parseInt(sel.value), 
                itemName: sel.options[sel.selectedIndex].getAttribute('data-name'), 
                qty: parseFloat(row.querySelector('.item-qty').value) || 0, 
                price: parseFloat(row.querySelector('.item-price').value) || 0,
                cost: parseFloat(sel.options[sel.selectedIndex].getAttribute('data-cost')) || 0
            });
        });

        const invoices = getInvoices();
        const invNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
        
        const newInvoice = { 
            id: Date.now(), invoiceNumber: invNum, customerId: parseInt(custIdStr), customerName: custName, 
            date: date, total: t.grand, items: itemsDet, warehouse: whName, branchName: branchName,
            currency: 'SAR', exchangeRate: 1, baseTotal: t.grand
        };
        
        invoices.push(newInvoice);
        saveInvoices(invoices);
        console.log("✅ [2] تم الحفظ المحلي للفاتورة:", invNum);

        // إرسال للخادم
        console.log("🔄 [3] إرسال الفاتورة للخادم...");
        await fetch('/api/sales_invoices', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newInvoice)
        });
        console.log("✅ [4] تم استلام رد الخادم (الفاتورة).");

        // توليد القيود
        const entries = getEntries();
        const entry1 = { 
            id: Date.now(), entryNumber: `JV-${new Date().getFullYear()}-${String(entries.length+1).padStart(4,'0')}`, 
            date: date, description: `فاتورة مبيعات ${invNum} - ${branchName}`,
            lines: [
                { accountCode: "1103", accountName: "العملاء", debit: t.grand, credit: 0 },
                { accountCode: "4101", accountName: "إيرادات المبيعات", debit: 0, credit: t.sub },
                { accountCode: "2102", accountName: "ضريبة المخرجات", debit: 0, credit: t.vatAmt }
            ], totalDebit: t.grand, totalCredit: t.grand, status: 'posted'
        };
        entries.push(entry1);

        console.log("🔄 [5] إرسال القيد للخادم...");
        await fetch('/api/entries', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry1)
        });
        console.log("✅ [6] تم استلام رد الخادم (القيد).");

        saveEntries(entries);
        alert(`تم حفظ الفاتورة ${invNum} بنجاح!`);
        window.location.href = 'invoices-list.html';

    } catch (error) {
        console.error("❌ [ERROR] حدث خطأ أثناء الحفظ:", error);
        alert("حدث خطأ تقني. يرجى فتح الـ Console (F12) لرؤية التفاصيل.");
    }
}
