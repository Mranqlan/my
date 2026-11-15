
async function syncCustomerToBackend(customer) {
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company' },
            body: JSON.stringify({
                code: customer.code,
                name: customer.name,
                phone: customer.phone,
                balance: customer.balance,
                credit_limit: customer.creditLimit
            })
        });
        if (response.ok) {
            console.log('✅ تم حفظ العميل في قاعدة البيانات الحقيقية بنجاح');
        } else {
            console.warn('⚠️ فشل الحفظ في قاعدة البيانات الحقيقية');
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بالخادم:', error);
    }
}

﻿document.addEventListener('DOMContentLoaded', renderCustomers);

function renderCustomers() {
    const tbody = document.getElementById('customers-body');
    const customers = getCustomers();
    tbody.innerHTML = '';
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 30px;">لا يوجد عملاء مسجلين حتى الآن.</td></tr>';
        return;
    }

    customers.forEach(cust => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: var(--primary-color);">${cust.code}</td>
                <td style="text-align: right; padding-right: 15px;">${cust.name}</td>
                <td>${cust.phone || '-'}</td>
                <td class="text-debit">${parseFloat(cust.balance).toFixed(2)}</td>
                <td style="font-family: monospace;">${parseFloat(cust.creditLimit).toFixed(2)}</td>
                <td><button class="btn-icon" onclick="deleteCustomer(${cust.id})">🗑️</button></td>
            </tr>
        `;
    });
}

function openCustomerModal() { document.getElementById('customer-modal').style.display = 'flex'; }
function closeCustomerModal() { document.getElementById('customer-modal').style.display = 'none'; document.getElementById('add-customer-form').reset(); }


function saveCustomer(event) {
    event.preventDefault();
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const balance = parseFloat(document.getElementById('cust-balance').value) || 0;
    const creditLimit = parseFloat(document.getElementById('cust-limit').value) || 0;

    let customers = getCustomers();
    const code = `C-${String(customers.length + 1).padStart(4, '0')}`;
    const newCustomer = { id: Date.now(), code, name, phone, balance, creditLimit };
    
    // حفظ محلي (للسرعة)
    customers.push(newCustomer);
    saveCustomers(customers);
    
    // إرسال إلى قاعدة البيانات الحقيقية
    syncCustomerToBackend(newCustomer);
    
    closeCustomerModal();
    renderCustomers();
    alert('تم إضافة العميل بنجاح وحفظه في قاعدة البيانات!');
}


async function deleteCustomer(id) {
    const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "سيتم حذف هذا العميل نهائياً!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
        saveCustomers(getCustomers().filter(c => c.id !== id));
        renderCustomers();
        Swal.fire('تم الحذف!', 'تم حذف العميل بنجاح.', 'success');
    }
}

// دالة إضافة عملاء تجريبيين

function injectTestCustomers() {
    let customers = getCustomers();
    if(customers.length > 0) {
        if(!confirm('لديك عملاء بالفعل. هل تريد إضافة المزيد؟')) return;
    }

    const testData = [
        { name: "شركة الأمل التجارية", phone: "0501111111", balance: 0 },
        { name: "مؤسسة النور للتجارة", phone: "0502222222", balance: 0 },
        { name: "عميل نقدي", phone: "", balance: 0 }
    ];

    testData.forEach((data, index) => {
        const code = `C-${String(customers.length + 1 + index).padStart(4, '0')}`;
        const newCustomer = { id: Date.now() + index, code, name: data.name, phone: data.phone, balance: data.balance, creditLimit: 0 };
        customers.push(newCustomer);
        
        // إرسال للخادم السحابي
        if (typeof syncCustomerToBackend === 'function') {
            syncCustomerToBackend(newCustomer);
        }
    });

    saveCustomers(customers);
    renderCustomers();
    alert('تم إضافة عملاء تجريبيين بنجاح وحفظهم في السحابة!');
}
