document.addEventListener('DOMContentLoaded', () => {
    loadDropdowns();
});

function loadDropdowns() {
    const accounts = getAccounts();
    let options = '<option value="">-- اختر الحساب --</option>';
    
    accounts.forEach(acc => {
        if (acc.level >= 2) {
            let prefix = acc.level === 3 ? '↳ ' : '';
            options += `<option value="${acc.code}" data-name="${acc.name}">${prefix}${acc.code} - ${acc.name}</option>`;
        }
    });

    document.getElementById('adj-debit').innerHTML = options;
    document.getElementById('adj-credit').innerHTML = options;
}

// دالة حفظ قيد التسوية
function saveAdjustingEntry() {
    const desc = document.getElementById('adj-desc').value;
    const debitCode = document.getElementById('adj-debit').value;
    const creditCode = document.getElementById('adj-credit').value;
    const amount = parseFloat(document.getElementById('adj-amount').value);

    if (!desc || !debitCode || !creditCode || amount <= 0) {
        return alert('يرجى تعبئة جميع الحقول بشكل صحيح.');
    }

    if (debitCode === creditCode) {
        return alert('لا يمكن أن يكون الحساب المدين هو نفسه الحساب الدائن.');
    }

    const debitName = document.getElementById('adj-debit').options[document.getElementById('adj-debit').selectedIndex].getAttribute('data-name');
    const creditName = document.getElementById('adj-credit').options[document.getElementById('adj-credit').selectedIndex].getAttribute('data-name');

    const entries = getEntries();
    const entryNumber = `ADJ-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;

    const newEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: new Date().toISOString().split('T')[0],
        description: `قيد تسوية: ${desc}`,
        lines: [
            { accountCode: debitCode, accountName: debitName, debit: amount, credit: 0 },
            { accountCode: creditCode, accountName: creditName, debit: 0, credit: amount }
        ],
        totalDebit: amount,
        totalCredit: amount
    };

    entries.push(newEntry);
    saveEntries(entries);
    alert(`تم حفظ قيد التسوية ${entryNumber} بنجاح.`);
    
    // تفريغ الحقول
    document.getElementById('adj-desc').value = '';
    document.getElementById('adj-amount').value = '0.00';
}

// دالة الإغلاق السنوي
function performClosing() {
    if (!confirm('تحذير: هل أنت متأكد من إجراء الإغلاق السنوي؟ سيتم تصفير حسابات الإيرادات والمصروفات ولا يمكن التراجع بسهولة.')) {
        return;
    }

    const accounts = getAccounts();
    const entries = getEntries();
    
    let closingLines = [];
    let totalRevenue = 0;
    let totalExpense = 0;

    // 1. حساب أرصدة الإيرادات والمصروفات
    accounts.forEach(acc => {
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
                if (acc.type === 'إيرادات') {
                    totalRevenue += balance;
                    // لتصفير الإيراد (رصيده دائن)، نجعل المدين يساوي رصيده
                    closingLines.push({ accountCode: acc.code, accountName: acc.name, debit: balance, credit: 0 });
                } else {
                    totalExpense += balance;
                    // لتصفير المصروف (رصيده مدين)، نجعل الدائن يساوي رصيده
                    closingLines.push({ accountCode: acc.code, accountName: acc.name, debit: 0, credit: balance });
                }
            }
        }
    });

    if (closingLines.length === 0) {
        return alert('لا توجد أرصدة إيرادات أو مصروفات لإغلاقها.');
    }

    // 2. حساب صافي الربح ونقله للأرباح المحتجزة
    const netIncome = totalRevenue - totalExpense;
    
    if (netIncome > 0) {
        // ربح: الأرباح المحتجزة (دائن)
        closingLines.push({ accountCode: "3102", accountName: "الأرباح المحتجزة", debit: 0, credit: netIncome });
    } else if (netIncome < 0) {
        // خسارة: الأرباح المحتجزة (مدين)
        closingLines.push({ accountCode: "3102", accountName: "الأرباح المحتجزة", debit: Math.abs(netIncome), credit: 0 });
    }

    // 3. إنشاء وحفظ قيد الإغلاق
    const entriesList = getEntries();
    const entryNumber = `CLS-${new Date().getFullYear()}-${String(entriesList.length + 1).padStart(4, '0')}`;

    const closingEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: new Date().toISOString().split('T')[0],
        description: `قيد إغلاق السنة المالية - صافي ${netIncome >= 0 ? 'الربح' : 'الخسارة'}: ${Math.abs(netIncome).toFixed(2)}`,
        lines: closingLines,
        totalDebit: Math.max(totalRevenue, totalExpense),
        totalCredit: Math.max(totalRevenue, totalExpense)
    };

    entriesList.push(closingEntry);
    saveEntries(entriesList);

    alert(`تم إجراء الإغلاق بنجاح!\nرقم القيد: ${entryNumber}\nصافي ${netIncome >= 0 ? 'الربح' : 'الخسارة'}: ${Math.abs(netIncome).toFixed(2)}`);
    
    // إعادة تحميل الصفحة
    window.location.reload();
}
