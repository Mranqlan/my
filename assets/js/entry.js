document.addEventListener('DOMContentLoaded', () => {
    addRow(); addRow();
    const saveBtn = document.getElementById('save-entry-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveJournalEntry);
});

function addRow() {
    const tbody = document.getElementById('entry-rows');
    const tr = document.createElement('tr');
    let options = '<option value="">-- اختر --</option>';
    getAccounts().forEach(acc => {
        if (acc.level >= 2) options += `<option value="${acc.code}" data-name="${acc.name}">${acc.code} - ${acc.name}</option>`;
    });
    
    tr.innerHTML = `
        <td><select class="acc-code-select" onchange="this.parentElement.parentElement.querySelector('.acc-name').value = this.options[this.selectedIndex].getAttribute('data-name') || '';" style="width:100%; padding:8px;">${options}</select></td>
        <td><input type="text" class="acc-name" readonly style="width:100%; text-align:center; background:#f8fafc;"></td>
        <td><input type="text" inputmode="decimal" class="debit-input" value="0.00" onchange="handleChange(this, 'debit')" onfocus="this.select()" style="width:100%; text-align:center;"></td>
        <td><input type="text" inputmode="decimal" class="credit-input" value="0.00" onchange="handleChange(this, 'credit')" onfocus="this.select()" style="width:100%; text-align:center;"></td>
        <td><button class="btn-delete" onclick="this.parentElement.parentElement.remove(); calcTotals();">حذف</button></td>
    `;
    tbody.appendChild(tr);
}

function handleChange(input, type) {
    let val = parseFloat(input.value) || 0;
    if (val < 0) val = 0;
    input.value = val.toFixed(2);
    
    if (val > 0) {
        const row = input.parentElement.parentElement;
        if (type === 'debit') {
            row.querySelector('.credit-input').value = '0.00';
        } else {
            row.querySelector('.debit-input').value = '0.00';
        }
    }
    calcTotals();
}

function calcTotals() {
    let d = 0, c = 0;
    document.querySelectorAll('.debit-input').forEach(i => d += parseFloat(i.value) || 0);
    document.querySelectorAll('.credit-input').forEach(i => c += parseFloat(i.value) || 0);
    
    document.getElementById('total-debit').textContent = d.toFixed(2);
    document.getElementById('total-credit').textContent = c.toFixed(2);
    
    const status = document.getElementById('balance-status');
    if (d === c && d > 0) {
        status.textContent = "متوازن ✅";
        status.className = "status-success";
        return true;
    } else {
        status.textContent = "غير متوازن";
        status.className = "status-warning";
        return false;
    }
}

function saveJournalEntry() {
    if (!calcTotals()) return alert('القيد غير متوازن!');
    const date = document.querySelector('input[type="date"]').value;
    if (isDateLocked(date)) return alert('⚠️ عذرا لا يمكن الحفظ. هذه الفترة المالية مغلقة. يرجى مراجعة الإعدادات.');
    const desc = document.querySelector('.full-width input').value;
    const entries = getEntries();
    const entryNumber = `JV-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    const lines = [];
    
    document.querySelectorAll('#entry-rows tr').forEach(row => {
        const code = row.querySelector('.acc-code-select').value;
        if (code) lines.push({ accountCode: code, accountName: row.querySelector('.acc-name').value, debit: parseFloat(row.querySelector('.debit-input').value)||0, credit: parseFloat(row.querySelector('.credit-input').value)||0 });
    });
    
    entries.push({ id: Date.now(), entryNumber, date, description: desc, lines, totalDebit: parseFloat(document.getElementById('total-debit').textContent), totalCredit: parseFloat(document.getElementById('total-credit').textContent) });
    saveEntries(entries);
    
    alert(`تم حفظ القيد ${entryNumber}`);
    document.querySelector('.full-width input').value = '';
    document.getElementById('entry-rows').innerHTML = ''; 
    addRow(); addRow(); calcTotals();
}
