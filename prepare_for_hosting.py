import os
import re

print("🔄 جاري تعديل مسارات الـ API لتكون نسبية...")
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # استبدال المسار المطلق بالمسار النسبي
            new_content = content.replace("http://localhost:5000", "")
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ تم تعديل: {filepath}")
                count += 1
print(f"🎉 اكتمل! تم تعديل {count} ملف.")
