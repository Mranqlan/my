import os
import re

print("🎨 جاري تنظيف تصميم صفحة الدخول (إزالة العناوين والأيقونات)...")

login_path = 'login.html'
with open(login_path, 'r', encoding='utf-8') as f:
    html = f.read()

# استبدال الجزء الخاص بحقل المستخدم
old_user_html = re.search(r'<div class="form-group">\s*<label>المستخدم</label>\s*<div class="input-wrapper">\s*<span class="input-icon">.*?</span>\s*<select id="login-user".*?</select>\s*</div>\s*</div>', html, flags=re.DOTALL)
if old_user_html:
    new_user_html = """<div class="form-group" style="margin-bottom: 20px;">
                <div class="input-wrapper">
                    <select id="login-user" class="form-control" style="padding: 18px 15px; text-align: center; font-size: 16px; font-weight: bold;" required>
                    </select>
                </div>
            </div>"""
    html = html.replace(old_user_html.group(0), new_user_html)

# استبدال الجزء الخاص بحقل كلمة المرور
old_pass_html = re.search(r'<div class="form-group">\s*<label>كلمة المرور</label>\s*<div class="input-wrapper">\s*<span class="input-icon">.*?</span>\s*<input type="password" id="login-pass".*?</div>\s*</div>', html, flags=re.DOTALL)
if old_pass_html:
    new_pass_html = """<div class="form-group" style="margin-bottom: 30px;">
                <div class="input-wrapper">
                    <input type="password" id="login-pass" class="form-control" placeholder="أدخل كلمة المرور..." style="padding: 18px 15px; text-align: center; font-size: 18px; letter-spacing: 2px;" required>
                </div>
            </div>"""
    html = html.replace(old_pass_html.group(0), new_pass_html)

# تحسين شكل القائمة المنسدلة
html = html.replace(".form-control {\n            width: 100%; padding: 15px 45px 15px 15px;", ".form-control {\n            width: 100%; padding: 15px;")

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ تم إزالة العناوين والأيقونات وتوسيط النصوص.")

# تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                h = f.read()
            h = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=999998"', h)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(h)
            count += 1
print(f"✅ تم تحديث الكاش.")
