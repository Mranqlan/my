from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='accountant')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20))
    balance = db.Column(db.Float, default=0.0)
    credit_limit = db.Column(db.Float, default=0.0)
    is_on_hold = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20))
    balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    barcode = db.Column(db.String(50))
    purchase_price = db.Column(db.Float, default=0.0)
    sale_price = db.Column(db.Float, default=0.0)
    qty = db.Column(db.Float, default=0.0)
    warehouse_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_number = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.String(255))
    lines_json = db.Column(db.Text, nullable=False)
    total_debit = db.Column(db.Float, default=0.0)
    total_credit = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='posted')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SalesInvoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    customer_name = db.Column(db.String(150))
    date = db.Column(db.String(20))
    total = db.Column(db.Float)
    warehouse = db.Column(db.String(100))
    branch_name = db.Column(db.String(100))
    currency = db.Column(db.String(10))
    exchange_rate = db.Column(db.Float)
    base_total = db.Column(db.Float)
    items_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PurchaseInvoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'))
    supplier_name = db.Column(db.String(150))
    date = db.Column(db.String(20))
    total = db.Column(db.Float)
    warehouse = db.Column(db.String(100))
    branch_name = db.Column(db.String(100))
    items_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# جدول أكواد التفعيل
class ActivationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    used_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
