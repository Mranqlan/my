import os
import re

print("🛠️ جاري إصلاح الباركود وظهور الأصناف في الفاتورة...")

# 1. إصلاح كود توليد الباركود وإرساله في inventory.js
inv_js_path = 'assets/js/inventory.js'
with open(inv_js_path, 'r', encoding='utf-8') as f:
    inv_js = f.read()

# إصلاح مشكلة توليد الباركود عندما يكون الحقل فارغاً
old_barcode_logic = "const barcode = barcodeInput ? barcodeInput.value.trim() : Math.floor(100000000000 + Math.random() * 900000000000).toString();"
new_barcode_logic = "const barcode = (barcodeInput && barcodeInput.value.trim() !== '') ? barcodeInput.value.trim() : Math.floor(100000000000 + Math.random() * 900000000000).toString();"
inv_js = inv_js.replace(old_barcode_logic, new_barcode_logic)

# التأكد من إرسال الباركود للخادم
if 'barcode: item.barcode' not in inv_js:
    inv_js = inv_js.replace(
        "body: JSON.stringify({\n                code: item.code,\n                name: item.name,",
        "body: JSON.stringify({\n                code: item.code,\n                name: item.name,\n                barcode: item.barcode,"
    )

with open(inv_js_path, 'w', encoding='utf-8') as f:
    f.write(inv_js)
print("✅ 1. تم إصلاح توليد الباركود في inventory.js")

# 2. إصلاح عرض الأصناف في الفاتورة والتحقق من البيانات
sales_js_path = 'assets/js/sales-invoices.js'
with open(sales_js_path, 'r', encoding='utf-8') as f:
    sales_js = f.read()

# إضافة طباعة في الكونسول لمعرفة الأصناف التي تصل
old_build = """function buildItemOptions(selectElement) {
    selectElement.innerHTML = '<option value="">-- اختر الصنف --</option>';
    try {
        getItems().forEach(item => {
            if (item.qty > 0) {"""
new_build = """function buildItemOptions(selectElement) {
    selectElement.innerHTML = '<option value="">-- اختر الصنف --</option>';
    try {
        const items = getItems();
        console.log('🔍 جلب الأصناف للفاتورة:', items); // رسالة تظهر في F12
        items.forEach(item => {
            if (parseFloat(item.qty) > 0) {"""
if old_build in sales_js:
    sales_js = sales_js.replace(old_build, new_build)

with open(sales_js_path, 'w', encoding='utf-8') as f:
    f.write(sales_js)
print("✅ 2. تم إصلاح عرض الأصناف وإضافة رسائل التتبع في sales-invoices.js")

# 3. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=777666"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 3. تم تحديث الكاش لـ {count} ملف.")
print("🎉 اكتمل الإصلاح! يرجى الرفع إلى GitHub.")
