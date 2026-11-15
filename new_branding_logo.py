import os
import re

print("🎨 جاري تصميم الشعار التجاري الجديد (TAIZ SOFT)...")

# 1. تحديث ملف sidebar.html بالشعار الجديد
sidebar_path = 'components/sidebar.html'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar = f.read()

new_header = """
<div class="sidebar-header" style="padding: 20px 15px;">
    <div class="logo-box" style="background: transparent; box-shadow: none; width: 50px; height: 50px;">
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                </linearGradient>
            </defs>
            <!-- الشكل السداسي -->
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="url(#brandGrad)" stroke-width="6" stroke-linejoin="round"/>
            <!-- حرف T -->
            <path d="M30 30 L70 30 M50 30 L50 75" stroke="url(#brandGrad)" stroke-width="8" stroke-linecap="round"/>
            <!-- حرف S المتداخل -->
            <path d="M65 45 C65 35, 55 35, 50 40 C45 45, 55 55, 50 60 C45 65, 35 60, 35 55" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        </svg>
    </div>
    <div class="logo-text" style="display: flex; flex-direction: column; justify-content: center; margin-right: 10px;">
        <h2 style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff; margin: 0; text-transform: uppercase;">
            TAIZ <span style="color: #10b981;">SOFT</span>
        </h2>
        <span class="logo-subtitle" style="font-family: 'Noto Naskh Arabic', sans-serif; font-size: 12px; letter-spacing: 0px; color: #94a3b8; font-weight: 700; margin-top: 2px;">
            تعز سوفت | Enterprise ERP
        </span>
    </div>
</div>
"""

# استبدال الهيدر القديم بالجديد
sidebar = re.sub(r'<div class="sidebar-header">.*?</div>\s*</div>\s*<nav', new_header + '\n<nav', sidebar, flags=re.DOTALL)

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar)
print("✅ 1. تم تحديث شعار القائمة الجانبية (TAIZ SOFT).")

# 2. تعديل CSS ليتناسب مع الشعار الجديد
css_path = 'assets/css/sidebar.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# إزالة أي خلفية أو ظل عن مربع الشعار القديم
css = css.replace("background: linear-gradient(135deg, #10b981, #059669) !important;", "background: transparent !important;")
css = css.replace("box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;", "box-shadow: none !important;")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("✅ 2. تم تحديث تنسيقات الشعار في CSS.")

# 3. تحديث الكاش لجميع الصفحات
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=888888"', html)
            html = re.sub(r'href="([^"]+\.css)(\?v=\d+)?"', r'href="\1?v=888888"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 3. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل تصميم العلامة التجارية! يرجى عمل Ctrl+Shift+R")
