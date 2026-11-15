import os

app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    code = f.read()

# إزالة أي تعديلات قديمة لتجنب التكرار
code = code.replace("from flask import Flask, jsonify, request, send_from_directory", "from flask import Flask, jsonify, request")
if 'root_dir = os.path.abspath' in code:
    code = code.split('import os')[0] + code.split('app = Flask(__name__)', 1)[1] if 'app = Flask(__name__)' in code else code
    code = code.replace("import os\n", "")

# إضافة send_from_directory
if 'send_from_directory' not in code:
    code = code.replace("from flask import Flask, jsonify, request", "from flask import Flask, jsonify, request, send_from_directory")

# إضافة إعدادات المسارات
setup_code = """
import os
basedir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(basedir, '..'))

app = Flask(__name__, static_folder=os.path.join(root_dir, 'assets'), template_folder=root_dir)
"""
if 'root_dir = os.path.abspath' not in code:
    code = code.replace("app = Flask(__name__)", setup_code)

# إضافة المسار (Route) لعرض الواجهة
route_code = """
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)
    else:
        return send_from_directory(root_dir, 'login.html')

if __name__ == '__main__':"""

if 'serve_frontend' not in code:
    code = code.replace("if __name__ == '__main__':", route_code)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(code)
    
print("✅ تم تعديل ملف app.py بنجاح على جهازك.")
