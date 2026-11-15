import os
import re

print("🚀 بدء إنشاء الصفحة الترحيبية وتحديث مسار الدخول...")

# 1. إنشاء صفحة الترحيب الأسطورية (welcome.html)
os.makedirs('pages', exist_ok=True)
welcome_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تعز سوفت | TAIZ SOFT</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css?v=999999">
    <link rel="stylesheet" href="/assets/css/sidebar.css?v=999999">
    <style>
        body { margin: 0; background: radial-gradient(circle at center, #1e293b, #020617); height: 100vh; display: flex; overflow: hidden; font-family: 'Noto Kufi Arabic', sans-serif; }
        
        .main-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; position: relative; z-index: 10; }
        
        /* الهالات الضوئية في الخلفية */
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 1; opacity: 0.5; animation: pulse 6s infinite alternate; }
        .orb-green { width: 500px; height: 500px; background: #10b981; top: -100px; right: -100px; }
        .orb-blue { width: 400px; height: 400px; background: #3b82f6; bottom: -100px; left: 20%; animation-delay: -3s; }
        
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.2); opacity: 0.7; } }

        /* البطاقة الزجاجية */
        .welcome-card {
            background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; padding: 60px 80px; text-align: center;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2);
            animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }

        /* الشعار الكبير */
        .big-logo { width: 180px; height: 180px; margin: 0 auto 30px; filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.6)); animation: float 4s infinite alternate ease-in-out; }
        @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-15px); } }

        h1 { font-family: 'Segoe UI', sans-serif; font-size: 56px; font-weight: 900; color: #ffffff; margin: 0 0 10px; letter-spacing: 2px; }
        h1 span { color: #10b981; }
        
        .subtitle-ar { font-size: 22px; color: #94a3b8; font-weight: 700; margin-bottom: 40px; letter-spacing: 1px; }

        .features { display: flex; justify-content: center; gap: 30px; margin-bottom: 50px; }
        .feature { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #cbd5e1; font-weight: 600; font-size: 14px; }
        .feature .icon { font-size: 28px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); }

        .enter-btn {
            display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #10b981, #059669); color: white;
            text-decoration: none; font-size: 20px; font-weight: 800; border-radius: 50px; font-family: inherit;
            box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4); transition: all 0.3s;
        }
        .enter-btn:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 20px 45px rgba(16, 185, 129, 0.6); }
        
        .footer { position: absolute; bottom: 20px; color: #475569; font-size: 13px; font-weight: 600; }
    </style>
</head>
<body>
    <aside class="sidebar" id="sidebar-container"></aside>
    
    <div class="main-wrapper">
        <div class="orb orb-green"></div>
        <div class="orb orb-blue"></div>

        <div class="welcome-card">
            <div class="big-logo">
                <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="url(#brandGrad)" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M30 30 L70 30 M50 30 L50 75" stroke="url(#brandGrad)" stroke-width="6" stroke-linecap="round"/>
                    <path d="M65 45 C65 35, 55 35, 50 40 C45 45, 55 55, 50 60 C45 65, 35 60, 35 55" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
                </svg>
            </div>
            <h1>TAIZ <span>SOFT</span></h1>
            <div class="subtitle-ar">تعز سوفت | نظام إدارة الموارد المتكامل</div>
            
            <div class="features">
                <div class="feature"><span class="icon">📊</span> محاسبة دقيقة</div>
                <div class="feature"><span class="icon">📦</span> إدارة مخزون</div>
                <div class="feature"><span class="icon">👥</span> موارد بشرية</div>
                <div class="feature"><span class="icon">🛡️</span> امتثال ZATCA</div>
            </div>

            <a href="/index.html" class="enter-btn">الدخول إلى لوحة التحكم 🚀</a>
        </div>

        <div class="footer">© 2026 Taiz Soft. جميع الحقوق محفوظة.</div>
    </div>

    <script src="/assets/js/database.js?v=999999"></script>
    <script src="/assets/js/layout.js?v=999999"></script>
    <script src="/assets/js/app.js?v=999999"></script>
</body>
</html>"""

with open('pages/welcome.html', 'w', encoding='utf-8') as f:
    f.write(welcome_html)
print("✅ 1. تم إنشاء صفحة الترحيب (welcome.html).")

# 2. إضافة الرابط في أعلى القائمة الجانبية
sidebar_path = 'components/sidebar.html'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar = f.read()

# إضافة تبويب تعز سوفت قبل لوحة التحكم
new_item = """
        <!-- ===== تبويب تعز سوفت الترحيبي ===== -->
        <li class="nav-item">
            <a href="/pages/welcome.html">
                <span class="nav-icon">✨</span>
                <span class="nav-label">تعز سوفت (الرئيسية)</span>
            </a>
        </li>
        <!-- ===== لوحة التحكم ===== -->
        <li class="nav-item">
            <a href="/index.html">
                <span class="nav-icon">📊</span>
                <span class="nav-label">لوحة التحكم</span>
            </a>
        </li>
"""

# إزالة الرابط القديم للوحة التحكم واستبداله بالجديد
sidebar = re.sub(r'<!-- ===== المجموعة 1: الرئيسية ===== -->.*?<li class="nav-item active">.*?</li>', new_item, sidebar, flags=re.DOTALL)
# في حال لم يجد التعليق نستبدل أول li
if new_item not in sidebar:
    sidebar = re.sub(r'<li class="nav-item active">.*?</li>', new_item, sidebar, flags=re.DOTALL)

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar)
print("✅ 2. تم إضافة تبويب (تعز سوفت) في أعلى القائمة الجانبية.")

# 3. تعديل login.html لتوجيه المستخدم لصفحة الترحيب أولا
login_path = 'login.html'
with open(login_path, 'r', encoding='utf-8') as f:
    login_html = f.read()

login_html = login_html.replace("window.location.href = '/index.html';", "window.location.href = '/pages/welcome.html';")

with open(login_path, 'w', encoding='utf-8') as f:
    f.write(login_html)
print("✅ 3. تم تعديل صفحة الدخول لتوجه المستخدم لصفحة (تعز سوفت) الترحيبية.")

# 4. تحديث الكاش لجميع الصفحات
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=777777"', html)
            html = re.sub(r'href="([^"]+\.css)(\?v=\d+)?"', r'href="\1?v=777777"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 4. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل التصميم! يرجى عمل Ctrl+Shift+R")
