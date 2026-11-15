import os
import zipfile
import time

print("📦 جاري إنشاء نسخة احتياطية للمشروع...")
backup_name = f"AL_SHAMEL_Backup_{time.strftime('%Y-%m-%d')}.zip"
exclude_dirs = {'.venv', '__pycache__', '.git', 'node_modules'}

try:
    with zipfile.ZipFile(backup_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # تجاهل المجلدات الثقيلة
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                filepath = os.path.join(root, file)
                # عدم إضافة ملف النسخة الاحتياطية إلى نفسه
                if filepath == f"./{backup_name}":
                    continue
                # إضافة الملف إلى الأرشيف
                zipf.write(filepath, filepath)

    print(f"✅ تم إنشاء النسخة الاحتياطية بنجاح: {backup_name}")
    print("📌 يمكنك نسخ هذا الملف وحفظه في مكان آمن.")
except Exception as e:
    print(f"❌ حدث خطأ أثناء الضغط: {e}")
