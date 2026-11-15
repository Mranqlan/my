import os
import re

print("🔐 جاري بناء نظام أكواد التفعيل (Activation System)...")

# 1. تحديث models.py لإضافة جدول الأكواد
models_path = 'backend/models.py'
with open(models_path, 'r', encoding='utf-8') as f:
    models_code = f.read()

if 'class ActivationCode' not in models_code:
    models_code += """

# جدول أكواد التفعيل
class ActivationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    used_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
"""
    with open(models_path, 'w', encoding='utf-8') as f:
        f.write(models_code)
    print("✅ 1. تم إضافة جدول ActivationCode إلى models.py")

# 2. تحديث app.py لإضافة مسار التحقق
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

if '/api/activate' not in app_code:
    app_code = app_code.replace(
        "from backend.models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice",
        "from backend.models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice, ActivationCode"
    )
    app_code = app_code.replace(
        "from models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice",
        "from models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice, ActivationCode"
    )

    activate_route = """
@app.route('/api/activate', methods=['POST'])
def activate():
    data = request.json
    code_str = data.get('code', '').strip()
    username = data.get('username', 'Unknown')
    
    if not code_str:
        return jsonify({"success": False, "message": "يرجى إدخال الكود"}), 400
        
    ac = ActivationCode.query.filter_by(code=code_str).first()
    
    if not ac:
        return jsonify({"success": False, "message": "كود التفعيل غير صحيح أو غير موجود"}), 404
        
    if ac.is_used:
        return jsonify({"success": False, "message": "هذا الكود مستخدم بالفعل من قبل"}), 400
        
    # تفعيل الكود
    ac.is_used = True
    ac.used_by = username
    db.session.commit()
    
    return jsonify({"success": True, "message": "تم تفعيل النظام بنجاح!"}), 200
"""
    app_code = app_code.replace("if __name__ == '__main__':", activate_route + "\nif __name__ == '__main__':")
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_code)
    print("✅ 2. تم إضافة مسار /api/activate إلى app.py")

# 3. إنشاء صفحة التفعيل (activate.html)
activate_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تفعيل النظام | تعز سوفت</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;800;900&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; background: radial-gradient(circle at center, #1e293b, #020617); height: 100vh; display: flex; justify-content: center; align-items: center; font-family: 'Noto Kufi Arabic', sans-serif; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 1; opacity: 0.5; animation: pulse 6s infinite alternate; }
        .orb-green { width: 500px; height: 500px; background: #10b981; top: -100px; right: -100px; }
        .orb-blue { width: 400px; height: 400px; background: #3b82f6; bottom: -100px; left: 20%; animation-delay: -3s; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.2); opacity: 0.7; } }

        .activation-card {
            background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 30px; padding: 60px 50px; text-align: center; z-index: 10;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
            max-width: 450px; width: 100%; animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }

        .icon { font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5)); }
        h1 { color: #ffffff; font-size: 28px; font-weight: 800; margin-bottom: 10px; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 30px; line-height: 1.6; }
        
        .input-group { position: relative; margin-bottom: 25px; text-align: right; }
        .input-group label { display: block; color: #cbd5e1; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
        .input-group input { width: 100%; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 18px; font-weight: 800; text-align: center; letter-spacing: 2px; box-sizing: border-box; outline: none; transition: 0.3s; }
        .input-group input:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }

        .btn-activate { width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 800; cursor: pointer; font-family: inherit; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); transition: all 0.3s; }
        .btn-activate:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6); }
        
        .error-msg { color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid #ef4444; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: bold; margin-top: 15px; display: none; }
        .success-msg { color: #10b981; background: rgba(16,185,129,0.1); border: 1px solid #10b981; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: bold; margin-top: 15px; display: none; }
    </style>
</head>
<body>
    <div class="orb orb-green"></div>
    <div class="orb orb-blue"></div>

    <div class="activation-card">
        <div class="icon">🔐</div>
        <h1>تفعيل ترخيص النظام</h1>
        <p>مرحباً بك في تعز سوفت. يرجى إدخال كود التفعيل الخاص بك للبدء في استخدام النظام.</p>
        
        <form onsubmit="activateSystem(event)">
            <div class="input-group">
                <label>كود التفعيل (Activation Code)</label>
                <input type="text" id="activation-code" placeholder="TS-XXXX-XXXX-XXXX" required autocomplete="off">
            </div>
            <button type="submit" class="btn-activate" id="btn-activate">تفعيل النظام الآن 🚀</button>
            <div id="error-msg" class="error-msg"></div>
            <div id="success-msg" class="success-msg"></div>
        </form>
    </div>

    <script>
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

            try {
                // في الاستضافة السحابية نستخدم مسار نسبي
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
    </script>
</body>
</html>"""

with open('pages/activate.html', 'w', encoding='utf-8') as f:
    f.write(activate_html)
print("✅ 3. تم إنشاء صفحة التفعيل (activate.html)")

# 4. تعديل login.html لتوجيه المستخدم لصفحة التفعيل أولاً
login_path = 'login.html'
with open(login_path, 'r', encoding='utf-8') as f:
    login_html = f.read()

# تعديل المسار
login_html = login_html.replace("window.location.href = '/pages/welcome.html';", "window.location.href = '/pages/activate.html';")
login_html = login_html.replace("window.location.href = '/index.html';", "window.location.href = '/pages/activate.html';")

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(login_html)
print("✅ 4. تم تعديل صفحة الدخول لتوجه المستخدم لصفحة التفعيل أولاً.")

# 5. إنشاء سكربت لتوليد الأكواد (generate_codes.py)
generator_script = """import uuid
import sys
from backend.app import app, db
from backend.models import ActivationCode

def generate_codes(count=1):
    with app.app_context():
        print(f"⏳ جاري توليد {count} كود تفعيل...")
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
            print(f"🔑 كود جديد: {formatted_code}")
            
        db.session.commit()
        print("✅ تم حفظ الأكواد في قاعدة البيانات بنجاح!")

if __name__ == '__main__':
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    generate_codes(count)
"""

with open('generate_codes.py', 'w', encoding='utf-8') as f:
    f.write(generator_script)
print("✅ 5. تم إنشاء سكربت توليد الأكواد (generate_codes.py)")

# تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=333333"', html)
            html = re.sub(r'href="([^"]+\.css)(\?v=\d+)?"', r'href="\1?v=333333"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 6. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل بناء نظام التفعيل! يرجى رفع التعديلات واختبارها.")
