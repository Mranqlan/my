document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('report-date').textContent = today.toLocaleDateString('ar-EG');
    generateBalanceSheet();
});

function generateBalanceSheet() {
    const accounts = getAccounts();
    const entries = getEntries();

    let currentAssets = [], fixedAssets = [];
    let currentLiabilities = [], equity = [];
    let totalCurrentAssets = 0, totalFixedAssets = 0;
    let totalCurrentLiabilities = 0, totalEquity = 0;
    let totalRevenue = 0, totalExpense = 0;

    accounts.forEach(acc => {
        if (acc.level === 1) return;
        let balance = 0;
        entries.forEach(entry => {
            entry.lines.forEach(line => {
                if (line.accountCode === acc.code) {
                    if (acc.type === 'أصول' || acc.type === 'مصروفات') balance += (line.debit - line.credit);
                    else balance += (line.credit - line.debit);
                }
            });
        });

        if (balance === 0) return;

        // تصنيف الأصول
        if (acc.type === 'أصول') {
            // الأصول الثابتة تبدأ بـ 12 والمتداولة تبدأ بـ 11
            if (acc.code.startsWith('12')) {
                fixedAssets.push({ name: acc.name, amount: balance });
                totalFixedAssets += balance;
            } else {
                currentAssets.push({ name: acc.name, amount: balance });
                totalCurrentAssets += balance;
            }
        } 
        // تصنيف الخصوم
        else if (acc.type === 'خصوم') {
            currentLiabilities.push({ name: acc.name, amount: balance });
            totalCurrentLiabilities += balance;
        } 
        // حقوق الملكية
        else if (acc.type === 'حقوق ملكية') {
            equity.push({ name: acc.name, amount: balance });
            totalEquity += balance;
        } else if (acc.type === 'إيرادات') {
            totalRevenue += balance;
        } else if (acc.type === 'مصروفات') {
            totalExpense += balance;
        }
    });

    // إضافة صافي الربح لحقوق الملكية
    const netIncome = totalRevenue - totalExpense;
    if (netIncome !== 0) {
        equity.push({ name: 'صافي ربح (خسارة) الفترة الحالية', amount: netIncome });
        totalEquity += netIncome;
    }

    // --- عرض الأصول ---
    const assetsBody = document.getElementById('assets-rows');
    assetsBody.innerHTML = '';
    
    if (currentAssets.length > 0) {
        assetsBody.innerHTML += `<tr><td colspan="2" style="background:#f8fafc; font-weight:bold; color:#64748b;">الأصول المتداولة</td></tr>`;
        currentAssets.forEach(a => { assetsBody.innerHTML += `<tr><td class="indent-cell">${a.name}</td><td class="text-debit">${a.amount.toFixed(2)}</td></tr>`; });
    }
    if (fixedAssets.length > 0) {
        assetsBody.innerHTML += `<tr><td colspan="2" style="background:#f8fafc; font-weight:bold; color:#64748b;">الأصول الثابتة</td></tr>`;
        fixedAssets.forEach(a => { assetsBody.innerHTML += `<tr><td class="indent-cell">${a.name}</td><td class="text-debit">${a.amount.toFixed(2)}</td></tr>`; });
    }
    const grandTotalAssets = totalCurrentAssets + totalFixedAssets;
    document.getElementById('total-assets').textContent = grandTotalAssets.toFixed(2);

    // --- عرض الخصوم وحقوق الملكية ---
    const leBody = document.getElementById('liabilities-equity-rows');
    leBody.innerHTML = '';
    
    if (currentLiabilities.length > 0) {
        leBody.innerHTML += `<tr><td colspan="2" style="background:#f8fafc; font-weight:bold; color:#64748b;">الخصوم المتداولة</td></tr>`;
        currentLiabilities.forEach(l => { leBody.innerHTML += `<tr><td class="indent-cell">${l.name}</td><td class="text-credit">${l.amount.toFixed(2)}</td></tr>`; });
    }
    if (equity.length > 0) {
        leBody.innerHTML += `<tr><td colspan="2" style="background:#f8fafc; font-weight:bold; color:#64748b;">حقوق الملكية</td></tr>`;
        equity.forEach(e => { leBody.innerHTML += `<tr><td class="indent-cell">${e.name}</td><td class="text-credit">${e.amount.toFixed(2)}</td></tr>`; });
    }
    
    const grandTotalLE = totalCurrentLiabilities + totalEquity;
    document.getElementById('total-liabilities-equity').textContent = grandTotalLE.toFixed(2);

    // التحقق من التوازن
    const checkBox = document.getElementById('balance-check');
    if (Math.abs(grandTotalAssets - grandTotalLE) < 0.01) {
        checkBox.textContent = "✅ الميزانية متوازنة (الأصول = الخصوم + حقوق الملكية)";
        checkBox.style.backgroundColor = '#d1fae5'; checkBox.style.color = '#10b981';
    } else {
        checkBox.textContent = `⚠️ الميزانية غير متوازنة (الفرق: ${Math.abs(grandTotalAssets - grandTotalLE).toFixed(2)})`;
        checkBox.style.backgroundColor = '#fee2e2'; checkBox.style.color = '#ef4444';
    }
}
