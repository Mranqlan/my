import os
import re

print("🛠️ جاري إصلاح مشكلة ظهور الأصناف والباركود...")

# 1. إصلاح دالة عرض الأصناف في فاتورة المبيعات
sales_path = 'assets/js/sales-invoices.js'
with open(sales_path, 'r', encoding='utf-8') as f:
    sales_js = f.read()

# استبدال دالة buildItemOptions لتعرض كل الأصناف بغض النظر عن المستودع
new_build_func = """
function buildItemOptions(selectElement) {
    selectElement.innerHTML = '<option value="">-- اختر الصنف --</option>';
    try {
        getItems().forEach(item => {
            if (item.qty > 0) {
                selectElement.innerHTML += `<option value="${item.id}" data-price="${item.salePrice}" data-cost="${item.purchasePrice}" data-qty="${item.qty}" data-name="${item.name}">${item.code} - ${item.name} (متوفر: ${item.qty})</option>`;
            }
        });
    } catch(e) { console.error("خطأ في الأصناف:", e); }
}
"""

# استبدال الدالة القديمة
sales_js = re.sub(r'function buildItemOptions\(selectElement\) \{.*?\n\}\n', new_build_func, sales_js, flags=re.DOTALL)
with open(sales_path, 'w', encoding='utf-8') as f:
    f.write(sales_js)
print("✅ 1. تم إصلاح عرض الأصناف في فاتورة المبيعات.")

# 2. التأكد من حقل الباركود في صفحة المخزون
inv_path = 'pages/inventory.html'
with open(inv_path, 'r', encoding='utf-8') as f:
    inv_html = f.read()

if 'id="item-barcode"' not in inv_html:
    inv_html = inv_html.replace(
        '<div class="form-group">\n                        <label>المستودع</label>',
        '<div class="form-group" style="margin-bottom: 15px;">\n                        <label>الباركود (اتركه فارغاً للتوليد التلقائي)</label>\n                        <input type="text" id="item-barcode" placeholder="مثال: 123456789012">\n                    </div>\n                    <div class="form-group">\n                        <label>المستودع</label>'
    )
    with open(inv_path, 'w', encoding='utf-8') as f:
        f.write(inv_html)
    print("✅ 2. تم التأكد من وجود حقل الباركود في صفحة المخزون.")

# 3. التأكد من إرسال الباركود في دالة الحفظ (inventory.js)
inv_js_path = 'assets/js/inventory.js'
with open(inv_js_path, 'r', encoding='utf-8') as f:
    inv_js = f.read()

if 'item-barcode' not in inv_js:
    inv_js = inv_js.replace(
        "const purchase = parseFloat(document.getElementById('item-purchase').value) || 0;",
        "const barcodeInput = document.getElementById('item-barcode');\n    const barcode = barcodeInput ? barcodeInput.value.trim() : Math.floor(100000000000 + Math.random() * 900000000000).toString();\n    const purchase = parseFloat(document.getElementById('item-purchase').value) || 0;"
    )
    inv_js = inv_js.replace(
        "const newItem = {\n        id: Date.now(),\n        code: code,\n        name: name,\n        purchasePrice: purchase,",
        "const newItem = {\n        id: Date.now(),\n        code: code,\n        name: name,\n        barcode: barcode,\n        purchasePrice: purchase,"
    )
    with open(inv_js_path, 'w', encoding='utf-8') as f:
        f.write(inv_js)
    print("✅ 3. تم إصلاح دالة حفظ الصنف لتشمل الباركود.")

# 4. تحديث الكاش
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=999000"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

print("🎉 اكتملت الإصلاحات! يرجى عمل Ctrl+Shift+R")
