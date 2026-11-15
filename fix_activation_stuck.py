import os
import re

print("🛠️ جاري إصلاح مشكلة تعليق شاشة التفعيل...")

# 1. تعديل صفحة التفعيل (activate.html) للانتقال الفوري
activate_path = 'pages/activate.html'
with open(activate_path, 'r', encoding='utf-8') as f:
    html = f.read()

# استبدال المؤقت بالانتقال الفوري للمدير
old_master = """            if (code === 'omran770136569') {
                sucDiv.style.display = 'block';
                sucDiv.textContent = 'مرحباً بك أيها المدير. جاري الدخول...';
                localStorage.setItem('onyx_license_valid', 'true');
                setTimeout(() => {
                    window.location.href = '/pages/welcome.html';
                }, 1000);
                return;
            }"""
new_master = """            if (code === 'omran770136569') {
                sucDiv.style.display = 'block';
                sucDiv.textContent = 'مرحباً بك أيها المدير. جاري الدخول...';
                localStorage.setItem('onyx_license_valid', 'true');
                localStorage.setItem('onyx_tenant_id', 'default_company');
                window.location.replace('/pages/welcome.html');
                return;
            }"""
html = html.replace(old_master, new_master)

# استبدال المؤقت بالانتقال الفوري لأكواد العملاء
old_client = """                if (data.success) {
                    sucDiv.style.display = 'block';
                    sucDiv.textContent = data.message;
                    localStorage.setItem('onyx_license_valid', 'true');
                    localStorage.setItem('onyx_tenant_id', data.tenant_id || 'default_company');
                    setTimeout(() => {
                        window.location.href = '/pages/welcome.html';
                    }, 1500);"""
new_client = """                if (data.success) {
                    sucDiv.style.display = 'block';
                    sucDiv.textContent = data.message;
                    localStorage.setItem('onyx_license_valid', 'true');
                    localStorage.setItem('onyx_tenant_id', data.tenant_id || 'default_company');
                    window.location.replace('/pages/welcome.html');"""
html = html.replace(old_client, new_client)

with open(activate_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ 1. تم جعل الانتقال فورياً في شاشة التفعيل.")

# 2. تحديث الكاش
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                h = f.read()
            h = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=888777"', h)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(h)

print("🎉 اكتمل الإصلاح! يرجى الرفع إلى GitHub.")
