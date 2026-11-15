import os
import re

print("🎨 بدء التحسينات النهائية للواجهة (UX & Loading Screen)...")

# 1. تحديث layout.js لإضافة شاشة تحميل تلقائية
layout_path = 'assets/js/layout.js'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_js = f.read()

loading_script = """
// إضافة شاشة تحميل عند فتح النظام
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) return;
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f8fafc; z-index: 999999; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Noto Naskh Arabic', sans-serif;">
            <div style="width: 60px; height: 60px; border: 5px solid #e2e8f0; border-top: 5px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h2 style="margin-top: 20px; color: #0f172a; font-weight: bold; font-size: 20px;">جاري تحميل البيانات من السحابة...</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 10px;">قد يستغرق هذا الأمر بضع ثوانٍ إذا كان الخادم في وضع النوم.</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;
    document.body.appendChild(loader);

    // إخفاء الشاشة بعد 3 ثوانٍ كحد أقصى (حتى لو تأخر الخادم)
    setTimeout(() => {
        const l = document.getElementById('global-loader');
        if (l) l.style.display = 'none';
    }, 4000);
});
"""
if 'global-loader' not in layout_js:
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(loading_script + "\n" + layout_js)
    print("✅ 1. تم إضافة شاشة التحميل إلى layout.js")

# 2. ترقية باقي الملفات لتستخدم SweetAlert
js_files = ['assets/js/inventory.js', 'assets/js/sales-invoices.js', 'assets/js/purchase-invoices.js', 'assets/js/journal-entries.js']
for filepath in js_files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        # استبدال alert بـ Swal.fire
        content = re.sub(r"alert\('([^']*)'\);", r"Swal.fire({ icon: 'info', title: '\1', confirmButtonColor: '#10b981' });", content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
print("✅ 2. تم ترقية الإشعارات في باقي الملفات.")

# 3. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=111111"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1
print(f"✅ 3. تم تحديث الكاش لـ {count} ملف.")
