// ==========================================
// ONYX AI Assistant - Powered by Real LLM
// ==========================================

let chatHistory = [];
let isTyping = false;

document.addEventListener('DOMContentLoaded', () => {
    injectAssistantWidget();
});

function injectAssistantWidget() {
    if (document.getElementById('ai-assistant-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'ai-assistant-btn';
    btn.innerHTML = '<span style="font-size: 26px;">🤖</span>';
    btn.style.cssText = `position: fixed; bottom: 25px; left: 25px; width: 65px; height: 65px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5); z-index: 99999; transition: all 0.3s ease;`;
    btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = toggleAssistant;
    document.body.appendChild(btn);

    const chat = document.createElement('div');
    chat.id = 'ai-assistant-chat';
    chat.style.cssText = `position: fixed; bottom: 100px; left: 25px; width: 420px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.25); display: none; flex-direction: column; z-index: 99998; overflow: hidden; border: 1px solid #e2e8f0;`;
    chat.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 38px; height: 38px; background: #10b981; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px;">🤖</div>
                <div>
                    <div style="font-weight: bold; font-size: 15px;">ONYX AI</div>
                    <div style="font-size: 11px; opacity: 0.8;" id="ai-status">● متصل - اسألني أي شيء</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="clearChat()" title="محادثة جديدة" style="background: rgba(255,255,255,0.1); border: none; color: white; font-size: 14px; cursor: pointer; padding: 5px 10px; border-radius: 6px;">🔄 جديد</button>
                <button onclick="toggleAssistant()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            </div>
        </div>
        <div id="ai-messages" style="flex: 1; padding: 15px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 12px;"></div>
        <div style="padding: 10px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;">
            <input type="text" id="ai-input" placeholder="اسألني أي شيء..." style="flex: 1; padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 25px; outline: none; font-family: inherit; font-size: 14px;" onkeypress="if(event.key === 'Enter') sendAIMessage()">
            <button onclick="sendAIMessage()" style="background: #10b981; color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 18px;">➤</button>
        </div>
    `;
    document.body.appendChild(chat);
}

function toggleAssistant() {
    const chat = document.getElementById('ai-assistant-chat');
    if (!chat) return;
    if (chat.style.display === 'none' || chat.style.display === '') {
        chat.style.display = 'flex';
        if (document.getElementById('ai-messages').children.length === 0) {
            addAIMessage('bot', '👋 أهلاً بك! أنا مساعدك الذكي في ONYX PRO.\n\nأنا على علم بكل تفاصيل نظامك المحاسبي (المبيعات، الأرباح، العملاء، الموظفين، المخزون...).\n\nيمكنك أن تسألني أي سؤال، أو حتى أن تتحدث معي بشكل طبيعي! 💬');
        }
        setTimeout(() => document.getElementById('ai-input').focus(), 100);
    } else {
        chat.style.display = 'none';
    }
}

function clearChat() {
    chatHistory = [];
    document.getElementById('ai-messages').innerHTML = '';
    addAIMessage('bot', '🔄 محادثة جديدة! تفضل، اسألني أي شيء.');
}

function addAIMessage(sender, text) {
    const messages = document.getElementById('ai-messages');
    const msg = document.createElement('div');
    if (sender === 'bot') {
        msg.style.cssText = 'background: white; padding: 12px 15px; border-radius: 12px 12px 12px 4px; max-width: 88%; box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-line;';
    } else {
        msg.style.cssText = 'background: #10b981; color: white; padding: 12px 15px; border-radius: 12px 12px 4px 12px; max-width: 88%; align-self: flex-end; font-size: 14px; line-height: 1.7; white-space: pre-line;';
    }
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    const messages = document.getElementById('ai-messages');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.style.cssText = 'background: white; padding: 12px 15px; border-radius: 12px 12px 12px 4px; max-width: 60px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; gap: 4px;';
    typing.innerHTML = '<span style="animation: blink 1.4s infinite 0.2s;">●</span><span style="animation: blink 1.4s infinite 0.4s;">●</span><span style="animation: blink 1.4s infinite 0.6s;">●</span>';
    const style = document.createElement('style');
    style.textContent = '@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }';
    document.head.appendChild(style);
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
}

// ==========================================
// جمع ملخص كامل عن النظام لتغذية الذكاء الاصطناعي
// ==========================================
function buildSystemContext() {
    const customers = getCustomers ? getCustomers() : [];
    const suppliers = getSuppliers ? getSuppliers() : [];
    const invoices = getInvoices ? getInvoices() : [];
    const purchases = getPurchases ? getPurchases() : [];
    const entries = getEntries ? getEntries() : [];
    const employees = getEmployees ? getEmployees() : [];
    const items = getItems ? getItems() : [];
    const branches = getCostCenters ? getCostCenters().filter(c => c.type === 'فرع') : [];
    const accounts = getAccounts ? getAccounts() : [];
    const settings = typeof getSettings === 'function' ? getSettings() : { companyName: 'ONYX PRO' };

    let totalRevenue = 0, totalExpense = 0, cashBalance = 0, bankBalance = 0;
    let outputVAT = 0, inputVAT = 0;

    accounts.forEach(acc => {
        let bal = 0;
        entries.forEach(e => e.lines.forEach(l => {
            if (l.accountCode === acc.code) {
                if (acc.type === 'أصول' || acc.type === 'مصروفات') bal += (l.debit - l.credit);
                else bal += (l.credit - l.debit);
            }
        }));
        if (acc.type === 'إيرادات') totalRevenue += bal;
        if (acc.type === 'مصروفات') totalExpense += bal;
        if (acc.code === '1101') cashBalance = bal;
        if (acc.code === '1102') bankBalance = bal;
    });
    entries.forEach(e => e.lines.forEach(l => {
        if (l.accountCode === '2102') outputVAT += (l.credit - l.debit);
        if (l.accountCode === '1105') inputVAT += (l.debit - l.credit);
    }));

    const netProfit = totalRevenue - totalExpense;
    const topDebtors = customers.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance).slice(0, 3).map(c => `${c.name}: ${parseFloat(c.balance).toFixed(2)}`).join(', ');
    const lowStock = items.filter(i => i.qty <= 5).slice(0, 3).map(i => `${i.name}: ${i.qty}`).join(', ');
    const totalSalaries = employees.reduce((s, e) => s + (parseFloat(e.base)||0) + (parseFloat(e.allow)||0), 0);

    return `أنت "ONYX AI"، المساعد الذكي لنظام المحاسبة "ONYX PRO" الخاص بشركة "${settings.companyName}".
تحدث بالعربية بأسلوب ودود واحترافي ومختصر. أنت خبير محاسبي وإداري.
لديك صلاحية الاطلاع على البيانات التالية في الوقت الحقيقي:

📊 الملخص المالي:
- إجمالي الإيرادات: ${totalRevenue.toFixed(2)} ريال
- إجمالي المصروفات: ${totalExpense.toFixed(2)} ريال
- صافي الربح/الخسارة: ${netProfit.toFixed(2)} ريال
- هامش الربح: ${totalRevenue > 0 ? ((netProfit/totalRevenue)*100).toFixed(1) : 0}%
- رصيد الصندوق: ${cashBalance.toFixed(2)} ريال
- رصيد البنك: ${bankBalance.toFixed(2)} ريال
- ضريبة المخرجات: ${outputVAT.toFixed(2)} | ضريبة المدخلات: ${inputVAT.toFixed(2)} | صافي الضريبة: ${(outputVAT - inputVAT).toFixed(2)}

👥 العملاء والموردين:
- عدد العملاء: ${customers.length}
- أكبر المدينين: ${topDebtors || 'لا يوجد'}
- عدد الموردين: ${suppliers.length}

📄 الحركات:
- فواتير المبيعات: ${invoices.length}
- فواتير المشتريات: ${purchases.length}
- إجمالي القيود المحاسبية: ${entries.length}

👨‍💼 الموظفين:
- عدد الموظفين: ${employees.length}
- إجمالي الرواتب الشهرية: ${totalSalaries.toFixed(2)} ريال

📦 المخزون:
- عدد الأصناف: ${items.length}
- أصناف منخفضة المخزون: ${lowStock || 'لا يوجد'}

🏢 الفروع: ${branches.map(b => b.name).join(', ') || 'لا يوجد'}

إرشادات:
1. إذا سألك المستخدم عن أي معلومة أعلاه، استخدمها مباشرة.
2. إذا سألك سؤالاً محاسبياً عاماً أو طلب نصيحة، أجب كخبير محاسبي.
3. إذا سألك سؤالاً ودياً (كيف حالك، ما رأيك...)، رد بمودة وتحدث بشكل طبيعي.
4. كن مختصراً (3-5 أسطر كحد أقصى) إلا إذا طلب منك التفصيل.
5. لا تخترع أرقاماً غير موجودة في البيانات أعلاه. إذا لم تكن المعلومة متاحة، قل ذلك بصراحة.`;
}

// ==========================================
// دالة الاتصال بالذكاء الاصطناعي الحقيقي
// ==========================================
async function getAIResponse(userMessage) {
    const systemPrompt = buildSystemContext();
    
    // إضافة رسالة المستخدم إلى التاريخ
    chatHistory.push({ role: 'user', content: userMessage });
    
    // الاحتفاظ بآخر 10 رسائل فقط لعدم تجاوز الحجم
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory
    ];

    try {
        // استخدام واجهة Pollinations.ai - مجانية ولا تحتاج مفتاح API
        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': localStorage.getItem('onyx_tenant_id') || 'default_company' },
            body: JSON.stringify({
                model: 'openai',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        const botReply = data.choices[0].message.content;
        
        chatHistory.push({ role: 'assistant', content: botReply });
        return botReply;
    } catch (error) {
        console.error('AI Error:', error);
        // في حالة فشل الاتصال، نستخدم المحرك المحلي كخطة بديلة
        return getLocalFallback(userMessage);
    }
}

// ==========================================
// المحرك المحلي الاحتياطي (في حال فشل الإنترنت)
// ==========================================
function getLocalFallback(text) {
    const q = text.toLowerCase();
    const customers = getCustomers ? getCustomers() : [];
    const employees = getEmployees ? getEmployees() : [];
    const entries = getEntries ? getEntries() : [];
    const items = getItems ? getItems() : [];
    const accounts = getAccounts ? getAccounts() : [];

    let totalRevenue = 0, totalExpense = 0;
    accounts.forEach(acc => {
        let bal = 0;
        entries.forEach(e => e.lines.forEach(l => { if (l.accountCode === acc.code) { if (acc.type === 'أصول' || acc.type === 'مصروفات') bal += (l.debit - l.credit); else bal += (l.credit - l.debit); } }));
        if (acc.type === 'إيرادات') totalRevenue += bal;
        if (acc.type === 'مصروفات') totalExpense += bal;
    });

    if (q.match(/ربح|صافي/i)) return `صافي الربح: ${(totalRevenue - totalExpense).toFixed(2)} ريال`;
    if (q.match(/مبيعات|إيراد/i)) return `إجمالي الإيرادات: ${totalRevenue.toFixed(2)} ريال`;
    if (q.match(/مصروف/i)) return `إجمالي المصروفات: ${totalExpense.toFixed(2)} ريال`;
    if (q.match(/عميل/i)) return `عدد العملاء: ${customers.length}`;
    if (q.match(/موظف/i)) return `عدد الموظفين: ${employees.length}`;
    if (q.match(/مخزون|صنف/i)) return `عدد الأصناف: ${items.length}`;
    
    return '⚠️ تعذر الاتصال بالذكاء الاصطناعي. يرجى التأكد من اتصالك بالإنترنت.';
}

// ==========================================
// إرسال الرسالة
// ==========================================
async function sendAIMessage() {
    if (isTyping) return;
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;

    addAIMessage('user', text);
    input.value = '';
    isTyping = true;
    
    document.getElementById('ai-status').textContent = '● يكتب...';
    showTyping();

    const reply = await getAIResponse(text);
    
    hideTyping();
    addAIMessage('bot', reply);
    document.getElementById('ai-status').textContent = '● متصل';
    isTyping = false;
}
