import os
import re

print("🎨 جاري ترقية نوافذ التأكيد (confirm) إلى SweetAlert2...")

# 1. تحديث ملف العملاء (customers.js)
cust_path = 'assets/js/customers.js'
if os.path.exists(cust_path):
    with open(cust_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # استبدال دالة الحذف بنسخة تستخدم SweetAlert2
    old_delete = re.search(r'function deleteCustomer\(id\) \{.*?\n\}\n', js, flags=re.DOTALL)
    if old_delete:
        new_delete = """
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
"""
        js = js.replace(old_delete.group(0), new_delete)
        with open(cust_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print("✅ تم ترقية نوافذ التأكيد في صفحة العملاء.")

# 2. تحديث ملف الموردين (suppliers.js)
sup_path = 'assets/js/suppliers.js'
if os.path.exists(sup_path):
    with open(sup_path, 'r', encoding='utf-8') as f:
        js = f.read()

    old_delete = re.search(r'function deleteSupplier\(id\) \{.*?\n\}\n', js, flags=re.DOTALL)
    if old_delete:
        new_delete = """
async function deleteSupplier(id) {
    const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "سيتم حذف هذا المورد نهائياً!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
        saveSuppliers(getSuppliers().filter(s => s.id !== id));
        renderSuppliers();
        Swal.fire('تم الحذف!', 'تم حذف المورد بنجاح.', 'success');
    }
}
"""
        js = js.replace(old_delete.group(0), new_delete)
        with open(sup_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print("✅ تم ترقية نوافذ التأكيد في صفحة الموردين.")

# 3. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=777777"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ تم تحديث الكاش لـ {count} ملف.")
