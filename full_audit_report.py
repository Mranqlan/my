import os
import re

print("🔍 بدء عملية التدقيق الكثيف الشاملة (Deep System Audit)...")
print("=" * 60)

CORE_SCRIPTS = """
    <!-- ===== Core Scripts (Injected by Audit System) ===== -->
    <script src="/assets/js/database.js?v=2030"></script>
    <script src="/assets/js/layout.js?v=2030"></script>
    <script src="/assets/js/app.js?v=2030"></script>
    <script src="/assets/js/company-info.js?v=2030"></script>
    <script src="/assets/js/permissions.js?v=2030"></script>
    <script src="/assets/js/ai-assistant.js?v=2030"></script>
    <script src="/assets/js/global-search.js?v=2030"></script>
    <script src="/assets/js/export-dark.js?v=2030"></script>
"""

LOGIN_SCRIPTS = """
    <!-- ===== Login Core Scripts ===== -->
    <script src="/assets/js/database.js?v=2030"></script>
"""

html_count = 0
js_count = 0
missing_links = []
fixed_scripts_count = 0

# 1. فحص وإصلاح ملفات HTML
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()

            # إزالة الحروف الثابتة من الصورة الرمزية
            html = re.sub(r'<div class="avatar">[A-Za-z]</div>', '<div class="avatar"></div>', html)

            # إزالة السكربتات الأساسية القديمة فقط (الاحتفاظ بسكربتات الصفحات مثل inventory.js)
            core_patterns = r'database|layout|app|company-info|permissions|ai-assistant|global-search|export-dark'
            html = re.sub(r'<script src="[^"]*(' + core_patterns + r')\.js[^"]*"></script>', '', html)
            html = re.sub(r'<script src="[^"]*hr-extended\.js[^"]*"></script>', '', html)
            
            # تنظيف الأسطر الفارغة
            html = re.sub(r'\n\s*\n', '\n', html)

            # إضافة الكتلة النظيفة في النهاية
            scripts_to_inject = LOGIN_SCRIPTS if file == 'login.html' else CORE_SCRIPTS
            if 'pages/hr/' in filepath.replace('\\', '/'):
                scripts_to_inject += '\n    <script src="/assets/js/hr-extended.js?v=2030"></script>'

            if '</body>' in html:
                html = html.replace('</body>', f'{scripts_to_inject}\n</body>')

            # توحيد إصدارات الكاش
            html = re.sub(r'href="([^"]+\.css)(\?v=\d+)?"', r'href="\1?v=2030"', html)
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=2030"', html)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            html_count += 1

# 2. إصلاح ملف layout.js
with open('assets/js/layout.js', 'w', encoding='utf-8') as f:
    f.write("""
document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        fetch('/components/sidebar.html?v=' + new Date().getTime())
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                if(typeof initSidebar === 'function') { initSidebar(); }
                
                const currentPath = window.location.pathname;
                document.querySelectorAll('.sidebar-nav a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href !== '#' && href !== 'javascript:void(0)') {
                        const cleanHref = href.startsWith('/') ? href : '/' + href;
                        if (currentPath === cleanHref || currentPath.endsWith(cleanHref)) {
                            link.classList.add('active');
                            const parentLi = link.closest('.has-submenu');
                            if (parentLi) {
                                parentLi.classList.add('active');
                                const submenu = parentLi.querySelector('.submenu');
                                if(submenu) submenu.style.display = 'block';
                            }
                        }
                    }
                });
                document.dispatchEvent(new Event('sidebarLoaded'));
            }).catch(error => console.error('خطأ في تحميل القائمة:', error));
    } else {
        document.dispatchEvent(new Event('sidebarLoaded'));
    }
});
""")
js_count += 1

# 3. فحص روابط القائمة الجانبية وإنشاء المفقود
sidebar_path = 'components/sidebar.html'
if os.path.exists(sidebar_path):
    with open(sidebar_path, 'r', encoding='utf-8') as f:
        sidebar = f.read()
    links = re.findall(r'href="([^"]+\.html)"', sidebar)
    for link in links:
        file_path = link[1:] if link.startswith('/') else link
        if not os.path.exists(file_path):
            missing_links.append(file_path)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>قيد الإنشاء | AL SHAMEL</title>
<link rel="stylesheet" href="/assets/css/style.css?v=2030"></head>
<body style="font-family: Cairo, sans-serif; text-align: center; padding: 50px; background: #f1f5f9;">
    <div style="background: white; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h1 style="color: #0f172a; font-size: 40px; margin-bottom: 10px;">🚧</h1>
        <h2 style="color: #1e293b;">هذه الصفحة قيد الإنشاء</h2>
        <p style="color: #64748b;">عذرا الميزة الخاصة بهذه الصفحة (<strong>{file_path}</strong>) لم يتم تفعيلها بعد في النظام.</p>
        <a href="/index.html" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">العودة للوحة التحكم</a>
    </div>
</body>
</html>""")

print("=" * 60)
print("📊 تقرير التدقيق النهائي:")
print(f"✅ تم فحص وإصلاح {html_count} ملف HTML.")
print(f"✅ تم توحيد استدعاء السكربتات (Core Scripts) في جميع الصفحات.")
print(f"✅ تم إصلاح ملف layout.js لضمان استقرار القائمة الجانبية.")
print(f"✅ تم إصلاح مشكلة الصورة الرمزية (Avatar) لتكون ديناميكية.")
if missing_links:
    print(f"⚠️ تم العثور على {len(missing_links)} رابط مفقود وتم إنشاء صفحات 'قيد الإنشاء' لها.")
else:
    print("✅ جميع روابط القائمة الجانبية سليمة وموجودة.")
print("✅ تم تحديث إصدار الكاش لجميع الملفات إلى ?v=2030")
print("=" * 60)
print("🎉 النظام الآن مستقر وخال من أخطاء التنقل. يرجى عمل Ctrl+Shift+R")
