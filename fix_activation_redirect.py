import os
import re

print("🛠️ جاري إصلاح مشكلة التعليق في صفحة التفعيل...")

activate_path = 'pages/activate.html'
with open(activate_path, 'r', encoding='utf-8') as f:
    html = f.read()

# استبدال كتلة الجافاسكريبت بالكامل بنسخة نظيفة ومحمية
pattern = r'<script>\s*async function activateSystem\(e\) \{.*?\n    </script>'
new_script = """<script>
    async function activateSystem(e) {
        e.preventDefault();
        const code = document.getElementById('activation-code').value.trim();
        const btn = document.getElementById('btn-activate');
        const errDiv = document.getElementById('error-msg');
        const sucDiv = document.getElementById('success-msg');
        
        btn.textContent = 'جاري التحقق...';
        btn.disabled = true;
        errDiv.style.display = 'none';
        sucDiv.style.display = 'none';
        
        const user = JSON.parse(localStorage.getItem('onyx_current_user') || '{}');
        const username = user.username || 'admin';

        // 1. المفتاح السري للمدير العام
        if (code === 'omran770136569') {
            sucDiv.style.display = 'block';
            sucDiv.textContent = 'مرحباً بك أيها المدير. جاري الدخول...';
            localStorage.setItem('onyx_license_valid', 'true');
            localStorage.setItem('onyx_tenant_id', 'default_company');
            
            setTimeout(() => {
                window.location.replace('/pages/welcome.html');
            }, 800);
            return;
        }

        // 2. أكواد التفعيل العادية للعملاء
        try {
            const response = await fetch('/api/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, username: username })
            });
            
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error("استجابة الخادم غير صالحة.");
            }
            
            if (data.success) {
                sucDiv.style.display = 'block';
                sucDiv.textContent = data.message;
                localStorage.setItem('onyx_license_valid', 'true');
                localStorage.setItem('onyx_tenant_id', data.tenant_id || 'default_company');
                
                setTimeout(() => {
                    window.location.replace('/pages/welcome.html');
                }, 800);
            } else {
                errDiv.style.display = 'block';
                errDiv.textContent = data.message;
                btn.textContent = 'تفعيل النظام الآن 🚀';
                btn.disabled = false;
            }
        } catch (error) {
            errDiv.style.display = 'block';
            errDiv.textContent = 'حدث خطأ: ' + error.message;
            btn.textContent = 'تفعيل النظام الآن 🚀';
            btn.disabled = false;
        }
    }
</script>"""

html = re.sub(pattern, new_script, html, flags=re.DOTALL)

# إذا لم يجد الـ regex، نقوم بحقن السكربت الجديد قبل </body>
if 'async function activateSystem' not in html:
    html = html.replace('</body>', new_script + '\n</body>')

with open(activate_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ 1. تم إعادة كتابة كود صفحة التفعيل بشكل نظيف.")

# تحديث الكاش
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                h = f.read()
            h = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=333444"', h)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(h)

print("✅ 2. تم تحديث الكاش.")
print("🎉 اكتمل الإصلاح! يرجى الرفع إلى GitHub.")
