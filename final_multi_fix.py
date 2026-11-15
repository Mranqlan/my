import os
import re

print("🚑 بدء الإصلاح الجذري الشامل للاتصال بالخادم...")

# 1. إصلاح ملف database.js لضمان إرسال الهيدر في طلبات GET
db_path = 'assets/js/database.js'
with open(db_path, 'r', encoding='utf-8') as f:
    db_js = f.read()

# إزالة أي مسارات محلية متبقية
db_js = db_js.replace("http://localhost:5000", "")

# تحديث دالة المزامنة لإرسال الهيدر
apis = ['customers', 'suppliers', 'items', 'entries', 'sales_invoices', 'purchase_invoices']
for api in apis:
    old_fetch = f"fetch('/api/{api}')"
    new_fetch = f"fetch('/api/{api}', {{ headers: {{ 'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company' }} }})"
    db_js = db_js.replace(old_fetch, new_fetch)

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(db_js)
print("✅ 1. تم إصلاح جلب البيانات في database.js")

# 2. إصلاح ملف inventory.js لضمان إرسال الهيدر وحفظ الباركود
inv_path = 'assets/js/inventory.js'
with open(inv_path, 'r', encoding='utf-8') as f:
    inv_js = f.read()

inv_js = inv_js.replace("http://localhost:5000", "")

# التأكد من وجود دالة المزامنة وإرسال الهيدر
if 'syncItemToBackend' not in inv_js:
    sync_func = """
async function syncItemToBackend(item) {
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company'
            },
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
        if (response.ok) console.log('✅ تم حفظ الصنف في السحابة');
        else console.error('❌ فشل الحفظ في السحابة');
    } catch (error) { console.error('❌ خطأ في الاتصال:', error); }
}
"""
    inv_js = sync_func + "\n" + inv_js

with open(inv_path, 'w', encoding='utf-8') as f:
    f.write(inv_js)
print("✅ 2. تم إصلاح حفظ البيانات في inventory.js")

# 3. التأكد من أن صفحة الفاتورة تنتظر جلب البيانات
sales_path = 'assets/js/sales-invoices.js'
with open(sales_path, 'r', encoding='utf-8') as f:
    sales_js = f.read()

# التأكد من وجود await initBackendSync
if 'await window.initBackendSync()' not in sales_js:
    sales_js = sales_js.replace(
        "document.addEventListener('DOMContentLoaded', async () => {",
        "document.addEventListener('DOMContentLoaded', async () => {\n    if (typeof window.initBackendSync === 'function') { await window.initBackendSync(); }"
    )

with open(sales_path, 'w', encoding='utf-8') as f:
    f.write(sales_js)
print("✅ 3. تم إصلاح مزامنة صفحة فاتورة المبيعات.")

# 4. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=444333"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 4. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل الإصلاح الشامل! يرجى الرفع إلى GitHub.")
