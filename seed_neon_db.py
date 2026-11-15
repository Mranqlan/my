
import os
from dotenv import load_dotenv
load_dotenv()

from backend.app import app, db
from backend.models import Customer, Supplier, Item, JournalEntry, SalesInvoice

with app.app_context():
    print("⏳ جاري الاتصال بقاعدة بيانات Neon...")
    
    # التحقق مما إذا كانت القاعدة فارغة
    if Customer.query.count() == 0:
        print("💉 جاري حقن البيانات التجريبية...")
        
        # 1. العملاء
        c1 = Customer(code="C-001", name="شركة المراعي", phone="0555555555", balance=0, credit_limit=50000)
        c2 = Customer(code="C-002", name="مؤسسة النور", phone="0544444444", balance=0, credit_limit=20000)
        db.session.add_all([c1, c2])

        # 2. الموردين
        s1 = Supplier(code="SUP-001", name="شركة الحلول المتقدمة", phone="0500000000", balance=0)
        db.session.add(s1)

        # 3. الأصناف
        i1 = Item(code="ITM-001", name="لابتوب Dell XPS", barcode="123456789012", purchase_price=3000, sale_price=4500, qty=50, warehouse_name="المستودع الرئيسي")
        i2 = Item(code="ITM-002", name="شاشة سامسونج 27 بوصة", barcode="987654321098", purchase_price=800, sale_price=1200, qty=30, warehouse_name="المستودع الرئيسي")
        i3 = Item(code="ITM-003", name="ماوس لاسلكي", barcode="112233445566", purchase_price=50, sale_price=100, qty=100, warehouse_name="المستودع الرئيسي")
        db.session.add_all([i1, i2, i3])
        
        db.session.commit()
        print("✅ تم حقن البيانات بنجاح! (عملاء، موردين، أصناف)")
    else:
        print("⚠️ قاعدة البيانات تحتوي على بيانات بالفعل.")

if __name__ == '__main__':
    pass
