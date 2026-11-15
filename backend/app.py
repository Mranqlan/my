from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
load_dotenv()

try:
    from models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice, ActivationCode
except ImportError:
    from backend.models import db, User, Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice, ActivationCode

basedir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(basedir, '..'))

app = Flask(__name__, static_folder=os.path.join(root_dir, 'assets'), template_folder=root_dir)
app.json.ensure_ascii = False
CORS(app)

# قراءة رابط قاعدة البيانات من متغيرات البيئة (Neon)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'alshamel.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True, 'pool_recycle': 60}

db.init_app(app)

with app.app_context():
    db.create_all()
    if not User.query.first():
        db.session.add(User(username='admin', password_hash='123456', full_name='OMRAN AQLAN', role='admin', tenant_id='default_company'))
        db.session.commit()

# ==========================================
# مسارات الـ API (يجب أن تكون قبل مسار الواجهة)
# ==========================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "success", "message": "Server is running perfectly!"})

@app.route('/api/activate', methods=['POST'])
def activate():
    data = request.json
    code_str = data.get('code', '').strip()
    username = data.get('username', 'Unknown')
    
    if code_str == 'omran770136569':
        return jsonify({"success": True, "message": "مرحباً أيها المدير", "tenant_id": "default_company"}), 200

    if not code_str:
        return jsonify({"success": False, "message": "يرجى إدخال الكود"}), 400
        
    ac = ActivationCode.query.filter_by(code=code_str).first()
    if not ac:
        return jsonify({"success": False, "message": "كود التفعيل غير صحيح"}), 404
    if ac.is_used:
        return jsonify({"success": False, "message": "هذا الكود مستخدم بالفعل"}), 400
        
    ac.is_used = True
    ac.used_by = username
    db.session.commit()
    return jsonify({"success": True, "message": "تم تفعيل النظام بنجاح!", "tenant_id": ac.tenant_id}), 200

# --- العملاء ---
@app.route('/api/customers', methods=['GET'])
def get_customers():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    return jsonify([{"id": c.id, "code": c.code, "name": c.name, "phone": c.phone, "balance": c.balance, "credit_limit": c.credit_limit, "is_on_hold": c.is_on_hold} for c in Customer.query.filter_by(tenant_id=tenant).all()])

@app.route('/api/customers', methods=['POST'])
def add_customer():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    c = Customer(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0), credit_limit=data.get('credit_limit', 0), tenant_id=tenant)
    db.session.add(c)
    db.session.commit()
    return jsonify({"id": c.id}), 201

# --- الموردين ---
@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    return jsonify([{"id": s.id, "code": s.code, "name": s.name, "phone": s.phone, "balance": s.balance} for s in Supplier.query.filter_by(tenant_id=tenant).all()])

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    s = Supplier(code=data['code'], name=data['name'], phone=data.get('phone', ''), balance=data.get('balance', 0), tenant_id=tenant)
    db.session.add(s)
    db.session.commit()
    return jsonify({"id": s.id}), 201

# --- الأصناف (المخزون) ---
@app.route('/api/items', methods=['GET'])
def get_items():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    items = Item.query.filter_by(tenant_id=tenant).all()
    return jsonify([{"id": i.id, "code": i.code, "name": i.name, "barcode": i.barcode, "purchase_price": i.purchase_price, "sale_price": i.sale_price, "qty": i.qty, "warehouse_name": i.warehouse_name} for i in items])

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    i = Item(code=data['code'], name=data['name'], barcode=data.get('barcode', ''), purchase_price=data.get('purchase_price', 0), sale_price=data.get('sale_price', 0), qty=data.get('qty', 0), warehouse_name=data.get('warehouse_name', 'المستودع الرئيسي'), tenant_id=tenant)
    db.session.add(i)
    db.session.commit()
    return jsonify({"id": i.id}), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get(item_id)
    if not item: return jsonify({"error": "Item not found"}), 404
    data = request.json
    if 'qty' in data: item.qty = data['qty']
    if 'purchase_price' in data: item.purchase_price = data['purchase_price']
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

# --- القيود المحاسبية ---
@app.route('/api/entries', methods=['GET'])
def get_entries():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    return jsonify([{"id": e.id, "entryNumber": e.entry_number, "date": e.date, "description": e.description, "lines": json.loads(e.lines_json), "totalDebit": e.total_debit, "totalCredit": e.total_credit, "status": e.status} for e in JournalEntry.query.filter_by(tenant_id=tenant).order_by(JournalEntry.id.desc()).all()])

@app.route('/api/entries', methods=['POST'])
def add_entry():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    e = JournalEntry(entry_number=data['entryNumber'], date=data['date'], description=data.get('description', ''), lines_json=json.dumps(data['lines'], ensure_ascii=False), total_debit=data['totalDebit'], total_credit=data['totalCredit'], status='posted', tenant_id=tenant)
    db.session.add(e)
    db.session.commit()
    return jsonify({"id": e.id}), 201

# --- فواتير المبيعات ---
@app.route('/api/sales_invoices', methods=['GET'])
def get_sales():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    return jsonify([{"id": i.id, "invoiceNumber": i.invoice_number, "customerId": i.customer_id, "customerName": i.customer_name, "date": i.date, "total": i.total, "warehouse": i.warehouse, "branchName": i.branch_name, "currency": i.currency, "exchangeRate": i.exchange_rate, "baseTotal": i.base_total, "items": json.loads(i.items_json) if i.items_json else []} for i in SalesInvoice.query.filter_by(tenant_id=tenant).order_by(SalesInvoice.id.desc()).all()])

@app.route('/api/sales_invoices', methods=['POST'])
def add_sale():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    i = SalesInvoice(invoice_number=data['invoiceNumber'], customer_id=data.get('customerId'), customer_name=data.get('customerName'), date=data.get('date'), total=data.get('total', 0), warehouse=data.get('warehouse', ''), branch_name=data.get('branchName', ''), currency=data.get('currency', 'SAR'), exchange_rate=data.get('exchangeRate', 1), base_total=data.get('baseTotal', 0), items_json=json.dumps(data.get('items', []), ensure_ascii=False), tenant_id=tenant)
    db.session.add(i)
    db.session.commit()
    return jsonify({"id": i.id}), 201

# --- فواتير المشتريات ---
@app.route('/api/purchase_invoices', methods=['GET'])
def get_purchases():
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    return jsonify([{"id": i.id, "invoiceNumber": i.invoice_number, "supplierId": i.supplier_id, "supplierName": i.supplier_name, "date": i.date, "total": i.total, "warehouse": i.warehouse, "branchName": i.branch_name, "items": json.loads(i.items_json) if i.items_json else []} for i in PurchaseInvoice.query.filter_by(tenant_id=tenant).order_by(PurchaseInvoice.id.desc()).all()])

@app.route('/api/purchase_invoices', methods=['POST'])
def add_purchase():
    data = request.json
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    i = PurchaseInvoice(invoice_number=data['invoiceNumber'], supplier_id=data.get('supplierId'), supplier_name=data.get('supplierName'), date=data.get('date'), total=data.get('total', 0), warehouse=data.get('warehouse', ''), branch_name=data.get('branchName', ''), items_json=json.dumps(data.get('items', []), ensure_ascii=False), tenant_id=tenant)
    db.session.add(i)
    db.session.commit()
    return jsonify({"id": i.id}), 201


import requests

@app.route('/api/chat', methods=['POST'])
def ai_chat():
    data = request.json
    user_message = data.get('message', '')
    tenant = request.headers.get('X-Tenant-ID', 'default_company')
    
    if not user_message:
        return jsonify({"reply": "لم يتم إرسال أي سؤال."})

    # بناء السياق (Context) من قاعدة البيانات
    try:
        customers = Customer.query.filter_by(tenant_id=tenant).all()
        items = Item.query.filter_by(tenant_id=tenant).all()
        invoices = SalesInvoice.query.filter_by(tenant_id=tenant).all()
        
        total_sales = sum(i.total for i in invoices) if invoices else 0
        total_customers = len(customers)
        low_stock_items = [f"{i.name} (متبقي {i.qty})" for i in items if i.qty <= 5]
        total_debt = sum(c.balance for c in customers) if customers else 0
        
        low_stock_str = ", ".join(low_stock_items) if low_stock_items else "لا توجد أصناف منخفضة"
        
        system_context = f'''أنت مساعد ذكي لنظام "تعز سوفت" المحاسبي ERP. 
تحدث باللغة العربية بأسلوب ودود ومهني ومختصر.
إليك ملخص بيانات الشركة الحالية (التي يراها المستخدم الآن):
- إجمالي المبيعات: {total_sales:,.2f} ريال
- عدد العملاء: {total_customers}
- إجمالي مديونية العملاء: {total_debt:,.2f} ريال
- الأصناف منخفضة المخزون: {low_stock_str}

إجابة المستخدم يجب أن تكون مبنية على هذه البيانات إن سأل عنها. لا تخترع أرقاماً غير موجودة.'''
    except Exception as e:
        system_context = "أنت مساعد ذكي لنظام تعز سوفت. تعذر جلب بيانات الشركة حالياً، أجب بشكل عام."

    # الاتصال بـ Pollinations API
    try:
        payload = {
            "model": "openai",
            "messages": [
                {"role": "system", "content": system_context},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7
        }
        response = requests.post('https://text.pollinations.ai/openai', json=payload, timeout=30)
        
        if response.status_code == 200:
            bot_reply = response.json()['choices'][0]['message']['content']
        else:
            bot_reply = "عذراً، حدث خطأ في خادم الذكاء الاصطناعي. يرجى المحاولة لاحقاً."
    except Exception as e:
        bot_reply = f"تعذر الاتصال بخادم الذكاء الاصطناعي. تأكد من اتصالك بالإنترنت."
        
    return jsonify({"reply": bot_reply})


# ==========================================
# مسار تقديم الواجهة الأمامية (يجب أن يكون في آخر الملف)
# ==========================================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(root_dir, path)):
        return send_from_directory(root_dir, path)
    else:
        return send_from_directory(root_dir, 'landing.html')

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 خادم AL SHAMEL يعمل الآن على http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
