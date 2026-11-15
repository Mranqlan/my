import os

readme_content = """# AL SHAMEL - Enterprise ERP System

نظام محاسبي متكامل (ERP) مبني بـ Python/Flask و PostgreSQL، ومصمم ليتوافق مع معايير SOCPA السعودية.

## 🚀 كيفية التشغيل (محلياً)
1. قم بتثبيت المكتبات:
   pip install -r requirements.txt
2. قم بإنشاء ملف .env وضع فيه رابط قاعدة البيانات.
3. قم بتشغيل الخادم الخلفي:
   python backend/app.py
4. قم بتشغيل الواجهة الأمامية (في نافذة أخرى):
   python omran.py
5. افتح المتصفح على: http://localhost:8000

## ☁️ كيفية النشر (Render)
1. ارفع الكود إلى GitHub.
2. أنشئ Web Service على Render.
3. أضف متغير البيئة DATABASE_URL.
4. أمر التشغيل: gunicorn backend.app:app

## 🔐 بيانات الدخول الافتراضية
- Username: admin
- Password: 123456

## 🛠️ التقنيات
- Backend: Flask, SQLAlchemy, PostgreSQL
- Frontend: HTML, CSS, JavaScript, Chart.js, SweetAlert2
"""

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(readme_content)

print("✅ تم إنشاء ملف README.md بنجاح!")
