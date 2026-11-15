
document.addEventListener('DOMContentLoaded', renderSuppliers);

function renderSuppliers() {
    const tbody = document.getElementById('suppliers-body');
    if (!tbody) return;
    const suppliers = getSuppliers();
    tbody.innerHTML = '';
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 30px;">لا يوجد موردين مسجلين حتى الآن.</td></tr>';
        return;
    }

    suppliers.forEach(sup => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: var(--primary-color);">${sup.code}</td>
                <td style="text-align: right; padding-right: 15px;">${sup.name}</td>
                <td>${sup.phone || '-'}</td>
                <td class="text-credit">${parseFloat(sup.balance || 0).toFixed(2)}</td>
                <td><button class="btn-icon" onclick="deleteSupplier(${sup.id})">🗑️</button></td>
            </tr>
        `;
    });
}

function openSupplierModal() { document.getElementById('supplier-modal').style.display = 'flex'; }
function closeSupplierModal() { document.getElementById('supplier-modal').style.display = 'none'; document.getElementById('add-supplier-form').reset(); }

async function syncSupplierToBackend(supplier) {
    try {
        const response = await fetch('/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: supplier.code,
                name: supplier.name,
                phone: supplier.phone,
                balance: supplier.balance
            })
        });
        if (response.ok) {
            console.log('✅ تم حفظ المورد في قاعدة البيانات الحقيقية');
        } else {
            console.error('❌ فشل الخادم في الحفظ:', await response.text());
        }
    } catch (error) {
        console.error('❌ تعذر الاتصال بالخادم الخلفي:', error);
    }
}

function saveSupplier(event) {
    event.preventDefault();
    try {
        const name = document.getElementById('sup-name').value.trim();
        const phone = document.getElementById('sup-phone').value.trim();
        const balance = parseFloat(document.getElementById('sup-balance').value) || 0;

        let suppliers = getSuppliers();
        const code = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
        
        const newSupplier = { 
            id: Date.now(), 
            code: code, 
            name: name, 
            phone: phone, 
            balance: balance 
        };
        
        suppliers.push(newSupplier);
        saveSuppliers(suppliers);
        
        closeSupplierModal();
        renderSuppliers();
        
        // إرسال للخادم في الخلفية
        syncSupplierToBackend(newSupplier);

        alert('تم إضافة المورد وحفظه بنجاح!');
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        alert('حدث خطأ غير متوقع أثناء الحفظ. يرجى فتح الكونسول (F12) لمعرفة السبب.');
    }
}

function deleteSupplier(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المورد')) return;
    saveSuppliers(getSuppliers().filter(s => s.id !== id));
    renderSuppliers();
}

function injectTestSuppliers() {
    let suppliers = getSuppliers();
    if(suppliers.length > 0) {
        if(!confirm('لديك موردين بالفعل. هل تريد إضافة المزيد')) return;
    }
    const testData = [
        { name: "شركة الحاسبات المتقدمة", phone: "0501111111", balance: 0 },
        { name: "مؤسسة النور للتوريدات", phone: "0502222222", balance: 0 },
        { name: "مورد الأثاث المكتبي", phone: "0503333333", balance: 0 }
    ];
    testData.forEach((data, index) => {
        const code = `SUP-${String(suppliers.length + 1 + index).padStart(3, '0')}`;
        suppliers.push({ id: Date.now() + index, code, name: data.name, phone: data.phone, balance: data.balance });
    });
    saveSuppliers(suppliers);
    renderSuppliers();
    alert('تم إضافة موردين تجريبيين بنجاح!');
}
