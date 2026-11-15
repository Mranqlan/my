import os

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# التأكد من عدم تكرار التعديل
if 'serve_frontend' not in code:
    # 1. إضافة send_from_directory إلى الاستيراد
    code = code.replace(
        "from flask import Flask, jsonify, request",
        "from flask import Flask, jsonify, request, send_from_directory"
    )
    
    # 2. تحديد مسار الجذر للمشروع
    setup_code = """
import os
basedir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(basedir, '..'))

app = Flask(__name__, static_folder=os.path.join(root_dir, 'assets'), template_folder=root_dir)
"""
    # استبدال سطر تهيئة Flask
    code = code.replace("app = Flask(__name__)", setup_code)
    
    # 3. إضافة المسار لتقديم ملفات HTML قبل if __name__
    route_code = """
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)
    else:
        return send_from_directory(root_dir, 'login.html')

if __name__ == '__main__':"""
    
    code = code.replace("if __name__ == '__main__':", route_code)

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("✅ تم تعديل ملف app.py بنجاح.")
else:
    print("⚠️ التعديل موجود بالفعل.")
