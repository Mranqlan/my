// ═══════════════════════════════════════════════════════════════════
// AL SHAMEL - HR Extended Module
// نهاية الخدمة + التأمينات الاجتماعية + الحضور والإجازات
// ═══════════════════════════════════════════════════════════════════

const HR_KEYS = {
    ATTENDANCE: 'hr_attendance_records',
    LEAVES: 'hr_leave_records'
};

// ═══════════════════════════════════════════════════════════════════
// 1️⃣ حساب مكافأة نهاية الخدمة (النظام السعودي)
// ═══════════════════════════════════════════════════════════════════
function calculateEOS(employee, exitDate = new Date(), exitType = 'termination') {
    if (!employee || !employee.hireDate) return { years: 0, amount: 0, breakdown: 'لا يوجد تاريخ تعيين' };

    const hire = new Date(employee.hireDate);
    const exit = new Date(exitDate);
    if (exit <= hire) return { years: 0, amount: 0, breakdown: 'تاريخ غير صالح' };

    const yearsRaw = (exit - hire) / (1000 * 60 * 60 * 24 * 365.25);
    const years = Math.round(yearsRaw * 100) / 100;

    const basic = parseFloat(employee.basicSalary) || 0;
    const halfMonth = basic / 2;
    const fullMonth = basic;

    let amount = 0;
    let breakdown = '';

    if (years <= 5) {
        amount = years * halfMonth;
        breakdown = `${years} سنة × نصف شهر (${halfMonth})`;
    } else {
        amount = (5 * halfMonth) + ((years - 5) * fullMonth);
        breakdown = `5 سنوات × نصف شهر + ${(years - 5).toFixed(2)} سنة × شهر كامل`;
    }

    // خصم الاستقالة حسب نظام العمل السعودي
    let resignationFactor = 1;
    if (exitType === 'resignation') {
        if (years < 2) { resignationFactor = 0; }
        else if (years < 5) { resignationFactor = 1/3; }
        else if (years < 10) { resignationFactor = 2/3; }
        breakdown += ` | استقالة (معامل ${resignationFactor.toFixed(2)})`;
    }

    amount = amount * resignationFactor;

    return {
        years,
        basicSalary: basic,
        halfMonth,
        fullMonth,
        amount: Math.round(amount * 100) / 100,
        breakdown,
        exitType
    };
}

// ═══════════════════════════════════════════════════════════════════
// 2️⃣ استحقاق نهاية الخدمة الشهري (Provision)
// ═══════════════════════════════════════════════════════════════════
function calculateMonthlyEOSAccrual(employee) {
    const basic = parseFloat(employee?.basicSalary) || 0;
    if (basic <= 0) return 0;
    // متوسط شهري = (نصف شهر لكل سنة) / 12 = راتب / 24
    return Math.round((basic / 24) * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════════
// 3️⃣ حساب التأمينات الاجتماعية GOSI
// سعودي: 9.75% موظف + 11.75% صاحب العمل
// مقيم: 2% صاحب العمل فقط
// الوعاء = الراتب الأساسي + بدل السكن
// ═══════════════════════════════════════════════════════════════════
function calculateGOSI(employee) {
    const basic = parseFloat(employee?.basicSalary) || 0;
    const housing = parseFloat(employee?.housingAllowance) || 0;
    const base = basic + housing;

    const nationality = employee?.nationality || 'saudi';
    const isSaudi = nationality === 'saudi';

    if (isSaudi) {
        return {
            base,
            employeeShare: Math.round(base * 0.0975 * 100) / 100,
            employerShare: Math.round(base * 0.1175 * 100) / 100,
            total: Math.round(base * 0.215 * 100) / 100,
            type: 'saudi'
        };
    }
    return {
        base,
        employeeShare: 0,
        employerShare: Math.round(base * 0.02 * 100) / 100,
        total: Math.round(base * 0.02 * 100) / 100,
        type: 'resident'
    };
}

// ═══════════════════════════════════════════════════════════════════
// 4️⃣ الحضور والغياب - تخزين شهري مجمّع
// ═══════════════════════════════════════════════════════════════════
function getAttendanceRecords(month, year) {
    const all = JSON.parse(localStorage.getItem(HR_KEYS.ATTENDANCE) || '[]');
    return all.filter(r => r.month === Number(month) && r.year === Number(year));
}

function saveAttendanceRecord(record) {
    const all = JSON.parse(localStorage.getItem(HR_KEYS.ATTENDANCE) || '[]');
    record.month = Number(record.month);
    record.year = Number(record.year);
    const idx = all.findIndex(r =>
        r.employeeId === record.employeeId &&
        r.month === record.month &&
        r.year === record.year
    );
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    localStorage.setItem(HR_KEYS.ATTENDANCE, JSON.stringify(all));
    return record;
}

function getEmployeeAttendanceSummary(employeeId, month, year) {
    const rec = getAttendanceRecords(month, year)
        .find(r => r.employeeId === employeeId);
    return rec || {
        present: 0, absent: 0, late: 0,
        annual: 0, sick: 0, unpaid: 0, workDays: 30
    };
}

// ═══════════════════════════════════════════════════════════════════
// 5️⃣ حساب خصم الغياب من الراتب
// ═══════════════════════════════════════════════════════════════════
function calculateAttendanceDeduction(employee, summary) {
    const basic = parseFloat(employee?.basicSalary) || 0;
    const housing = parseFloat(employee?.housingAllowance) || 0;
    const dailyRate = (basic + housing) / 30;
    const absentDays = (summary.absent || 0) + (summary.unpaid || 0);
    return Math.round(dailyRate * absentDays * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════════
// 6️⃣ رصيد الإجازات السنوية
// ═══════════════════════════════════════════════════════════════════
function getLeaveBalance(employee) {
    const hireDate = new Date(employee?.hireDate);
    const now = new Date();
    const yearsOfService = (now - hireDate) / (1000 * 60 * 60 * 24 * 365.25);
    const annualEntitlement = yearsOfService >= 5 ? 30 : 21;

    const leaves = JSON.parse(localStorage.getItem(HR_KEYS.LEAVES) || '[]')
        .filter(l => l.employeeId === employee.id &&
                     l.type === 'annual' &&
                     l.year === now.getFullYear());

    const used = leaves.reduce((sum, l) => sum + (parseFloat(l.days) || 0), 0);
    return {
        entitlement: annualEntitlement,
        used,
        remaining: Math.max(0, annualEntitlement - used),
        yearsOfService: Math.round(yearsOfService * 100) / 100
    };
}

// ═══════════════════════════════════════════════════════════════════
// 7️⃣ إضافة الحسابات المحاسبية الخاصة بـ HR (تُشغّل مرة واحدة)
// ═══════════════════════════════════════════════════════════════════
function ensureHRAccounts() {
    const possibleKeys = ['chart_of_accounts', 'accounts', 'al_shamel_accounts', 'accounts_data'];
    let accountsKey = null, accounts = null;

    for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (!data) continue;
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                accounts = parsed;
                accountsKey = key;
                break;
            }
        } catch (e) {}
    }

    if (!accountsKey) {
        console.warn('⚠️ لم يتم العثور على مفتاح شجرة الحسابات');
        return { added: 0, key: null };
    }

    const newAccounts = [
        { code: '2106', name: 'مخصص مكافأة نهاية الخدمة', type: 'liability', parent: '2100' },
        { code: '2107', name: 'التأمينات الاجتماعية - مستحقة', type: 'liability', parent: '2100' },
        { code: '6104', name: 'مصروف مكافأة نهاية الخدمة', type: 'expense', parent: '6100' },
        { code: '6105', name: 'مصروف التأمينات الاجتماعية - حصة المنشأة', type: 'expense', parent: '6100' }
    ];

    let added = 0;
    newAccounts.forEach(na => {
        if (!accounts.find(a => String(a.code) === na.code)) {
            accounts.push(na);
            added++;
        }
    });

    if (added > 0) {
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        console.log(`✅ تم إضافة ${added} حسابات HR إلى ${accountsKey}`);
    }
    return { added, key: accountsKey };
}

// ═══════════════════════════════════════════════════════════════════
// 8️⃣ قيد استحقاق نهاية الخدمة الشهري
// ═══════════════════════════════════════════════════════════════════
function postEOSAccrualEntries(month, year, postFn) {
    if (typeof postFn !== 'function') {
        return { success: false, error: 'دالة الترحيل غير متوفرة' };
    }

    const employees = (typeof getData === 'function')
        ? (getData('employees') || [])
        : JSON.parse(localStorage.getItem('employees') || '[]');

    const active = employees.filter(e => e.status !== 'terminated' && e.status !== 'inactive');
    if (!active.length) return { success: false, error: 'لا يوجد موظفون نشطون' };

    let posted = 0, total = 0;
    const monthStr = String(month).padStart(2, '0');

    active.forEach(emp => {
        const amount = calculateMonthlyEOSAccrual(emp);
        if (amount <= 0) return;

        const res = postFn({
            date: `${year}-${monthStr}-28`,
            description: `استحقاق مكافأة نهاية الخدمة - ${emp.name} - ${monthStr}/${year}`,
            reference: `EOS-${emp.id}-${year}${monthStr}`,
            lines: [
                { accountCode: '6104', debit: amount, credit: 0 },
                { accountCode: '2106', debit: 0, credit: amount }
            ]
        });
        if (res !== false) { posted++; total += amount; }
    });

    return { success: true, posted, total: Math.round(total * 100) / 100 };
}

console.log('✅ HR Extended Module loaded');
