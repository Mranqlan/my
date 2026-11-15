document.addEventListener('DOMContentLoaded', async () => {
    const accounts = await getAccounts();
    const selector = document.getElementById('account-selector');
    selector.innerHTML = '<option value="">-- اختر الحساب لعرض كشفه --</option>';
    accounts.forEach(acc => {
        if (acc.level >= 2) {
            let prefix = acc.level === 3 ? '↳ ' : '';
            selector.innerHTML += `<option value="${acc.code}">${prefix}${acc.code} - ${acc.name}</option>`;
        }
    });
});

async function generateStatement() {
    const selectedCode = document.getElementById('account-selector').value;
    const tbody = document.getElementById('statement-body');
    const headerBox = document.getElementById('statement-header');
    
    if (!selectedCode) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">يرجى اختيار حساب من القائمة أعلاه لعرض الحركات.</td></tr>';
        headerBox.style.display = 'none';
        return;
    }

    const accounts = await getAccounts();
    const entries = await getEntries();
    const account = accounts.find(a => a.code === selectedCode);
    
    document.getElementById('statement-account-name').textContent = `${account.code} - ${account.name}`;
    headerBox.style.display = 'block';

    let statementLines = [];
    entries.forEach(entry => {
        entry.lines.forEach(line => {
            if (line.accountCode === selectedCode) {
                statementLines.push({ date: entry.date, entryNumber: entry.entryNumber, description: entry.description, debit: line.debit, credit: line.credit });
            }
        });
    });

    statementLines.sort((a, b) => new Date(a.date) - new Date(b.date));
    tbody.innerHTML = '';
    let runningBalance = 0;

    if (statementLines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">لا توجد حركات مسجلة على هذا الحساب.</td></tr>';
        return;
    }

    statementLines.forEach(line => {
        runningBalance += (line.debit - line.credit);
        let balanceText = Math.abs(runningBalance).toFixed(2);
        let balanceClass = runningBalance >= 0 ? 'text-debit' : 'text-credit';
        let balanceType = runningBalance >= 0 ? 'مدين' : 'دائن';

        tbody.innerHTML += `
            <tr>
                <td>${line.date}</td>
                <td>${line.entryNumber}</td>
                <td style="text-align: right;">${line.description}</td>
                <td>${line.debit > 0 ? line.debit.toFixed(2) : '-'}</td>
                <td>${line.credit > 0 ? line.credit.toFixed(2) : '-'}</td>
                <td class="${balanceClass}">${balanceText} ${balanceType}</td>
            </tr>
        `;
    });
}
