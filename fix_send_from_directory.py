import re

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# البحث عن سطر الاستيراد من flask وإضافة send_from_directory
match = re.search(r"from flask import (.*)", code)
if match:
    imports = match.group(1)
    if 'send_from_directory' not in imports:
        new_imports = imports + ", send_from_directory"
        code = code.replace(match.group(0), f"from flask import {new_imports}")
        with open(app_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print("✅ تم إصلاح الخطأ: تمت إضافة send_from_directory إلى سطر الاستيراد.")
else:
    print("⚠️ لم يتم العثور على سطر استيراد flask. يرجى التحقق من الملف.")
