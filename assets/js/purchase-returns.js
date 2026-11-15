document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('return-invoice');
    const purchases = getPurchases();
    
    if (purchases.length === 0) {
        select.innerHTML = '<option value="">لا توجد فواتير مشتريات مسجلة</option>';
        return;
    }
    
    purchases.reverse().forEach(inv => {
        select.innerHTML += `<option value="${inv.id}">${inv.invoiceNumber} - ${inv.supplierName} (${inv.date})</option>`;
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

    const invoice = getPurchases().find(i => i.id === invoiceId);
    tbody.innerHTML = '';

    if (!invoice || !invoice.items) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 20px; font-weight: bold;">⚠️ هذه الفاتورة قديمة ولا تحتوي على تفاصيل الأصناف. يرجى إنشاء فاتورة مشتريات جديدة لتجربة المرتجعات.</td></tr>';
        container.style.display = 'block';
        footer.style.display = 'none';
        return;
    }

    invoice.items.forEach((item) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.qty}</td>
                <td><input type="number" class="return-qty" value="0" min="0" max="${item.qty}" data-price="${item.price}" data-item-id="${item.itemId}" oninput="calculateReturnTotal()" style="width:100%; text-align:center;"></td>
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

function savePurchaseReturn() {
    const invoiceId = parseInt(document.getElementById('return-invoice').value);
    const total = parseFloat(document.getElementById('return-total').textContent);
    
    if (total <= 0) return alert('يجب تحديد كمية مرتجعة أكبر من صفر.');

    const invoice = getPurchases().find(i => i.id === invoiceId);
    let returnItems = [];

    document.querySelectorAll('.return-qty').forEach(input => {
        const qty = parseFloat(input.value) || 0;
        if (qty > 0) {
            returnItems.push({
                itemId: parseInt(input.getAttribute('data-item-id')),
                qty: qty
            });
        }
    });

    // 1. إنقاص الكمية من المخزون
    let allItems = getItems();
    returnItems.forEach(ret => {
        let itemIndex = allItems.findIndex(i => i.id === ret.itemId);
        if(itemIndex !== -1) {
            allItems[itemIndex].qty -= ret.qty;
        }
    });
    saveItems(allItems);

    // 2. حفظ المرتجع
    const returns = getPurchaseReturns();
    const returnNumber = `PRET-${new Date().getFullYear()}-${String(returns.length + 1).padStart(4, '0')}`;
    returns.push({ id: Date.now(), returnNumber, invoiceId, supplierName: invoice.supplierName, date: new Date().toISOString().split('T')[0], total });
    savePurchaseReturns(returns);

    // 3. إنقاص رصيد المورد (لأننا ارجعنا له بضاعة، أصبحنا مدينين له بمبلغ أقل)
    updateSupplierBalance(invoice.supplierId, -total);

    // 4. القيد المحاسبي: (مدين: الموردون 2101 / دائن: المخزون 1104)
    const entries = getEntries();
    const today = new Date().toISOString().split('T')[0];
    const entryNumber = `JV-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    
    entries.push({
        id: Date.now(),
        entryNumber: entryNumber,
        date: today,
        description: `مرتجع مشتريات ${returnNumber} - المورد: ${invoice.supplierName}`,
        lines: [
            { accountCode: "2101", accountName: "الموردون (الذمم الدائنة)", debit: total, credit: 0 },
            { accountCode: "1104", accountName: "المخزون (البضاعة)", debit: 0, credit: total }
        ],
        totalDebit: total,
        totalCredit: total
    });

    saveEntries(entries);
    alert(`تم حفظ المرتجع ${returnNumber} بنجاح!\nتم خصم الكميات من المخزون وتوليد القيد.`);
    window.location.href = 'suppliers.html';
}
