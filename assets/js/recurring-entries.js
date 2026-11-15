document.addEventListener('DOMContentLoaded', () => {
    renderRecurring();
});

function renderRecurring() {
    const tbody = document.getElementById('recurring-body');
    const recurring = getRecurringEntries();
    
    tbody.innerHTML = '';
    if (recurring.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 30px;">لا توجد قيود متكررة مسجلة.</td></tr>';
        return;
    }

    recurring.forEach(rec => {
        tbody.innerHTML += `
            <tr>
                <td style="text-align: right; padding-right: 15px; font-weight: bold;">${rec.description}</td>
                <td>${rec.debitName}</td>
                <td>${rec.creditName}</td>
                <td class="text-debit">${parseFloat(rec.amount).toFixed(2)}</td>
                <td>
                    <button class="btn btn-accent" style="padding: 5px 10px; font-size: 12px;" onclick="executeRecurring(${rec.id})">تنفيذ الآن</button>
                    <button class="btn-icon" onclick="deleteRecurring(${rec.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function openRecurringModal() {
    document.getElementById('recurring-modal').style.display = 'flex';
    const accounts = getAccounts();
    let options = '<option value="">-- اختر الحساب --</option>';
    accounts.forEach(acc => {
        if (acc.level >= 2) {
            let prefix = acc.level === 3 ? '↳ ' : '';
            options += `<option value="${acc.code}" data-name="${acc.name}">${prefix}${acc.code} - ${acc.name}</option>`;
        }
    });
    document.getElementById('rec-debit').innerHTML = options;
    document.getElementById('rec-credit').innerHTML = options;
}

function closeRecurringModal() {
    document.getElementById('recurring-modal').style.display = 'none';
    document.getElementById('recurring-form').reset();
}

function saveRecurringTemplate(event) {
    event.preventDefault();
    const desc = document.getElementById('rec-desc').value;
    const debitCode = document.getElementById('rec-debit').value;
    const creditCode = document.getElementById('rec-credit').value;
    const amount = parseFloat(document.getElementById('rec-amount').value);

    if (debitCode === creditCode) return alert('لا يمكن أن يكون الحساب المدين هو نفسه الدائن.');

    const debitName = document.getElementById('rec-debit').options[document.getElementById('rec-debit').selectedIndex].getAttribute('data-name');
    const creditName = document.getElementById('rec-credit').options[document.getElementById('rec-credit').selectedIndex].getAttribute('data-name');

    let recurring = getRecurringEntries();
    recurring.push({
        id: Date.now(),
        description: desc,
        debitCode, debitName,
        creditCode, creditName,
        amount
    });
    saveRecurringEntries(recurring);
    
    closeRecurringModal();
    renderRecurring();
    alert('تم حفظ القالب بنجاح!');
}

function executeRecurring(id) {
    if (!confirm('هل تريد تنفيذ هذا القيد المتكرر الآن؟ سيتم إنشاء قيد يومية جديد بتاريخ اليوم.')) return;

    const recurring = getRecurringEntries();
    const template = recurring.find(r => r.id === id);
    
    const entries = getEntries();
    const entryNumber = `JV-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: today,
        description: `[متكرر] ${template.description}`,
        lines: [
            { accountCode: template.debitCode, accountName: template.debitName, debit: template.amount, credit: 0 },
            { accountCode: template.creditCode, accountName: template.creditName, debit: 0, credit: template.amount }
        ],
        totalDebit: template.amount,
        totalCredit: template.amount
    };

    entries.push(newEntry);
    saveEntries(entries);
    
    alert(`تم تنفيذ القيد المتكرر بنجاح!\nتم إنشاء قيد اليومية رقم: ${entryNumber}`);
}

function deleteRecurring(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟ (لن يؤثر على القيود التي تم تنفيذها سابقاً)')) return;
    let recurring = getRecurringEntries().filter(r => r.id !== id);
    saveRecurringEntries(recurring);
    renderRecurring();
}
