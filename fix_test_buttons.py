import os
import re

print("🛠️ جاري إصلاح أزرار (البيانات التجريبية) لترسل البيانات للخادم...")

# 1. إصلاح ملف الموردين
sup_path = 'assets/js/suppliers.js'
if os.path.exists(sup_path):
    with open(sup_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    # استبدال دالة حقن الموردين لتقوم بالإرسال للخادم
    if 'syncSupplierToBackend' in js and 'injectTestSuppliers' in js:
        old_func = re.search(r'function injectTestSuppliers\(\) \{.*?\n\}\n', js, flags=re.DOTALL)
        if old_func:
            new_func = """
function injectTestSuppliers() {
    let suppliers = getSuppliers();
    if(suppliers.length > 0) {
        if(!confirm('لديك موردين بالفعل. هل تريد إضافة المزيد؟')) return;
    }

    const testData = [
        { name: "شركة الحاسبات المتقدمة", phone: "0501111111", balance: 0 },
        { name: "مؤسسة النور للتوريدات", phone: "0502222222", balance: 0 },
        { name: "مورد الأثاث المكتبي", phone: "0503333333", balance: 0 }
    ];

    testData.forEach((data, index) => {
        const code = `SUP-${String(suppliers.length + 1 + index).padStart(3, '0')}`;
        const newSupplier = { id: Date.now() + index, code, name: data.name, phone: data.phone, balance: data.balance };
        suppliers.push(newSupplier);
        
        // إرسال للخادم السحابي
        if (typeof syncSupplierToBackend === 'function') {
            syncSupplierToBackend(newSupplier);
        }
    });

    saveSuppliers(suppliers);
    renderSuppliers();
    alert('تم إضافة موردين تجريبيين بنجاح وحفظهم في السحابة!');
}
"""
            js = js.replace(old_func.group(0), new_func)
            with open(sup_path, 'w', encoding='utf-8') as f:
                f.write(js)
            print("✅ تم إصلاح زر الموردين التجريبيين.")

# 2. إصلاح ملف العملاء (إذا كان به زر مشابه)
cust_path = 'assets/js/customers.js'
if os.path.exists(cust_path):
    with open(cust_path, 'r', encoding='utf-8') as f:
        js = f.read()
    
    if 'syncCustomerToBackend' in js and 'injectTestCustomers' in js:
        old_func = re.search(r'function injectTestCustomers\(\) \{.*?\n\}\n', js, flags=re.DOTALL)
        if old_func:
            new_func = """
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
"""
            js = js.replace(old_func.group(0), new_func)
            with open(cust_path, 'w', encoding='utf-8') as f:
                f.write(js)
            print("✅ تم إصلاح زر العملاء التجريبيين.")

# 3. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=888888"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ تم تحديث الكاش لـ {count} ملف.")
