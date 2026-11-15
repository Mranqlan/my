import uuid
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
