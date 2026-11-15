import os
import re

print("🎨 جاري إنشاء صفحة الترحيب المطابقة للهيدر (بدون أزرار)...")

welcome_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تعز سوفت | TAIZ SOFT</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css?v=999999">
    <link rel="stylesheet" href="/assets/css/sidebar.css?v=999999">
    <style>
        body { 
            margin: 0; background: radial-gradient(circle at center, #1e293b, #020617); 
            height: 100vh; display: flex; overflow: hidden; font-family: 'Noto Kufi Arabic', sans-serif; 
            cursor: pointer; /* لجعل الشاشة كلها قابلة للنقر */
        }
        
        .main-wrapper { flex: 1; display: flex; justify-content: center; align-items: center; position: relative; z-index: 10; }
        
        /* الهالات الضوئية في الخلفية */
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 1; opacity: 0.5; animation: pulse 6s infinite alternate; }
        .orb-green { width: 500px; height: 500px; background: #10b981; top: -100px; right: -100px; }
        .orb-blue { width: 400px; height: 400px; background: #3b82f6; bottom: -100px; left: 20%; animation-delay: -3s; }
        
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.2); opacity: 0.7; } }

        /* البطاقة الزجاجية */
        .welcome-card {
            background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 50px; padding: 60px 80px; 
            text-align: center;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
            animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1), float 4s infinite alternate ease-in-out 1s;
            display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 30px;
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-15px); } }

        /* الشعار الكبير المطابق للهيدر */
        .big-logo { 
            width: 150px; height: 150px; 
            filter: drop-shadow(0 0 30px rgba(16, 185, 129, 0.6)); 
        }

        /* النصوص المطابقة للهيدر */
        .logo-text { display: flex; flex-direction: column; text-align: right; }
        
        .logo-text h2 {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            font-size: 55px; font-weight: 900; letter-spacing: 2px; 
            color: #ffffff; margin: 0; text-transform: uppercase;
            text-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }
        
        .logo-text h2 span { color: #10b981; }
        
        .logo-subtitle {
            font-family: 'Noto Naskh Arabic', sans-serif; 
            font-size: 22px; letter-spacing: 1px; color: #10b981; 
            font-weight: 700; margin-top: 10px; text-transform: uppercase;
        }
        
        /* رسالة صغيرة أسفل الشاشة */
        .hint-text {
            position: absolute; bottom: 30px; color: #475569; font-size: 14px; font-weight: 600;
            animation: blink 2s infinite;
        }
        
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    </style>
</head>
<body onclick="window.location.href='/index.html'">
    <aside class="sidebar" id="sidebar-container"></aside>
    
    <div class="main-wrapper">
        <div class="orb orb-green"></div>
        <div class="orb orb-blue"></div>

        <div class="welcome-card">
            <!-- الشعار (نفس كود الهيدر) -->
            <div class="big-logo">
                <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="url(#brandGrad)" stroke-width="6" stroke-linejoin="round"/>
                    <path d="M30 30 L70 30 M50 30 L50 75" stroke="url(#brandGrad)" stroke-width="8" stroke-linecap="round"/>
                    <path d="M65 45 C65 35, 55 35, 50 40 C45 45, 55 55, 50 60 C45 65, 35 60, 35 55" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
                </svg>
            </div>

            <!-- النص (نفس كود الهيدر) -->
            <div class="logo-text">
                <h2>TAIZ <span>SOFT</span></h2>
                <span class="logo-subtitle">ENTERPRISE ERP | تعز سوفت</span>
            </div>
        </div>

        <div class="hint-text">جاري الدخول للنظام تلقائيا... (أو انقر في أي مكان)</div>
    </div>

    <!-- سكربت الانتقال التلقائي بعد 4 ثوان -->
    <script>
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 4000);
    </script>
</body>
</html>"""

with open('pages/welcome.html', 'w', encoding='utf-8') as f:
    f.write(welcome_html)
print("✅ 1. تم تحديث صفحة الترحيب لتطابق الهيدر وبدون أزرار.")

# تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=555555"', html)
            html = re.sub(r'href="([^"]+\.css)(\?v=\d+)?"', r'href="\1?v=555555"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 2. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل التعديل! يرجى عمل Ctrl+Shift+R")
