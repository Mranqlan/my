from backend.app import app, db
from backend.models import Customer, Supplier, Item, JournalEntry, SalesInvoice, PurchaseInvoice, ActivationCode, User

with app.app_context():
    print("⏳ جاري مسح الجداول القديمة وإنشاء جداول جديدة تدعم تعدد الشركات...")
    db.drop_all()
    db.create_all()
    print("✅ تم إعادة بناء قاعدة البيانات بنجاح!")
    print("ملاحظة: أي بيانات قديمة تم مسحها. يمكنك الآن توليد أكواد جديدة واختبار العزل.")
