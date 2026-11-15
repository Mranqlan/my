import re

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# إزالة أو تعليق جزء إنشاء المستخدم الافتراضي مؤقتاً
old_block = """with app.app_context():
    db.create_all()
    if not User.query.first():
        db.session.add(User(username='admin', password_hash='123456', full_name='OMRAN AQLAN', role='admin'))
        db.session.commit()"""

new_block = """with app.app_context():
    db.create_all()
    # تم تعطيل إنشاء المستخدم الافتراضي مؤقتاً لحل مشكلة إعادة البناء
    # if not User.query.first():
    #     db.session.add(User(username='admin', password_hash='123456', full_name='OMRAN AQLAN', role='admin'))
    #     db.session.commit()"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("✅ تم تعطيل إنشاء المستخدم الافتراضي مؤقتاً في app.py.")
else:
    print("⚠️ لم يتم العثور على الكتلة المطلوبة. قد يكون الكود قد تغير.")
