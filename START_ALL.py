import subprocess
import time
import webbrowser

print("=" * 60)
print("🚀 جاري تشغيل نظام AL SHAMEL (الخادم + الواجهة)...")
print("=" * 60)

print("🔄 [1/2] تشغيل الخادم الخلفي (قاعدة البيانات)...")
backend_process = subprocess.Popen(["python", "backend/app.py"], creationflags=subprocess.CREATE_NEW_CONSOLE)
time.sleep(2)

print("🔄 [2/2] تشغيل الواجهة الأمامية (صفحات النظام)...")
frontend_process = subprocess.Popen(["python", "omran.py"], creationflags=subprocess.CREATE_NEW_CONSOLE)
time.sleep(2)

print("🌐 فتح المتصفح...")
webbrowser.open("http://localhost:8000/login.html")

print("=" * 60)
print("✅ النظام يعمل الآن! (لا تغلق النوافذ السوداء التي فتحت)")
print("🔗 الرابط: http://localhost:8000")
print("=" * 60)
