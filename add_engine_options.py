import re

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# إضافة إعدادات pool_pre_ping و pool_recycle
if 'SQLALCHEMY_ENGINE_OPTIONS' not in code:
    # البحث عن سطر إعداد قاعدة البيانات وإضافة الإعدادات بعده
    pattern = r"(app\.config\['SQLALCHEMY_DATABASE_URI'\] = .*?\n)"
    replacement = r"\1app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True, 'pool_recycle': 60}\n"
    code = re.sub(pattern, replacement, code, count=1)
    
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("✅ تمت إضافة إعدادات استقرار الاتصال إلى app.py")
else:
    print("⚠️ الإعدادات موجودة بالفعل.")
