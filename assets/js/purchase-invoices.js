
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('purchase-date').valueAsDate = new Date();
    
    if (typeof window.initBackendSync === 'function') {
        await window.initBackendSync();
    }
    
    loadPurchaseDropdowns();
    addRow();
});

function loadPurchaseDropdowns() {
    try {
        const supSelect = document.getElementById('purchase-supplier');
        supSelect.innerHTML = '<option value="">-- اختر المورد --</option>';
        getSuppliers().forEach(sup => {
            supSelect.innerHTML += `<option value="${sup.id}" data-name="${sup.name}">${sup.code} - ${sup.name}</option>`;
        });

        const branchSelect = document.getElementById('purchase-branch');
        branchSelect.innerHTML = '<option value="">-- اختر الفرع --</option>';
        getCostCenters().forEach(c => {
            branchSelect.innerHTML += `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`;
        });

        const whSelect = document.getElementById('purchase-warehouse');
        whSelect.innerHTML = '<option value="">-- اختر --</option>';
        getWarehouses().forEach(wh => {
            whSelect.innerHTML += `<option value="${wh.id}" data-name="${wh.name}">${wh.name}</option>`;
        });
    } catch(e) { console.error("خطأ في القوائم:", e); }
}

function addRow() {
    const tbody = document.getElementById('purchase-items-body');
    const tr = document.createElement('tr');
    let options = '<option value="">-- اختر الصنف --</option>';
    getItems().forEach(item => {
        options += `<option value="${item.id}" data-cost="${item.purchasePrice}" data-name="${item.name}">${item.code} - ${item.name}</option>`;
    });
    tr.innerHTML = `
        <td><select class="item-select" onchange="updateRow(this)" style="width:100%; padding:8px;">${options}</select></td>
        <td><input type="text" class="item-qty" value="1" onchange="calcTotal()" onfocus="this.select()" style="width:100%; text-align:center;"></td>
        <td><input type="text" class="item-price" onchange="calcTotal()" onfocus="this.select()" style="width:100%; text-align:center;"></td>
        <td><button class="btn-delete" onclick="this.parentElement.parentElement.remove(); calcTotal();">حذف</button></td>
    `;
    tbody.appendChild(tr);
}

function updateRow(select) {
    const row = select.parentElement.parentElement;
    if(select.value) row.querySelector('.item-price').value = select.options[select.selectedIndex].getAttribute('data-cost');
    calcTotal();
}

function calcTotal() {
    let sub = 0;
    document.querySelectorAll('#purchase-items-body tr').forEach(row => {
        sub += ((parseFloat(row.querySelector('.item-qty').value)||0) * (parseFloat(row.querySelector('.item-price').value)||0));
    });
    const vatRate = parseFloat(document.getElementById('vat-rate').value) || 0;
    const vatAmt = sub * (vatRate / 100);
    document.getElementById('subtotal').textContent = sub.toFixed(2);
    document.getElementById('vat-amount').textContent = vatAmt.toFixed(2);
    document.getElementById('purchase-total').textContent = (sub + vatAmt).toFixed(2);
    return { sub, vatAmt, grand: sub + vatAmt };
}

async function saveInvoice() {
    Swal.fire({ icon: 'info', title: 'تم الحفظ (تجريبي)', confirmButtonColor: '#10b981' });
}
