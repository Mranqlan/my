import uuid
import sys
from backend.app import app, db
from backend.models import ActivationCode

def generate_codes(count=1):
    with app.app_context():
        print(f"⏳ جاري توليد {count} كود تفعيل...")
        for _ in range(count):
            # توليد كود بشكل TS-XXXX-XXXX-XXXX
            raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
            formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
            
            # التأكد من عدم تكراره
            while ActivationCode.query.filter_by(code=formatted_code).first():
                raw_code = str(uuid.uuid4()).upper().replace('-', '')[:12]
                formatted_code = f"TS-{raw_code[0:4]}-{raw_code[4:8]}-{raw_code[8:12]}"
                
            new_code = ActivationCode(code=formatted_code, is_used=False)
            db.session.add(new_code)
            print(f"🔑 كود جديد: {formatted_code}")
            
        db.session.commit()
        print("✅ تم حفظ الأكواد في قاعدة البيانات بنجاح!")

if __name__ == '__main__':
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    generate_codes(count)
