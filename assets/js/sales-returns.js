document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('return-invoice');
    const invoices = getInvoices();
    
    if (invoices.length === 0) {
        select.innerHTML = '<option value="">لا توجد فواتير مسجلة</option>';
        return;
    }
    
    invoices.reverse().forEach(inv => {
        select.innerHTML += `<option value="${inv.id}">${inv.invoiceNumber} - ${inv.customerName} (${inv.date})</option>`;
    });
});

function loadInvoiceItems() {
    const invoiceId = parseInt(document.getElementById('return-invoice').value);
    const container = document.getElementById('return-items-container');
    const footer = document.getElementById('return-footer');
    const tbody = document.getElementById('return-items-body');

    if (!invoiceId) {
        container.style.display = 'none';
        footer.style.display = 'none';
        return;
    }

    const invoice = getInvoices().find(i => i.id === invoiceId);
    tbody.innerHTML = '';

    if (!invoice || !invoice.items) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 20px; font-weight: bold;">⚠️ هذه الفاتورة قديمة ولا تحتوي على تفاصيل الأصناف. يرجى إنشاء فاتورة مبيعات جديدة لتجربة المرتجعات.</td></tr>';
        container.style.display = 'block';
        footer.style.display = 'none';
        return;
    }

    invoice.items.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.qty}</td>
                <td><input type="number" class="return-qty" value="0" min="0" max="${item.qty}" data-price="${item.price}" data-cost="${item.cost}" data-item-id="${item.itemId}" oninput="calculateReturnTotal()" style="width:100%; text-align:center;"></td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
            </tr>
        `;
    });

    container.style.display = 'block';
    footer.style.display = 'block';
    calculateReturnTotal();
}

function calculateReturnTotal() {
    let total = 0;
    document.querySelectorAll('.return-qty').forEach(input => {
        const qty = parseFloat(input.value) || 0;
        const price = parseFloat(input.getAttribute('data-price')) || 0;
        const max = parseFloat(input.getAttribute('max'));
        
        if (qty > max) { input.value = max; return; }
        
        total += (qty * price);
    });
    document.getElementById('return-total').textContent = total.toFixed(2);
}

function saveReturn() {
    const invoiceId = parseInt(document.getElementById('return-invoice').value);
    const total = parseFloat(document.getElementById('return-total').textContent);
    
    if (total <= 0) return alert('يجب تحديد كمية مرتجعة أكبر من صفر.');

    const invoice = getInvoices().find(i => i.id === invoiceId);
    let totalReturnCost = 0;
    let returnItems = [];

    document.querySelectorAll('.return-qty').forEach(input => {
        const qty = parseFloat(input.value) || 0;
        if (qty > 0) {
            const cost = parseFloat(input.getAttribute('data-cost'));
            totalReturnCost += (qty * cost);
            returnItems.push({
                itemId: parseInt(input.getAttribute('data-item-id')),
                qty: qty
            });
        }
    });

    let allItems = getItems();
    returnItems.forEach(ret => {
        let itemIndex = allItems.findIndex(i => i.id === ret.itemId);
        if(itemIndex !== -1) {
            allItems[itemIndex].qty += ret.qty;
        }
    });
    saveItems(allItems);

    const returns = getSalesReturns();
    const returnNumber = `RET-${new Date().getFullYear()}-${String(returns.length + 1).padStart(4, '0')}`;
    returns.push({ id: Date.now(), returnNumber, invoiceId, customerName: invoice.customerName, date: new Date().toISOString().split('T')[0], total });
    saveSalesReturns(returns);

    updateCustomerBalance(invoice.customerId, -total);

    const entries = getEntries();
    const today = new Date().toISOString().split('T')[0];
    
    const entryNumber1 = `JV-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    entries.push({
        id: Date.now(),
        entryNumber: entryNumber1,
        date: today,
        description: `مرتجع مبيعات ${returnNumber} - العميل: ${invoice.customerName}`,
        lines: [
            { accountCode: "4102", accountName: "مردودات المبيعات", debit: total, credit: 0 },
            { accountCode: "1103", accountName: "العملاء (الذمم المدينة)", debit: 0, credit: total }
        ],
        totalDebit: total,
        totalCredit: total
    });

    if (totalReturnCost > 0) {
        const entryNumber2 = `JV-${new Date().getFullYear()}-${String(entries.length + 2).padStart(4, '0')}`;
        entries.push({
            id: Date.now() + 1,
            entryNumber: entryNumber2,
            date: today,
            description: `تكلفة مرتجع مبيعات ${returnNumber}`,
            lines: [
                { accountCode: "1104", accountName: "المخزون (البضاعة)", debit: totalReturnCost, credit: 0 },
                { accountCode: "5104", accountName: "تكلفة البضاعة المباعة", debit: 0, credit: totalReturnCost }
            ],
            totalDebit: totalReturnCost,
            totalCredit: totalReturnCost
        });
    }

    saveEntries(entries);
    alert(`تم حفظ المرتجع ${returnNumber} بنجاح!
تمت إعادة الكميات للمخزون وخصم القيمة من العميل وتوليد القيود.`);
    window.location.href = 'invoices-list.html';
}