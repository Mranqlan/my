import os

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# إضافة import os في بداية الملف إذا لم تكن موجودة
if not code.strip().startswith('import os'):
    code = "import os\n" + code
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("✅ تم إصلاح الخطأ: تمت إضافة import os إلى بداية ملف app.py")
else:
    print("⚠️ import os موجودة بالفعل.")
