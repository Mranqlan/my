import os
import glob
import shutil

print("🧹 بدء عملية التنظيف الشاملة للمشروع...")
print("=" * 60)

# 1. حذف جميع ملفات البايثون المؤقتة في المجلد الرئيسي
patterns_to_delete = [
    "build_*.py", "fix_*.py", "sync_*.py", "cleanup_*.py", 
    "test_*.py", "seed_*.py", "update_*.py", "link_*.py", 
    "clear_*.py", "create_*.py", "nuclear_*.py", "ultimate_*.py",
    "force_*.py", "rebuild_*.py", "final_*.py", "deep_*.py",
    "run_*.py", "audit_*.py", "unify_*.py", "upgrade_*.py",
    "setup_*.py", "sync_*.py", "test_db.py", "test_server.py"
]

deleted_files_count = 0
for pattern in patterns_to_delete:
    for filepath in glob.glob(pattern):
        try:
            os.remove(filepath)
            print(f"🗑️ تم حذف: {filepath}")
            deleted_files_count += 1
        except Exception as e:
            print(f"⚠️ تعذر حذف {filepath}: {e}")

# 2. حذف أي ملفات قاعدة بيانات تجريبية في المجلد الرئيسي (مع الإبقاء على مجلد backend)
for db_file in glob.glob("*.db") + glob.glob("*.sqlite") + glob.glob("*.sqlite3"):
    if not db_file.startswith("backend"):
        try:
            os.remove(db_file)
            print(f"🗑️ تم حذف قاعدة بيانات تجريبية: {db_file}")
            deleted_files_count += 1
        except Exception as e:
            print(f"⚠️ تعذر حذف {db_file}: {e}")

# 3. حذف ملفات السجلات (Logs)
for log_file in glob.glob("*.log"):
    try:
        os.remove(log_file)
        print(f"🗑️ تم حذف ملف سجل: {log_file}")
        deleted_files_count += 1
    except Exception as e:
        pass

# 4. حذف مجلدات __pycache__ في كل المشروع لتوفير المساحة
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root: continue
    if '__pycache__' in dirs:
        pycache_path = os.path.join(root, '__pycache__')
        try:
            shutil.rmtree(pycache_path)
            print(f"🗑️ تم حذف مجلد الكاش: {pycache_path}")
        except Exception as e:
            pass

print("=" * 60)
print(f"🎉 اكتمل التنظيف! تم حذف {deleted_files_count} ملف مؤقت.")
print("✅ النظام الآن نظيف وجاهز للعمل.")
print("=" * 60)
