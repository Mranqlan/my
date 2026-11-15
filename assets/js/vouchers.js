document.addEventListener('DOMContentLoaded', () => {
    // تعيين تاريخ اليوم افتراضياً
    document.getElementById('voucher-date').valueAsDate = new Date();
    
    populateAccountDropdowns();
});

function populateAccountDropdowns() {
    const accounts = getAccounts();
    
    // 1. تعبئة قائمة حسابات السند (الطرف الآخر) - نستبعد حسابات الأصول المتداولة (الخزينة) لأنها الطرف المقابل
    const voucherAccSelect = document.getElementById('voucher-account');
    voucherAccSelect.innerHTML = '<option value="">-- اختر الحساب --</option>';
    
    accounts.forEach(acc => {
        if (acc.level >= 2 && (acc.type === 'إيرادات' || acc.type === 'خصوم' || acc.type === 'مصروفات' || acc.type === 'حقوق ملكية')) {
            voucherAccSelect.innerHTML += `<option value="${acc.code}" data-name="${acc.name}">${acc.code} - ${acc.name}</option>`;
        }
    });

    // 2. تعبئة قائمة الخزينة/البنك
    const cashAccSelect = document.getElementById('voucher-cash-account');
    cashAccSelect.innerHTML = '';
    
    accounts.forEach(acc => {
        // نعرض الحسابات التي تندرج تحت الأصول المتداولة (مثل الصندوق والبنك)
        if (acc.code === '1101' || acc.code === '1102') {
            cashAccSelect.innerHTML += `<option value="${acc.code}" data-name="${acc.name}">${acc.code} - ${acc.name}</option>`;
        }
    });
}

function updateVoucherUI() {
    const type = document.getElementById('voucher-type').value;
    const btn = document.querySelector('.btn-success');
    if (type === 'receipt') {
        btn.textContent = "حفظ سند القبض وتوليد القيد";
        btn.style.backgroundColor = "#10b981"; // أخضر
    } else {
        btn.textContent = "حفظ سند الصرف وتوليد القيد";
        btn.style.backgroundColor = "#ef4444"; // أحمر
    }
}

function saveVoucher() {
    const type = document.getElementById('voucher-type').value;
    const date = document.getElementById('voucher-date').value;
    const accountCode = document.getElementById('voucher-account').value;
    const amount = parseFloat(document.getElementById('voucher-amount').value);
    const desc = document.getElementById('voucher-desc').value;
    const cashCode = document.getElementById('voucher-cash-account').value;

    // التحقق من المدخلات
    if (!accountCode || !cashCode || !amount || amount <= 0) {
        alert('يرجى تعبئة جميع الحقول بشكل صحيح (المبلغ يجب أن يكون أكبر من صفر).');
        return;
    }

    // جلب أسماء الحسابات
    const accountName = document.getElementById('voucher-account').options[document.getElementById('voucher-account').selectedIndex].getAttribute('data-name');
    const cashName = document.getElementById('voucher-cash-account').options[document.getElementById('voucher-cash-account').selectedIndex].getAttribute('data-name');

    const entries = getEntries();
    const nextId = entries.length + 1;
    const entryNumber = `JV-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

    let lines = [];

    // القيد المزدوج: 
    // سند القبض: مدين (الخزينة) / دائن (الحساب الآخر)
    // سند الصرف: مدين (الحساب الآخر) / دائن (الخزينة)
    if (type === 'receipt') {
        lines = [
            { accountCode: cashCode, accountName: cashName, debit: amount, credit: 0 },
            { accountCode: accountCode, accountName: accountName, debit: 0, credit: amount }
        ];
    } else {
        lines = [
            { accountCode: accountCode, accountName: accountName, debit: amount, credit: 0 },
            { accountCode: cashCode, accountName: cashName, debit: 0, credit: amount }
        ];
    }

    // إنشاء كائن القيد
    const newEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: date,
        description: desc || `سند ${type === 'receipt' ? 'قبض' : 'صرف'} - ${accountName}`,
        lines: lines,
        totalDebit: amount,
        totalCredit: amount
    };

    // حفظ القيد
    entries.push(newEntry);
    saveEntries(entries);

    alert(`تم حفظ السند بنجاح!\nتم توليد قيد اليومية رقم ${entryNumber} تلقائياً.`);
    
    // تفريغ الحقول
    document.getElementById('voucher-amount').value = '';
    document.getElementById('voucher-desc').value = '';
}
