import os
import re

print("👑 جاري تطبيق صلاحيات المدير العام (Super Admin) وتحديث المولد...")

# 1. تعديل صفحة تسجيل الدخول (login.html)
login_path = 'login.html'
with open(login_path, 'r', encoding='utf-8') as f:
    login_html = f.read()

# تعديل دالة handleLogin
old_login_js = re.search(r'function handleLogin\(e\) \{.*?\n        \}', login_html, flags=re.DOTALL)
if old_login_js:
    new_login_js = """
        function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            const errorDiv = document.getElementById('error-message');

            // دخول المدير العام المباشر (بدون تفعيل)
            if (username === 'admin' && pass === 'omran770136569') {
                const adminUser = { id: 1, username: "admin", fullName: "OMRAN AQLAN", role: "admin" };
                localStorage.setItem('onyx_current_user', JSON.stringify(adminUser));
                localStorage.setItem('onyx_license_valid', 'true'); // تخطي التفعيل
                window.location.href = '/pages/welcome.html';
                return;
            }

            // دخول المستخدمين العاديين
            try {
                const user = getUsers().find(u => u.username === username);
                if (user && user.password === pass) {
                    localStorage.setItem('onyx_current_user', JSON.stringify(user));
                    localStorage.removeItem('onyx_license_valid'); // يجب عليهم التفعيل
                    window.location.href = '/pages/activate.html';
                } else {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'كلمة المرور أو اسم المستخدم غير صحيح!';
                }
            } catch(err) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'حدث خطأ. يرجى المحاولة مرة أخرى.';
            }
        }
    """
    login_html = login_html.replace(old_login_js.group(0), new_login_js)

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(login_html)
print("✅ 1. تم تعديل صفحة الدخول: كلمة سر المدير omran770136569 تخطي التفعيل.")

# 2. تعديل صفحة التفعيل (activate.html) لتخطي المدير
activate_path = 'pages/activate.html'
with open(activate_path, 'r', encoding='utf-8') as f:
    activate_html = f.read()

if 'Super Admin Bypass' not in activate_html:
    bypass_script = """
    <script>
        // Super Admin Bypass
        document.addEventListener('DOMContentLoaded', () => {
            const user = JSON.parse(localStorage.getItem('onyx_current_user') || '{}');
            if (user.username === 'admin' || localStorage.getItem('onyx_license_valid') === 'true') {
                window.location.href = '/pages/welcome.html';
            }
        });
    </script>
    """
    activate_html = activate_html.replace('</body>', bypass_script + '\n</body>')
    with open(activate_path, 'w', encoding='utf-8') as f:
        f.write(activate_html)
print("✅ 2. تم تعديل صفحة التفعيل لتخطي المدير العام تلقائياً.")

# 3. تحديث سكربت توليد الأكواد (generate_codes.py) ليكون أكثر احترافية
generator_script = """import uuid
import sys
from backend.app import app, db
from backend.models import ActivationCode

def generate_codes(count=1):
    with app.app_context():
        print(f"⏳ جاري توليد {count} كود تفعيل في قاعدة بيانات Neon...")
        new_codes = []
        for _ in range(count):
            # توليد كود بشكل TS-XXXX-XXXX-XXXX
            raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
            formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
            
            # التأكد من عدم تكراره
            while ActivationCode.query.filter_by(code=formatted_code).first():
                raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
                formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
                
            new_code = ActivationCode(code=formatted_code, is_used=False)
            db.session.add(new_code)
            new_codes.append(formatted_code)
            
        db.session.commit()
        print("=" * 50)
        print("🎉 تم توليد الأكواد بنجاح وحفظها في السحابة! إليك الأكواد:")
        for code in new_codes:
            print(f"🔑 {code}")
        print("=" * 50)
        
        # إحصائية سريعة
        total_unused = ActivationCode.query.filter_by(is_used=False).count()
        print(f"📊 لديك الآن {total_unused} كود متاح للبيع (غير مستخدم).")

if __name__ == '__main__':
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    generate_codes(count)
"""

with open('generate_codes.py', 'w', encoding='utf-8') as f:
    f.write(generator_script)
print("✅ 3. تم تحديث سكربت توليد الأكواد ليحفظ في Neon ويطبع الإحصائيات.")

# تحديث الكاش
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=222222"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

print("🎉 اكتملت جميع التعديلات! يرجى الرفع إلى GitHub ثم توليد الأكواد.")
