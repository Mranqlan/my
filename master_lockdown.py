import os
import re

print("🔒 جاري تطبيق نظام القفل الشامل (Master Key Only)...")

# 1. تعديل صفحة الدخول (login.html) - إجبار الجميع على التفعيل
login_path = 'login.html'
with open(login_path, 'r', encoding='utf-8') as f:
    login_html = f.read()

# استبدال دالة الدخول لتوجه الجميع لشاشة التفعيل
old_login_js = re.search(r'function handleLogin\(e\) \{.*?\n        \}', login_html, flags=re.DOTALL)
if old_login_js:
    new_login_js = """
        function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            const errorDiv = document.getElementById('error-message');

            try {
                const user = getUsers().find(u => u.username === username);
                // التحقق من كلمة المرور (مع دعم admin / 123456 كاحتياط)
                if ((user && user.password === pass) || (username === 'admin' && pass === '123456')) {
                    if (!user) {
                        // إذا كان admin الافتراضي
                        localStorage.setItem('onyx_current_user', JSON.stringify({ id: 1, username: "admin", fullName: "OMRAN AQLAN", role: "admin" }));
                    } else {
                        localStorage.setItem('onyx_current_user', JSON.stringify(user));
                    }
                    // إزالة أي تفعيل سابق، وإجباره على شاشة التفعيل
                    localStorage.removeItem('onyx_license_valid');
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
print("✅ 1. تم إجبار جميع المستخدمين على المرور بشاشة التفعيل.")

# 2. تعديل شاشة التفعيل (activate.html) - إضافة المفتاح السري
activate_path = 'pages/activate.html'
with open(activate_path, 'r', encoding='utf-8') as f:
    activate_html = f.read()

# تعديل دالة التفعيل في الجافاسكريبت
old_activate_js = re.search(r'async function activateSystem\(e\) \{.*?\n        \}', activate_html, flags=re.DOTALL)
if old_activate_js:
    new_activate_js = """
        async function activateSystem(e) {
            e.preventDefault();
            const code = document.getElementById('activation-code').value.trim();
            const btn = document.getElementById('btn-activate');
            const errDiv = document.getElementById('error-msg');
            const sucDiv = document.getElementById('success-msg');
            
            btn.textContent = 'جاري التحقق...';
            btn.disabled = true;
            errDiv.style.display = 'none';
            
            const user = JSON.parse(localStorage.getItem('onyx_current_user') || '{}');
            const username = user.username || 'admin';

            // 🔑 المفتاح السري للمدير العام
            if (code === 'omran770136569') {
                sucDiv.style.display = 'block';
                sucDiv.textContent = 'مرحباً بك أيها المدير. جاري الدخول...';
                localStorage.setItem('onyx_license_valid', 'true');
                setTimeout(() => {
                    window.location.href = '/pages/welcome.html';
                }, 1000);
                return;
            }

            // التحقق من أكواد العملاء عبر قاعدة البيانات
            try {
                const response = await fetch('/api/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code, username: username })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    sucDiv.style.display = 'block';
                    sucDiv.textContent = data.message;
                    localStorage.setItem('onyx_license_valid', 'true');
                    setTimeout(() => {
                        window.location.href = '/pages/welcome.html';
                    }, 1500);
                } else {
                    errDiv.style.display = 'block';
                    errDiv.textContent = data.message;
                    btn.textContent = 'تفعيل النظام الآن 🚀';
                    btn.disabled = false;
                }
            } catch (error) {
                errDiv.style.display = 'block';
                errDiv.textContent = 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.';
                btn.textContent = 'تفعيل النظام الآن 🚀';
                btn.disabled = false;
            }
        }
    """
    activate_html = activate_html.replace(old_activate_js.group(0), new_activate_js)

# إزالة أي سكربت تخطي للمدير تم إضافته سابقاً
activate_html = activate_html.replace("""<script>
        // Super Admin Bypass
        document.addEventListener('DOMContentLoaded', () => {
            const user = JSON.parse(localStorage.getItem('onyx_current_user') || '{}');
            if (user.username === 'admin' || localStorage.getItem('onyx_license_valid') === 'true') {
                window.location.href = '/pages/welcome.html';
            }
        });
    </script>""", "")

with open(activate_path, 'w', encoding='utf-8') as f:
    f.write(activate_html)
print("✅ 2. تم إضافة المفتاح السري omran770136569 إلى شاشة التفعيل.")

# 3. إضافة الحماية لجميع الصفحات (في layout.js)
layout_path = 'assets/js/layout.js'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_js = f.read()

# إضافة فحص التفعيل قبل تحميل القائمة
guard_script = """
    // 🔒 فحص ترخيص النظام (License Guard)
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('login.html') || currentPath.includes('activate.html');
    
    if (!isPublicPage && localStorage.getItem('onyx_license_valid') !== 'true') {
        window.location.href = '/pages/activate.html';
    }
"""
if 'License Guard' not in layout_js:
    layout_js = guard_script + "\n" + layout_js
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(layout_js)
print("✅ 3. تم إضافة حماية للنظام لطرد غير المفعّلين إلى شاشة التفعيل.")

# 4. تحديث الخادم (app.py) لقبول المفتاح السري أيضاً
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

if "code_str == 'omran770136569'" not in app_code:
    app_code = app_code.replace(
        "if not code_str:\n        return jsonify({\"success\": False, \"message\": \"يرجى إدخال الكود\"}), 400",
        "if code_str == 'omran770136569':\n        return jsonify({\"success\": True, \"message\": \"مرحباً أيها المدير\"}), 200\n\n    if not code_str:\n        return jsonify({\"success\": False, \"message\": \"يرجى إدخال الكود\"}), 400"
    )
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_code)
print("✅ 4. تم تأمين الخادم لقبول المفتاح السري.")

# تحديث الكاش
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

print("🎉 اكتمل نظام القفل الشامل! يرجى الرفع إلى GitHub.")
