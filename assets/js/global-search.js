// ==========================================
// البحث الشامل الذكي (Global Search) - ONYX PRO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;

    // تحسين شكل حاوية البحث
    const searchBox = searchInput.parentElement;
    searchBox.style.position = 'relative';

    // إنشاء قائمة النتائج المنسدلة
    const dropdown = document.createElement('div');
    dropdown.id = 'global-search-dropdown';
    dropdown.style.cssText = `
        position: absolute; top: 105%; left: 0; right: 0; background: white;
        border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        max-height: 400px; overflow-y: auto; z-index: 999999;
        display: none; border: 1px solid #e2e8f0; overflow: hidden;
    `;
    searchBox.appendChild(dropdown);

    // الاستماع للكتابة
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 1) {
            dropdown.style.display = 'none';
            return;
        }

        const results = performSearch(query);
        renderSearchResults(results, query);
    });

    // إخفاء القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // إظهار القائمة عند التركيز على الحقل
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            dropdown.style.display = 'block';
        }
    });

    function performSearch(query) {
        let results = [];
        const customers = getCustomers ? getCustomers() : [];
        const suppliers = getSuppliers ? getSuppliers() : [];
        const invoices = getInvoices ? getInvoices() : [];
        const purchases = getPurchases ? getPurchases() : [];
        const items = getItems ? getItems() : [];
        const employees = getEmployees ? getEmployees() : [];

        // 1. البحث في العملاء
        customers.forEach(c => {
            if ((c.name && c.name.toLowerCase().includes(query)) || (c.code && c.code.toLowerCase().includes(query))) {
                results.push({ type: 'عميل', title: c.name, subtitle: `كود: ${c.code} | رصيد: ${parseFloat(c.balance).toFixed(2)}`, icon: '👤', link: '/pages/commercial/customers.html' });
            }
        });

        // 2. البحث في الموردين
        suppliers.forEach(s => {
            if ((s.name && s.name.toLowerCase().includes(query)) || (s.code && s.code.toLowerCase().includes(query))) {
                results.push({ type: 'مورد', title: s.name, subtitle: `كود: ${s.code} | رصيد: ${parseFloat(s.balance).toFixed(2)}`, icon: '🏭', link: '/pages/commercial/suppliers.html' });
            }
        });

        // 3. البحث في فواتير المبيعات
        invoices.forEach(i => {
            if ((i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(query)) || (i.customerName && i.customerName.toLowerCase().includes(query))) {
                results.push({ type: 'فاتورة مبيعات', title: i.invoiceNumber, subtitle: `العميل: ${i.customerName} | الإجمالي: ${parseFloat(i.total).toFixed(2)}`, icon: '🧾', link: '/pages/commercial/invoices-list.html' });
            }
        });

        // 4. البحث في فواتير المشتريات
        purchases.forEach(p => {
            if ((p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(query)) || (p.supplierName && p.supplierName.toLowerCase().includes(query))) {
                results.push({ type: 'فاتورة مشتريات', title: p.invoiceNumber, subtitle: `المورد: ${p.supplierName} | الإجمالي: ${parseFloat(p.total).toFixed(2)}`, icon: '🛒', link: '/pages/commercial/purchases-list.html' });
            }
        });

        // 5. البحث في الأصناف
        items.forEach(item => {
            if ((item.name && item.name.toLowerCase().includes(query)) || (item.code && item.code.toLowerCase().includes(query))) {
                results.push({ type: 'صنف', title: item.name, subtitle: `كود: ${item.code} | متوفر: ${item.qty}`, icon: '📦', link: '/pages/inventory.html' });
            }
        });

        // 6. البحث في الموظفين
        employees.forEach(emp => {
            if ((emp.name && emp.name.toLowerCase().includes(query)) || (emp.code && emp.code.toLowerCase().includes(query))) {
                results.push({ type: 'موظف', title: emp.name, subtitle: `كود: ${emp.code} | الوظيفة: ${emp.jobTitle || 'غير محدد'}`, icon: '👨💼', link: '/pages/hr/employees.html' });
            }
        });

        return results.slice(0, 8); // حد أقصى 8 نتائج
    }

    function renderSearchResults(results, query) {
        if (results.length === 0) {
            dropdown.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b; font-size: 14px;">لا توجد نتائج مطابقة لـ "${query}"</div>`;
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = '';
        results.forEach(res => {
            const item = document.createElement('a');
            item.href = res.link;
            item.style.cssText = `
                display: flex; align-items: center; padding: 12px 15px;
                text-decoration: none; color: #1e293b; border-bottom: 1px solid #f1f5f9;
                transition: background 0.2s; gap: 12px;
            `;
            item.onmouseover = () => item.style.background = '#f8fafc';
            item.onmouseout = () => item.style.background = 'transparent';
            
            item.innerHTML = `
                <div style="font-size: 22px; width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; background: #f1f5f9; border-radius: 8px;">${res.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 14px; color: #0f172a;">${res.title}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${res.subtitle}</div>
                </div>
                <div style="font-size: 10px; background: #e2e8f0; color: #475569; padding: 3px 8px; border-radius: 12px; font-weight: bold;">${res.type}</div>
            `;
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    }
});
