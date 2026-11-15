from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    account_type = db.Column(db.String(50), nullable=False)
    balance = db.Column(db.Float, default=0.0)

class Party(db.Model):
    __tablename__ = 'parties'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    party_type = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    balance = db.Column(db.Float, default=0.0)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    sale_price = db.Column(db.Float, nullable=False)
    stock_qty = db.Column(db.Integer, default=0)

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    id = db.Column(db.Integer, primary_key=True)
    entry_number = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    items = db.relationship('JournalItem', backref='entry', cascade='all, delete-orphan')

class JournalItem(db.Model):
    __tablename__ = 'journal_items'
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey('journal_entries.id'), nullable=False)
    account_code = db.Column(db.String(20), nullable=False)
    account_name = db.Column(db.String(120), nullable=False)
    debit = db.Column(db.Float, default=0.0)
    credit = db.Column(db.Float, default=0.0)

# جدول إعدادات الشركة والعملات
class CompanySettings(db.Model):
    __tablename__ = 'company_settings'
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(150), default="شركة إيهاب التجارية")
    main_currency = db.Column(db.String(20), default="ريال يمني (YER)")
    secondary_currency = db.Column(db.String(20), default="دولار أمريكي (USD)")
    exchange_rate = db.Column(db.Float, default=250.0)
    fiscal_year_start = db.Column(db.String(20), default="2026-01-01")
