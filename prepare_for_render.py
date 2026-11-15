import os

# 1. إنشاء ملف requirements.txt
with open('requirements.txt', 'w', encoding='utf-8') as f:
    f.write("Flask\nFlask-SQLAlchemy\nFlask-Cors\ngunicorn\n")

# 2. إنشاء ملف Procfile
with open('Procfile', 'w', encoding='utf-8') as f:
    f.write("web: gunicorn backend.app:app\n")

print("✅ تم إنشاء ملفات requirements.txt و Procfile بنجاح.")
