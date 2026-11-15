import os
import re

print("🏢 بدء بناء نظام عزل الشركات (Multi-Tenancy)...")

# 1. تحديث ملف models.py
models_path = 'backend/models.py'
with open(models_path, 'r', encoding='utf-8') as f:
    models_code = f.read()

# إضافة tenant_id لكل الجداول
models_code = models_code.replace("created_at = db.Column(db.DateTime, default=datetime.utcnow)", "tenant_id = db.Column(db.String(50), default='default_company')\n    created_at = db.Column(db.DateTime, default=datetime.utcnow)")

# إضافة tenant_id لجدول المستخدمين وأكواد التفعيل
models_code = models_code.replace("role = db.Column(db.String(50), nullable=False, default='accountant')", "role = db.Column(db.String(50), nullable=False, default='accountant')\n    tenant_id = db.Column(db.String(50), default='default_company')")
models_code = models_code.replace("is_used = db.Column(db.Boolean, default=False)", "tenant_id = db.Column(db.String(50), default='default_company')\n    is_used = db.Column(db.Boolean, default=False)")

with open(models_path, 'w', encoding='utf-8') as f:
    f.write(models_code)
print("✅ 1. تم تحديث models.py (إضافة tenant_id للجميع).")

# 2. تحديث ملف app.py (الخادم)
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

# تحديث مسارات GET لفلترة البيانات حسب الشركة
app_code = re.sub(r'return jsonify\(\[\{"id": c\.id.*?for c in Customer\.query\.all\(\)\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": c.id, "code": c.code, "name": c.name, "phone": c.phone, "balance": c.balance, "credit_limit": c.credit_limit, "is_on_hold": c.is_on_hold} for c in Customer.query.filter_by(tenant_id=tenant).all()])', app_code, flags=re.DOTALL)
app_code = re.sub(r'return jsonify\(\[\{"id": s\.id.*?for s in Supplier\.query\.all\(\)\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": s.id, "code": s.code, "name": s.name, "phone": s.phone, "balance": s.balance} for s in Supplier.query.filter_by(tenant_id=tenant).all()])', app_code, flags=re.DOTALL)
app_code = re.sub(r'return jsonify\(\[\{"id": i\.id.*?for i in Item\.query\.all\(\)\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": i.id, "code": i.code, "name": i.name, "barcode": i.barcode, "purchase_price": i.purchase_price, "sale_price": i.sale_price, "qty": i.qty, "warehouse_name": i.warehouse_name} for i in Item.query.filter_by(tenant_id=tenant).all()])', app_code, flags=re.DOTALL)
app_code = re.sub(r'return jsonify\(\[\{"id": i\.id.*?for i in SalesInvoice\.query\.order_by.*?\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": i.id, "invoiceNumber": i.invoice_number, "customerId": i.customer_id, "customerName": i.customer_name, "date": i.date, "total": i.total, "warehouse": i.warehouse, "branchName": i.branch_name, "currency": i.currency, "exchangeRate": i.exchange_rate, "baseTotal": i.base_total, "items": json.loads(i.items_json) if i.items_json else []} for i in SalesInvoice.query.filter_by(tenant_id=tenant).order_by(SalesInvoice.id.desc()).all()])', app_code, flags=re.DOTALL)
app_code = re.sub(r'return jsonify\(\[\{"id": i\.id.*?for i in PurchaseInvoice\.query\.order_by.*?\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": i.id, "invoiceNumber": i.invoice_number, "supplierId": i.supplier_id, "supplierName": i.supplier_name, "date": i.date, "total": i.total, "warehouse": i.warehouse, "branchName": i.branch_name, "items": json.loads(i.items_json) if i.items_json else []} for i in PurchaseInvoice.query.filter_by(tenant_id=tenant).order_by(PurchaseInvoice.id.desc()).all()])', app_code, flags=re.DOTALL)
app_code = re.sub(r'return jsonify\(\[\{"id": e\.id.*?for e in JournalEntry\.query\.order_by.*?\]\)', 'tenant = request.headers.get("X-Tenant-ID", "default_company")\n    return jsonify([{"id": e.id, "entryNumber": e.entry_number, "date": e.date, "description": e.description, "lines": json.loads(e.lines_json), "totalDebit": e.total_debit, "totalCredit": e.total_credit, "status": e.status} for e in JournalEntry.query.filter_by(tenant_id=tenant).order_by(JournalEntry.id.desc()).all()])', app_code, flags=re.DOTALL)

# تحديث مسارات POST لحفظ tenant_id
app_code = app_code.replace("c = Customer(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0), credit_limit=data.get('credit_limit', 0))", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    c = Customer(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0), credit_limit=data.get('credit_limit', 0), tenant_id=tenant)")
app_code = app_code.replace("s = Supplier(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0))", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    s = Supplier(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0), tenant_id=tenant)")
app_code = app_code.replace("i = Item(code=data['code'], name=data['name'], barcode=data.get('barcode', ''), purchase_price=data.get('purchase_price', 0), sale_price=data.get('sale_price', 0), qty=data.get('qty', 0), warehouse_name=data.get('warehouse_name', 'المستودع الرئيسي'))", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    i = Item(code=data['code'], name=data['name'], barcode=data.get('barcode', ''), purchase_price=data.get('purchase_price', 0), sale_price=data.get('sale_price', 0), qty=data.get('qty', 0), warehouse_name=data.get('warehouse_name', 'المستودع الرئيسي'), tenant_id=tenant)")
app_code = app_code.replace("i = SalesInvoice(invoice_number=data['invoiceNumber']", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    i = SalesInvoice(invoice_number=data['invoiceNumber'], tenant_id=tenant")
app_code = app_code.replace("i = PurchaseInvoice(invoice_number=data['invoiceNumber']", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    i = PurchaseInvoice(invoice_number=data['invoiceNumber'], tenant_id=tenant")
app_code = app_code.replace("e = JournalEntry(entry_number=data['entryNumber']", "tenant = request.headers.get('X-Tenant-ID', 'default_company')\n    e = JournalEntry(entry_number=data['entryNumber'], tenant_id=tenant")

# تحديث مسار التفعيل ليعيد tenant_id
app_code = app_code.replace("return jsonify({\"success\": True, \"message\": \"تم تفعيل النظام بنجاح!\"}), 200", "return jsonify({\"success\": True, \"message\": \"تم تفعيل النظام بنجاح!\", \"tenant_id\": ac.tenant_id}), 200")
app_code = app_code.replace("return jsonify({\"success\": True, \"message\": \"مرحباً أيها المدير\"}), 200", "return jsonify({\"success\": True, \"message\": \"مرحباً أيها المدير\", \"tenant_id\": \"default_company\"}), 200")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_code)
print("✅ 2. تم تحديث app.py لفلترة البيانات حسب الشركة.")

# 3. تحديث database.js (إرسال X-Tenant-ID مع كل طلب)
db_path = 'assets/js/database.js'
with open(db_path, 'r', encoding='utf-8') as f:
    db_js = f.read()

# إضافة الهيدر لجميع طلبات fetch
db_js = db_js.replace("headers: { 'Content-Type': 'application/json' }", "headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company' }")
# إضافة الهيدر لطلبات GET
db_js = db_js.replace("fetch('http://localhost:5000/api/", "fetch('/api/") # تحويل المسارات المطلقة لنسبية أولاً
db_js = db_js.replace("await fetch('/api/", "await fetch('/api/")

with open(db_path, 'w', encoding='utf-8') as f:
    f.write(db_js)
print("✅ 3. تم تحديث database.js لإرسال معرف الشركة.")

# 4. تحديث activate.html لحفظ tenant_id
activate_path = 'pages/activate.html'
with open(activate_path, 'r', encoding='utf-8') as f:
    activate_html = f.read()

activate_html = activate_html.replace("localStorage.setItem('onyx_license_valid', 'true');", "localStorage.setItem('onyx_license_valid', 'true');\n                    localStorage.setItem('onyx_tenant_id', data.tenant_id || 'default_company');")

with open(activate_path, 'w', encoding='utf-8') as f:
    f.write(activate_html)
print("✅ 4. تم تحديث صفحة التفعيل لحفظ معرف الشركة.")

# 5. تحديث سكربت توليد الأكواد ليدعم أسماء الشركات
generator_script = """import uuid
import sys
from backend.app import app, db
from backend.models import ActivationCode

def generate_codes(count=1, company_name="default_company"):
    with app.app_context():
        print(f"⏳ جاري توليد {count} كود تفعيل لشركة: {company_name}...")
        new_codes = []
        for _ in range(count):
            raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
            formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
            
            while ActivationCode.query.filter_by(code=formatted_code).first():
                raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
                formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
                
            new_code = ActivationCode(code=formatted_code, is_used=False, tenant_id=company_name)
            db.session.add(new_code)
            new_codes.append(formatted_code)
            
        db.session.commit()
        print("=" * 50)
        print(f"🎉 تم توليد الأكواد لشركة ({company_name}) بنجاح!")
        for code in new_codes:
            print(f"🔑 {code}")
        print("=" * 50)
        total_unused = ActivationCode.query.filter_by(is_used=False).count()
        print(f"📊 إجمالي الأكواد المتاحة للبيع في النظام كله: {total_unused}")

if __name__ == '__main__':
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    company = sys.argv[2] if len(sys.argv) > 2 else "default_company"
    generate_codes(count, company)
"""
with open('generate_codes.py', 'w', encoding='utf-8') as f:
    f.write(generator_script)
print("✅ 5. تم تحديث سكربت توليد الأكواد ليدعم أسماء الشركات.")

# تحديث الكاش
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=111112"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

print("🎉 اكتمل بناء نظام عزل الشركات (Multi-Tenancy)!")
