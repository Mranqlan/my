
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('landing.html') || window.location.pathname.includes('activate.html')) return;
    
    injectAIAssistant();
});

function injectAIAssistant() {
    // إزالة أي نسخة قديمة إذا وجدت
    if (document.getElementById('ai-btn')) document.getElementById('ai-btn').remove();
    if (document.getElementById('ai-chat-box')) document.getElementById('ai-chat-box').remove();

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
        messages.innerHTML += `<div style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 12px 15px; border-radius: 12px 12px 12px 0; font-size: 13px; align-self: flex-start;">عذراً، الخادم يستغرق وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى.</div>`;
    }
    messages.scrollTop = messages.scrollHeight;
}
