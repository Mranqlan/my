import os
import re

print("🛠️ جاري إصلاح مشكلة 502 Bad Gateway في المساعد الذكي...")

# 1. تحديث ملف Procfile لزيادة مهلة gunicorn
procfile_path = 'Procfile'
if os.path.exists(procfile_path):
    with open(procfile_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if '--timeout' not in content:
        content = "web: gunicorn backend.app:app --timeout 120 --workers 1\n"
        with open(procfile_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ 1. تم تحديث Procfile لزيادة مهلة gunicorn إلى 120 ثانية.")

# 2. تحديث app.py لإضافة إعادة المحاولة وتحسين معالجة الأخطاء
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

# استبدال دالة ai_chat الحالية بنسخة محسنة
old_func_pattern = r"@app\.route\('/api/chat', methods=\['POST'\]\)\ndef ai_chat\(\):.*?\n    return jsonify\(\{\"reply\": bot_reply\}\)\n"
new_func = """@app.route('/api/chat', methods=['POST'])
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

    # الاتصال بـ Pollinations API مع إعادة المحاولة
    bot_reply = None
    last_error = ""
    
    for attempt in range(3):  # محاولة 3 مرات كحد أقصى
        try:
            payload = {
                "model": "openai",
                "messages": [
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.7
            }
            response = requests.post(
                'https://text.pollinations.ai/openai', 
                json=payload, 
                timeout=90  # زيادة المهلة إلى 90 ثانية
            )
            
            if response.status_code == 200:
                bot_reply = response.json()['choices'][0]['message']['content']
                break  # نجح، اخرج من الحلقة
            elif response.status_code == 502:
                last_error = "الخادم الخارجي مشغول (502). جاري إعادة المحاولة..."
                continue  # أعد المحاولة
            else:
                last_error = f"خطأ من الخادم الخارجي (كود {response.status_code})."
                break
                
        except requests.exceptions.Timeout:
            last_error = "انتهت مهلة الاتصال بالخادم الخارجي. جاري إعادة المحاولة..."
            continue
        except Exception as e:
            last_error = f"تعذر الاتصال بالخادم: {str(e)}"
            break

    if not bot_reply:
        bot_reply = f"عذراً، واجهت مشكلة في الاتصال بالذكاء الاصطناعي. {last_error}"

    return jsonify({"reply": bot_reply})
"""
if re.search(old_func_pattern, app_code, flags=re.DOTALL):
    app_code = re.sub(old_func_pattern, new_func, app_code, flags=re.DOTALL)
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_code)
    print("✅ 2. تم تحديث app.py لإضافة إعادة المحاولة وتحسين معالجة الأخطاء.")
else:
    print("⚠️ لم يتم العثور على دالة ai_chat القديمة. قد يكون الكود قد تغير.")

# 3. تحديث ai-assistant.js لعرض رسالة خطأ أوضح
ai_js_path = 'assets/js/ai-assistant.js'
with open(ai_js_path, 'r', encoding='utf-8') as f:
    ai_js = f.read()

# تحسين رسالة الخطأ في حالة فشل الاتصال
old_error = "messages.innerHTML += `<div style=\"background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 15px; border-radius: 12px 12px 12px 0; font-size: 13px; align-self: flex-start;\">عذراً، الخادم يستغرق وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى.</div>`;"
new_error = "messages.innerHTML += `<div style=\"background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 15px; border-radius: 12px 12px 12px 0; font-size: 13px; align-self: flex-start;\">عذراً، واجهت مشكلة في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.</div>`;"
ai_js = ai_js.replace(old_error, new_error)

with open(ai_js_path, 'w', encoding='utf-8') as f:
    f.write(ai_js)
print("✅ 3. تم تحديث رسالة الخطأ في واجهة المساعد.")

# 4. تحديث الكاش
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=222333"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 4. تم تحديث الكاش لـ {count} صفحة.")
print("🎉 اكتمل الإصلاح! يرجى الرفع إلى GitHub.")
