import os
import re

print("🔧 جاري ربط المشروع بقاعدة بيانات Neon...")

# 1. إنشاء ملف .env لحفظ رابط الاتصال بأمان (لا يتم رفعه لـ GitHub)
with open('.env', 'w', encoding='utf-8') as f:
    f.write("DATABASE_URL=postgresql://neondb_owner:npg_niNa1UvzR8ju@ep-cold-block-zaannge6-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require\n")
print("✅ تم إنشاء ملف .env وتخزين الرابط فيه.")

# 2. إضافة .env إلى ملف .gitignore لحماية كلمة المرور
if os.path.exists('.gitignore'):
    with open('.gitignore', 'r', encoding='utf-8') as f:
        gitignore = f.read()
    if '.env' not in gitignore:
        with open('.gitignore', 'a', encoding='utf-8') as f:
            f.write("\n.env\n")
else:
    with open('.gitignore', 'w', encoding='utf-8') as f:
        f.write(".env\n.venv/\n__pycache__/\n")

# 3. تحديث ملف app.py ليقرأ الرابط من .env
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# إضافة مكتبة dotenv
if 'from dotenv import load_dotenv' not in code:
    code = "from dotenv import load_dotenv\nload_dotenv()\n" + code

# استبدال رابط قاعدة البيانات القديم
old_config = r"app\.config\['SQLALCHEMY_DATABASE_URI'\] = .*?alshamel\.db'\)"
new_config = "app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')"

if 'os.environ.get(\'DATABASE_URL\')' not in code:
    code = re.sub(old_config, new_config, code)

# إزالة أي أمر لحذف الجداول (لتجنب مسح البيانات في كل مرة)
code = code.replace('db.drop_all()\n    db.create_all()', 'db.create_all()')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("✅ تم تعديل app.py لقراءة الرابط من متغيرات البيئة.")

# 4. تحديث requirements.txt
with open('requirements.txt', 'r', encoding='utf-8') as f:
    reqs = f.read()
if 'psycopg2-binary' not in reqs:
    with open('requirements.txt', 'a', encoding='utf-8') as f:
        f.write("\npsycopg2-binary\npython-dotenv\n")
print("✅ تم تحديث requirements.txt.")

print("=" * 60)
print("🎉 اكتمل التجهيز! الآن قم برفع التعديلات باستخدام الأوامر التالية:")
