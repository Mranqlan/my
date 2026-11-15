import os
import re

print("🤖 بدء بناء المساعد الذكي (AI Assistant) وربطه بالنظام...")

# 1. تثبيت مكتبة requests (للاتصال بـ Pollinations API)
with open('requirements.txt', 'r', encoding='utf-8') as f:
    reqs = f.read()
if 'requests' not in reqs:
    with open('requirements.txt', 'a', encoding='utf-8') as f:
        f.write("\nrequests\n")

# 2. تحديث app.py لإضافة مسار /api/chat مع سياق ديناميكي
app_path = 'backend/app.py'
with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

if '/api/chat' not in app_code:
    chat_route = """
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

"""
    app_code = app_code.replace("# ==========================================\n# مسار تقديم الواجهة الأمامية", chat_route + "\n# ==========================================\n# مسار تقديم الواجهة الأمامية")
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_code)
    print("✅ 1. تم إضافة مسار /api/chat إلى الخادم مع سياق البيانات.")

# 3. إنشاء واجهة الدردشة (ai-assistant.js)
ai_js = """
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('landing.html') || window.location.pathname.includes('activate.html')) return;
    
    injectAIAssistant();
});

function injectAIAssistant() {
    const btn = document.createElement('div');
    btn.id = 'ai-btn';
    btn.innerHTML = '🤖';
    btn.style.cssText = 'position: fixed; bottom: 30px; left: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 30px; cursor: pointer; box-shadow: 0 10px 25px rgba(16,185,129,0.4); z-index: 99999; transition: 0.3s;';
    btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = toggleChat;
    document.body.appendChild(btn);

    const chat = document.createElement('div');
    chat.id = 'ai-chat-box';
    chat.style.cssText = 'position: fixed; bottom: 100px; left: 30px; width: 380px; height: 500px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; display: none; flex-direction: column; z-index: 99998; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden;';
    
    chat.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 35px; height: 35px; background: #10b981; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; box-shadow: 0 0 15px rgba(16,185,129,0.5);">🤖</div>
                <div>
                    <h4 style="color: white; margin: 0; font-size: 14px;">مساعد تعز سوفت</h4>
                    <span style="color: #10b981; font-size: 11px;">● متصل الآن</span>
                </div>
            </div>
            <button onclick="toggleChat()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div id="ai-messages" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
            <div style="background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 12px 12px 12px 0; color: #e2e8f0; font-size: 13px; line-height: 1.6;">
                مرحباً بك في تعز سوفت! أنا مساعدك الذكي. يمكنك سؤالي عن (المبيعات، المخزون، الديون، أو أي استفسار محاسبي).
            </div>
        </div>
        <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
            <input type="text" id="ai-input" placeholder="اكتب سؤالك هنا..." style="flex: 1; padding: 12px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; outline: none; font-family: inherit; font-size: 13px;" onkeypress="if(event.key === 'Enter') sendAIMessage()">
            <button onclick="sendAIMessage()" style="background: #10b981; color: white; border: none; border-radius: 50%; width: 42px; height: 42px; cursor: pointer; font-size: 18px;">➤</button>
        </div>
    `;
    document.body.appendChild(chat);
}

function toggleChat() {
    const box = document.getElementById('ai-chat-box');
    box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    if (box.style.display === 'flex') document.getElementById('ai-input').focus();
}

async function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;

    const messages = document.getElementById('ai-messages');
    
    messages.innerHTML += `<div style="background: #10b981; color: white; padding: 12px 15px; border-radius: 12px 12px 0 12px; align-self: flex-end; max-width: 85%; font-size: 13px; line-height: 1.6;">${text}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    const typingId = 'typing-' + Date.now();
    messages.innerHTML += `<div id="${typingId}" style="background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 12px 12px 12px 0; color: #e2e8f0; font-size: 13px; align-self: flex-start;">يفكر...</div>`;
    messages.scrollTop = messages.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company'
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        document.getElementById(typingId).remove();
        messages.innerHTML += `<div style="background: rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 12px 12px 12px 0; color: #e2e8f0; font-size: 13px; line-height: 1.6; max-width: 85%; align-self: flex-start;">${data.reply}</div>`;
    } catch(e) {
        document.getElementById(typingId).remove();
        messages.innerHTML += `<div style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 15px; border-radius: 12px 12px 12px 0; font-size: 13px; align-self: flex-start;">تعذر الاتصال بالمساعد.</div>`;
    }
    messages.scrollTop = messages.scrollHeight;
}
"""
with open('assets/js/ai-assistant.js', 'w', encoding='utf-8') as f:
    f.write(ai_js)
print("✅ 2. تم إنشاء واجهة المساعد الذكي (ai-assistant.js).")

# 4. إضافة سكربت المساعد لجميع الصفحات
count = 0
for root, dirs, files in os.walk('.'):
    if '.venv' in root or '.git' in root or '__pycache__' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
            
            if 'ai-assistant.js' not in html:
                html = html.replace('</body>', '<script src="/assets/js/ai-assistant.js?v=111000"></script>\n</body>')
            
            html = re.sub(r'src="([^"]+\.js)(\?v=\d+)?"', r'src="\1?v=111000"', html)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1

print(f"✅ 3. تم إضافة المساعد الذكي إلى {count} صفحة.")
print("🎉 اكتمل بناء المساعد الذكي! يرجى الرفع إلى GitHub.")
