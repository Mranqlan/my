document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('report-date').textContent = today.toLocaleDateString('ar-EG');
    generateCashFlow();
});

function generateCashFlow() {
    const entries = getEntries();
    
    let inflows = [];
    let outflows = [];
    let totalInflow = 0;
    let totalOutflow = 0;

    // حسابات النقدية (الصندوق والبنك)
    const cashAccounts = ['1101', '1102'];

    entries.forEach(entry => {
        // نبحث في كل قيد عن الأطراف التي تأثرت بالنقدية
        let cashLines = entry.lines.filter(line => cashAccounts.includes(line.accountCode));
        
        if (cashLines.length > 0) {
            // إذا كان هناك أكثر من سطر نقدي، نأخذ الصافي
            let netCashChange = 0;
            cashLines.forEach(cl => {
                netCashChange += (cl.debit - cl.credit);
            });

            // نبحث عن الحساب المقابل (الطرف الآخر) لتوضيح سبب التدفق
            let otherLines = entry.lines.filter(line => !cashAccounts.includes(line.accountCode));
            let description = entry.description || 'بدون بيان';
            
            if (otherLines.length > 0) {
                description += ` (حساب: ${otherLines[0].accountName})`;
            }

            if (netCashChange > 0) {
                inflows.push({ date: entry.date, desc: description, amount: netCashChange });
                totalInflow += netCashChange;
            } else if (netCashChange < 0) {
                outflows.push({ date: entry.date, desc: description, amount: Math.abs(netCashChange) });
                totalOutflow += Math.abs(netCashChange);
            }
        }
    });

    renderCashFlow(inflows, totalInflow, outflows, totalOutflow);
}

function renderCashFlow(inflows, totalInflow, outflows, totalOutflow) {
    // 1. عرض المقبوضات
    const inBody = document.getElementById('inflow-rows');
    inBody.innerHTML = inflows.length === 0 ? '<tr><td colspan="2" style="text-align:center; color:#64748b;">لا توجد مقبوضات</td></tr>' : '';
    inflows.forEach(item => {
        inBody.innerHTML += `<tr><td class="indent-cell">${item.date} - ${item.desc}</td><td class="text-success">${item.amount.toFixed(2)}</td></tr>`;
    });
    document.getElementById('total-inflow').textContent = totalInflow.toFixed(2);

    // 2. عرض المدفوعات
    const outBody = document.getElementById('outflow-rows');
    outBody.innerHTML = outflows.length === 0 ? '<tr><td colspan="2" style="text-align:center; color:#64748b;">لا توجد مدفوعات</td></tr>' : '';
    outflows.forEach(item => {
        outBody.innerHTML += `<tr><td class="indent-cell">${item.date} - ${item.desc}</td><td class="text-danger">${item.amount.toFixed(2)}</td></tr>`;
    });
    document.getElementById('total-outflow').textContent = totalOutflow.toFixed(2);

    // 3. صافي التدفق النقدي
    const netCash = totalInflow - totalOutflow;
    const netValueEl = document.getElementById('net-cash-value');
    const netRow = document.getElementById('net-cash-row');

    if (netCash >= 0) {
        netValueEl.textContent = `${netCash.toFixed(2)} (زيادة)`;
        netValueEl.className = 'text-success';
        netRow.style.backgroundColor = '#d1fae5';
    } else {
        netValueEl.textContent = `${Math.abs(netCash).toFixed(2)} (نقص)`;
        netValueEl.className = 'text-danger';
        netRow.style.backgroundColor = '#fee2e2';
    }
}
