import os
import re

print("🚑 بدء الإصلاح الشامل للاتصال بالخادم وحفظ الأصناف...")

js_files = []
for root, dirs, files in os.walk('assets/js'):
    for file in files:
        if file.endswith('.js'):
            js_files.append(os.path.join(root, file))

for filepath in js_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إزالة المسار المحلي واستبداله بمسار نسبي
    content = content.replace("http://localhost:5000", "")

    # 2. إضافة X-Tenant-ID لجميع طلبات fetch
    # نبحث عن أي fetch ونضيف الهيدر إذا لم يكن موجوداً
    if 'X-Tenant-ID' not in content and 'fetch(' in content:
        content = content.replace(
            "headers: { 'Content-Type': 'application/json' }",
            "headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company' }"
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ 1. تم إصلاح مسارات الاتصال وإضافة معرف الشركة في جميع الملفات.")

# 3. إصلاح خاص لملف inventory.js للتأكد من حفظ الباركود
inv_path = 'assets/js/inventory.js'
with open(inv_path, 'r', encoding='utf-8') as f:
    inv_js = f.read()

if 'barcode: barcode' not in inv_js:
    inv_js = inv_js.replace(
        "const newItem = {\n        id: Date.now(),\n        code: code,\n        name: name,",
        "const newItem = {\n        id: Date.now(),\n        code: code,\n        name: name,\n        barcode: barcode,"
    )
    inv_js = inv_js.replace(
        "body: JSON.stringify({\n                code: item.code,\n                name: item.name,",
        "body: JSON.stringify({\n                code: item.code,\n                name: item.name,\n                barcode: item.barcode,"
    )
    with open(inv_path, 'w', encoding='utf-8') as f:
        f.write(inv_js)
print("✅ 2. تم تأكيد إرسال الباركود في inventory.js.")

# 4. تحديث الكاش في جميع الصفحات
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=555111"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 3. تم تحديث الكاش لـ {count} صفحة.")
print("=" * 60)
print("🎉 اكتمل الإصلاح الشامل! يرجى الرفع إلى GitHub.")
