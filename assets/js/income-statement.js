document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('report-date').textContent = today.toLocaleDateString('ar-EG');
    generateIncomeStatement();
});

function generateIncomeStatement() {
    const accounts = getAccounts();
    const entries = getEntries();

    let revenues = [], expenses = [], totalRevenue = 0, totalExpense = 0;

    accounts.forEach(acc => {
        // نبحث فقط عن الإيرادات والمصروفات
        if (acc.type === 'إيرادات' || acc.type === 'مصروفات') {
            let balance = 0;

            entries.forEach(entry => {
                entry.lines.forEach(line => {
                    if (line.accountCode === acc.code) {
                        if (acc.type === 'إيرادات') balance += (line.credit - line.debit);
                        else balance += (line.debit - line.credit);
                    }
                });
            });

            if (balance !== 0) {
                if (acc.type === 'إيرادات') { revenues.push({ name: acc.name, amount: balance }); totalRevenue += balance; }
                else { expenses.push({ name: acc.name, amount: balance }); totalExpense += balance; }
            }
        }
    });

    const netIncome = totalRevenue - totalExpense;

    const revBody = document.getElementById('revenue-rows');
    revBody.innerHTML = revenues.length === 0 ? '<tr><td colspan="2" style="text-align:center;">لا توجد إيرادات</td></tr>' : '';
    revenues.forEach(rev => { revBody.innerHTML += `<tr><td class="indent-cell">${rev.name}</td><td class="text-credit">${rev.amount.toFixed(2)}</td></tr>`; });
    document.getElementById('total-revenue').textContent = totalRevenue.toFixed(2);

    const expBody = document.getElementById('expense-rows');
    expBody.innerHTML = expenses.length === 0 ? '<tr><td colspan="2" style="text-align:center;">لا توجد مصروفات</td></tr>' : '';
    expenses.forEach(exp => { expBody.innerHTML += `<tr><td class="indent-cell">${exp.name}</td><td class="text-debit">${exp.amount.toFixed(2)}</td></tr>`; });
    document.getElementById('total-expense').textContent = totalExpense.toFixed(2);

    const netEl = document.getElementById('net-income-value');
    netEl.textContent = Math.abs(netIncome).toFixed(2) + (netIncome >= 0 ? ' (ربح)' : ' (خسارة)');
    netEl.className = netIncome >= 0 ? 'text-success' : 'text-danger';
    document.getElementById('net-income-row').style.backgroundColor = netIncome >= 0 ? '#d1fae5' : '#fee2e2';
}
