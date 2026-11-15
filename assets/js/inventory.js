
async function syncItemToBackend(item) {
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: item.code,
                name: item.name,
                barcode: item.barcode,
                purchase_price: item.purchasePrice,
                sale_price: item.salePrice,
                qty: item.qty,
                warehouse_name: item.warehouseName
            })
        });
        if (response.ok) console.log('✅ تم حفظ الصنف في قاعدة البيانات الحقيقية');
        else console.error('❌ فشل الخادم في حفظ الصنف');
    } catch (error) {
        console.error('❌ تعذر الاتصال بالخادم الخلفي:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderItems();
});



function renderItems() {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const items = getItems();
    tbody.innerHTML = '';
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 30px;">لا توجد أصناف مسجلة حتى الآن.</td></tr>';
        return;
    }

    items.forEach(item => {
        let qtyClass = item.qty > 0 ? 'text-success' : 'text-danger';
        let whName = item.warehouseName || 'المستودع الرئيسي';
        
        let barcodeHTML = '';
        if (item.barcode) {
            barcodeHTML = `<div style="display:flex; align-items:center; gap:5px;">
                <span style="font-family: monospace; font-weight:700;">${item.barcode}</span>
                <button type="button" onclick="printBarcode(${item.id})" style="background:#e2e8f0; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;" title="طباعة باركود">🖨️</button>
            </div>`;
        } else {
            barcodeHTML = `<span style="color:#ef4444; font-size:11px;">غير مسجل</span>`;
        }
        
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: var(--primary-color);">${item.code}</td>
                <td style="text-align: right; padding-right: 15px;">${item.name}</td>
                <td>${barcodeHTML}</td>
                <td>${parseFloat(item.purchasePrice).toFixed(2)}</td>
                <td>${parseFloat(item.salePrice).toFixed(2)}</td>
                <td class="${qtyClass}" style="font-weight: bold;">${item.qty}</td>
                <td>${whName}</td>
                <td>
                    <button class="btn-icon" title="حذف" onclick="deleteItem(${item.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}


function openItemModal() {
    document.getElementById('item-modal').style.display = 'flex';
    document.getElementById('add-item-form').reset();
    
    // تعبئة قائمة المستودعات
    const whSelect = document.getElementById('item-warehouse');
    if (whSelect) {
        whSelect.innerHTML = '';
        const warehouses = getWarehouses();
        
        if (warehouses.length === 0) {
            whSelect.innerHTML = '<option value="1">المستودع الرئيسي (افتراضي)</option>';
        } else {
            warehouses.forEach(wh => {
                whSelect.innerHTML += `<option value="${wh.id}" data-name="${wh.name}">${wh.name}</option>`;
            });
        }
    }
}

function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
    document.getElementById('add-item-form').reset();
}

function saveItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('item-name').value.trim();
    const purchase = parseFloat(document.getElementById('item-purchase').value) || 0;
    const sale = parseFloat(document.getElementById('item-sale').value) || 0;
    const qty = parseInt(document.getElementById('item-qty').value) || 0;
    
    const whSelect = document.getElementById('item-warehouse');
    const warehouseId = whSelect ? parseInt(whSelect.value) : 1;
    const warehouseName = whSelect && whSelect.selectedIndex !== -1 ? whSelect.options[whSelect.selectedIndex].getAttribute('data-name') : 'المستودع الرئيسي';

    let items = getItems();
    const nextId = items.length + 1;
    const code = `ITM-${String(nextId).padStart(4, '0')}`;

    // توليد باركود تلقائي إذا لم يتم إدخاله (12 رقم)
    const barcodeInput = document.getElementById('item-barcode');
    const barcode = (barcodeInput && barcodeInput.value.trim() !== '') ? barcodeInput.value.trim() : Math.floor(100000000000 + Math.random() * 900000000000).toString();

    const newItem = {
        id: Date.now(),
        code: code,
        name: name,
        barcode: barcode,
        purchasePrice: purchase,
        salePrice: sale,
        qty: qty,
        warehouseId: warehouseId,
        warehouseName: warehouseName || 'المستودع الرئيسي'
    };

    items.push(newItem);
    saveItems(items);
    
    // إرسال للخادم في الخلفية
    syncItemToBackend(newItem);
    closeItemModal();
    renderItems();
    Swal.fire({ icon: 'info', title: 'تم إضافة الصنف بنجاح!', confirmButtonColor: '#10b981' });
}

function deleteItem(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف')) return;
    let items = getItems().filter(i => i.id !== id);
    saveItems(items);
    renderItems();
}



// دالة توليد باركود لجميع الأصناف التي لا تملك باركود
function generateMissingBarcodes() {
    let items = getItems();
    let count = 0;
    
    items.forEach(item => {
        if (!item.barcode) {
            // توليد 12 رقم عشوائي كباركود
            item.barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
            count++;
        }
    });
    
    if (count > 0) {
        saveItems(items);
        renderItems(); // إعادة رسم الجدول
        alert(`✅ تم توليد باركود لـ ${count} صنف بنجاح!`);
    } else {
        Swal.fire({ icon: 'info', title: 'جميع الأصناف تملك باركود بالفعل.', confirmButtonColor: '#10b981' });
    }
}

function printBarcode(id) {
    const item = getItems().find(i => i.id == id);
    if (!item || !item.barcode) return Swal.fire({ icon: 'info', title: 'هذا الصنف لا يملك باركود', confirmButtonColor: '#10b981' });
    
    // تعبئة البيانات في النافذة
    document.getElementById('barcode-item-name').textContent = item.name;
    document.getElementById('barcode-text').textContent = item.barcode;
    
    // إظهار النافذة أولا (مهم جدا لكي تعمل مكتبة الرسم)
    document.getElementById('barcode-modal').style.display = 'flex';
    
    // استدعاء مكتبة الرسم بعد ظهور النافذة
    setTimeout(() => {
        try {
            JsBarcode("#barcode-svg", item.barcode, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 70,
                displayValue: false
            });
        } catch(e) {
            console.error('Barcode Error:', e);
            Swal.fire({ icon: 'info', title: 'حدث خطأ في توليد الباركود. تأكد من اتصالك بالإنترنت.', confirmButtonColor: '#10b981' });
        }
    }, 100);
}
