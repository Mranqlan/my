# استبدال psycopg2 بمكتبة psycopg3 الأحدث والأكثر توافقاً
with open('requirements.txt', 'r+', encoding='utf-8') as f:
    content = f.read().replace('psycopg2-binary', 'psycopg[binary]')
    f.seek(0)
    f.write(content)
    f.truncate()
print("✅ تم تحديث requirements.txt لاستخدام psycopg3")

# إنشاء ملف .python-version لإجبار Render على استخدام إصدار مستقر
with open('.python-version', 'w', encoding='utf-8') as f:
    f.write("3.11.9\n")
print("✅ تم إنشاء ملف .python-version لتثبيت إصدار بايثون 3.11")
