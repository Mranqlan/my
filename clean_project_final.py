import os
import glob
import shutil

print("🧹 بدء عملية التنظيف الشاملة للمشروع (حذف الملفات المؤقتة)...")
print("=" * 60)

# الملفات التي يجب الاحتفاظ بها (ممنوع حذفها)
KEEP_FILES = [
    'omran.py', 
    'requirements.txt', 
    'generate_codes.py', 
    'START_ALL.py',
    '.env', 
    '.gitignore', 
    'Procfile', 
    '.python-version',
    'clean_project_final.py'
]

deleted_count = 0

# 1. حذف سكربتات بايثون المؤقتة
print("🗑️ جاري حذف سكربتات الإصلاح المؤقتة...")
for file in glob.glob("*.py"):
    if file not in KEEP_FILES:
        try:
            os.remove(file)
            deleted_count += 1
        except: pass

# 2. حذف قواعد البيانات المحلية (نستخدم Neon السحابي الآن)
print("🗑️ جاري حذف قواعد البيانات المحلية (SQLite)...")
for db_file in glob.glob("*.db") + glob.glob("*.sqlite") + glob.glob("backend/*.db"):
    try:
        os.remove(db_file)
        deleted_count += 1
    except: pass

# 3. حذف ملفات الـ ZIP (النسخ الاحتياطية القديمة)
print("🗑️ جاري حذف ملفات ZIP القديمة...")
for zip_file in glob.glob("*.zip"):
    try:
        os.remove(zip_file)
        deleted_count += 1
    except: pass

# 4. حذف ملف cloudflared.exe (لم نعد بحاجة له)
if os.path.exists('cloudflared.exe'):
    try:
        os.remove('cloudflared.exe')
        deleted_count += 1
    except: pass

# 5. حذف المجلدات الثقيلة والغير ضرورية
print("🗑️ جاري حذف المجلدات المؤقتة (__pycache__, .venv-1)...")
folders_to_delete = ['__pycache__', '.venv-1', '.pytest_cache', 'static', 'templates']
for folder in folders_to_delete:
    if os.path.exists(folder):
        try:
            shutil.rmtree(folder)
            deleted_count += 1
        except: pass

# 6. حذف مجلدات __pycache__ داخل backend
for root, dirs, files in os.walk('.'):
    if '__pycache__' in dirs:
        try:
            shutil.rmtree(os.path.join(root, '__pycache__'))
        except: pass

print("=" * 60)
print(f"🎉 اكتمل التنظيف! تم حذف {deleted_count} من الملفات والمجلدات غير الضرورية.")
print("✅ المشروع الآن نظيف ويحتوي فقط على:")
print("   - backend/ (الخادم)")
print("   - assets/ (التصميم والجافاسكريبت)")
print("   - components/ (القائمة الجانبية)")
print("   - pages/ (الصفحات)")
print("   - الملفات الأساسية (index.html, login.html, landing.html, omran.py, إلخ)")
print("=" * 60)
