// ==========================================
// 1. الحسابات (Accounts)
// ==========================================
const defaultAccounts = [
    { id: 1, code: "1", name: "الأصول", type: "أصول", parent: null, level: 1 },
    { id: 2, code: "11", name: "الأصول المتداولة", type: "أصول", parent: 1, level: 2 },
    { id: 3, code: "1101", name: "الصندوق (النقدية بالخزينة)", type: "أصول", parent: 2, level: 3 },
    { id: 4, code: "1102", name: "البنك الأهلي (النقدية بالبنك)", type: "أصول", parent: 2, level: 3 },
    { id: 5, code: "1103", name: "العملاء (الذمم المدينة)", type: "أصول", parent: 2, level: 3 },
    { id: 22, code: "1104", name: "المخزون (البضاعة)", type: "أصول", parent: 2, level: 3 },
    { id: 26, code: "1105", name: "ضريبة القيمة المضافة (المدخلات)", type: "أصول", parent: 2, level: 3 },
    { id: 39, code: "1107", name: "مخصص ديون مشكوك في تحصيلها", type: "أصول", parent: 2, level: 3 },
    { id: 32, code: "1106", name: "شيكات برسم التحصيل", type: "أصول", parent: 2, level: 3 },
    { id: 6, code: "12", name: "الأصول الثابتة", type: "أصول", parent: 1, level: 2 },
    { id: 7, code: "1201", name: "أثاث ومعدات", type: "أصول", parent: 6, level: 3 },
    { id: 29, code: "1202", name: "مجمع إهلاك الأصول الثابتة", type: "أصول", parent: 6, level: 3 },
    { id: 34, code: "1203", name: "سيارات ومركبات", type: "أصول", parent: 6, level: 3 },
    { id: 35, code: "1204", name: "أجهزة كمبيوتر وإلكترونيات", type: "أصول", parent: 6, level: 3 },
    { id: 36, code: "1205", name: "مباني وعقارات", type: "أصول", parent: 6, level: 3 },
    { id: 8, code: "2", name: "الخصوم (الالتزامات)", type: "خصوم", parent: null, level: 1 },
    { id: 9, code: "21", name: "الخصوم المتداولة", type: "خصوم", parent: 8, level: 2 },
    { id: 10, code: "2101", name: "الموردون (الذمم الدائنة)", type: "خصوم", parent: 9, level: 3 },
    { id: 27, code: "2103", name: "ضرائب وتأمينات مستحقة", type: "خصوم", parent: 9, level: 3 },
    { id: 28, code: "2104", name: "رواتب مستحقة الدفع", type: "خصوم", parent: 9, level: 3 },
    { id: 25, code: "2102", name: "ضريبة القيمة المضافة المستحقة", type: "خصوم", parent: 9, level: 3 },
    { id: 33, code: "2105", name: "شيكات صادرة", type: "خصوم", parent: 9, level: 3 },
    { id: 12, code: "3", name: "حقوق الملكية", type: "حقوق ملكية", parent: null, level: 1 },
    { id: 13, code: "3101", name: "رأس المال", type: "حقوق ملكية", parent: 12, level: 2 },
    { id: 14, code: "3102", name: "الأرباح المحتجزة", type: "حقوق ملكية", parent: 12, level: 2 },
    { id: 15, code: "4", name: "الإيرادات", type: "إيرادات", parent: null, level: 1 },
    { id: 16, code: "4101", name: "إيرادات المبيعات", type: "إيرادات", parent: 15, level: 2 },
    { id: 24, code: "4102", name: "مردودات المبيعات", type: "إيرادات", parent: 15, level: 2 },
    { id: 18, code: "5", name: "المصروفات", type: "مصروفات", parent: null, level: 1 },
    { id: 19, code: "5101", name: "مصروف الرواتب والأجور", type: "مصروفات", parent: 18, level: 2 },
    { id: 20, code: "5102", name: "مصروف الإيجار", type: "مصروفات", parent: 18, level: 2 },
    { id: 21, code: "5103", name: "مصروف الكهرباء والمياه", type: "مصروفات", parent: 18, level: 2 },
    { id: 23, code: "5104", name: "تكلفة البضاعة المباعة", type: "مصروفات", parent: 18, level: 2 },
    { id: 31, code: "5106", name: "مصروف تلف وفاقد المخزون", type: "مصروفات", parent: 18, level: 2 },
    { id: 40, code: "5108", name: "مصروف ديون مشكوك في تحصيلها", type: "مصروفات", parent: 18, level: 2 },
    { id: 30, code: "5105", name: "مصروف إهلاك الأصول", type: "مصروفات", parent: 18, level: 2 }
];

function getAccounts() {
    let accounts = localStorage.getItem('onyx_accounts');
    if (!accounts) { localStorage.setItem('onyx_accounts', JSON.stringify(defaultAccounts)); return defaultAccounts; }
    let parsed = JSON.parse(accounts);
    if (!parsed.find(a => a.code === "1104")) parsed.push({ id: 22, code: "1104", name: "المخزون (البضاعة)", type: "أصول", parent: 2, level: 3 });
    if (!parsed.find(a => a.code === "1105")) parsed.push({ id: 26, code: "1105", name: "ضريبة القيمة المضافة (المدخلات)", type: "أصول", parent: 2, level: 3 });
    if (!parsed.find(a => a.code === "2102")) parsed.push({ id: 25, code: "2102", name: "ضريبة القيمة المضافة المستحقة", type: "خصوم", parent: 9, level: 3 });
    return parsed;
}
function saveAccounts(accounts) { localStorage.setItem('onyx_accounts', JSON.stringify(accounts)); }

function getEntries() { return localStorage.getItem('onyx_entries') ? JSON.parse(localStorage.getItem('onyx_entries')) : []; }
function saveEntries(entries) { localStorage.setItem('onyx_entries', JSON.stringify(entries)); }

function getCustomers() {
    let custs = localStorage.getItem('onyx_customers') ? JSON.parse(localStorage.getItem('onyx_customers')) : [];
    return custs.map(c => ({
        ...c,
        creditLimit: c.creditLimit !== undefined ? c.creditLimit : 0
    }));
}
function saveCustomers(customers) { localStorage.setItem('onyx_customers', JSON.stringify(customers)); }
function updateCustomerBalance(customerId, amount) {
    let customers = getCustomers();
    let index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) { customers[index].balance = parseFloat(customers[index].balance) + parseFloat(amount); saveCustomers(customers); }
}

function getSuppliers() { return localStorage.getItem('onyx_suppliers') ? JSON.parse(localStorage.getItem('onyx_suppliers')) : []; }
function saveSuppliers(suppliers) { localStorage.setItem('onyx_suppliers', JSON.stringify(suppliers)); }
function updateSupplierBalance(supplierId, amount) {
    let suppliers = getSuppliers();
    let index = suppliers.findIndex(s => s.id === supplierId);
    if (index !== -1) { suppliers[index].balance = parseFloat(suppliers[index].balance) + parseFloat(amount); saveSuppliers(suppliers); }
}

function getItems() { return localStorage.getItem('onyx_items') ? JSON.parse(localStorage.getItem('onyx_items')) : []; }
function saveItems(items) { localStorage.setItem('onyx_items', JSON.stringify(items)); }

function getInvoices() { return localStorage.getItem('onyx_invoices') ? JSON.parse(localStorage.getItem('onyx_invoices')) : []; }
function saveInvoices(invoices) { localStorage.setItem('onyx_invoices', JSON.stringify(invoices)); }
function getPurchases() { return localStorage.getItem('onyx_purchases') ? JSON.parse(localStorage.getItem('onyx_purchases')) : []; }
function savePurchases(purchases) { localStorage.setItem('onyx_purchases', JSON.stringify(purchases)); }

function getSalesReturns() { return localStorage.getItem('onyx_sales_returns') ? JSON.parse(localStorage.getItem('onyx_sales_returns')) : []; }
function saveSalesReturns(returns) { localStorage.setItem('onyx_sales_returns', JSON.stringify(returns)); }
function getPurchaseReturns() { return localStorage.getItem('onyx_purchase_returns') ? JSON.parse(localStorage.getItem('onyx_purchase_returns')) : []; }
function savePurchaseReturns(returns) { localStorage.setItem('onyx_purchase_returns', JSON.stringify(returns)); }


// ==========================================
// دوال مراكز التكلفة (الفروع والأقسام)
// ==========================================
function getCostCenters() {
    let ccs = localStorage.getItem('onyx_cost_centers');
    return ccs ? JSON.parse(ccs) : [];
}

function saveCostCenters(ccs) {
    localStorage.setItem('onyx_cost_centers', JSON.stringify(ccs));
}


// ==========================================
// دوال الموظفين والرواتب (HR & Payroll)
// ==========================================
function getEmployees() {
    let emps = localStorage.getItem('onyx_employees');
    return emps ? JSON.parse(emps) : [];
}

function saveEmployees(emps) {
    localStorage.setItem('onyx_employees', JSON.stringify(emps));
}

function getPayrolls() {
    let prs = localStorage.getItem('onyx_payrolls');
    return prs ? JSON.parse(prs) : [];
}

function savePayrolls(prs) {
    localStorage.setItem('onyx_payrolls', JSON.stringify(prs));
}


// ==========================================
// دوال الأصول الثابتة (Fixed Assets)
// ==========================================
function getFixedAssets() {
    let assets = localStorage.getItem('onyx_fixed_assets');
    return assets ? JSON.parse(assets) : [];
}

function saveFixedAssets(assets) {
    localStorage.setItem('onyx_fixed_assets', JSON.stringify(assets));
}


// ==========================================
// دوال تسويات المخزون (Inventory Adjustments)
// ==========================================
function getInventoryAdjustments() {
    let adjs = localStorage.getItem('onyx_inventory_adjustments');
    return adjs ? JSON.parse(adjs) : [];
}

function saveInventoryAdjustments(adjs) {
    localStorage.setItem('onyx_inventory_adjustments', JSON.stringify(adjs));
}


// ==========================================
// دوال إدارة الشيكات (Cheques)
// ==========================================
function getCheques() {
    let cheques = localStorage.getItem('onyx_cheques');
    return cheques ? JSON.parse(cheques) : [];
}

function saveCheques(cheques) {
    localStorage.setItem('onyx_cheques', JSON.stringify(cheques));
}


// ==========================================
// دوال الإعدادات العامة (General Settings)
// ==========================================
function getSettings() {
    let settings = localStorage.getItem('onyx_settings');
    if (!settings) {
        // الإعدادات الافتراضية
        const defaultSettings = {
            companyName: "تعز سوفت",
            companyTagline: "Integrated Accounting Systems",
            currency: "ريال",
            logoText: "S",
            lockDate: ""
        };
        localStorage.setItem('onyx_settings', JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(settings);
}

function saveSettings(settings) {
    localStorage.setItem('onyx_settings', JSON.stringify(settings));
}


// ==========================================
// دوال المستودعات (Warehouses)
// ==========================================
function getWarehouses() {
    let whs = localStorage.getItem('onyx_warehouses');
    if (!whs) {
        const defaultWh = [{ id: 1, code: "WH-001", name: "المستودع الرئيسي", location: "المركز الرئيسي" }];
        localStorage.setItem('onyx_warehouses', JSON.stringify(defaultWh));
        return defaultWh;
    }
    return JSON.parse(whs);
}

function saveWarehouses(whs) {
    localStorage.setItem('onyx_warehouses', JSON.stringify(whs));
}


// دالة للتحقق مما إذا كان التاريخ مغلقا
function isDateLocked(dateStr) {
    const settings = getSettings();
    if (!settings.lockDate) return false;
    return dateStr <= settings.lockDate;
}


// ==========================================
// دوال المستخدمين والصلاحيات (Users & Permissions)
// ==========================================
function getUsers() {
    let users = localStorage.getItem('onyx_users');
    if (!users) {
        // إنشاء مدير افتراضي عند أول تشغيل
        const defaultUsers = [
            { id: 1, username: "admin", password: "123456", fullName: "OMRAN AQLAN", role: "admin" }
        ];
        localStorage.setItem('onyx_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

function saveUsers(users) {
    localStorage.setItem('onyx_users', JSON.stringify(users));
}

function getCurrentUser() {
    let user = localStorage.getItem('onyx_current_user');
    // افتراضياً، إذا لم يكن هناك تسجيل دخول، نعتبره المدير (للتجربة)
    if (!user) return { fullName: "OMRAN AQLAN", role: "admin" };
    return JSON.parse(user);
}


// ==========================================
// دوال أوامر الشراء (Purchase Orders)
// ==========================================
function getPurchaseOrders() {
    let pos = localStorage.getItem('onyx_purchase_orders');
    return pos ? JSON.parse(pos) : [];
}

function savePurchaseOrders(pos) {
    localStorage.setItem('onyx_purchase_orders', JSON.stringify(pos));
}


// ==========================================
// دوال أوامر البيع (Sales Orders)
// ==========================================
function getSalesOrders() {
    let sos = localStorage.getItem('onyx_sales_orders');
    return sos ? JSON.parse(sos) : [];
}

function saveSalesOrders(sos) {
    localStorage.setItem('onyx_sales_orders', JSON.stringify(sos));
}


// ==========================================
// دوال السلف والخصومات (HR)
// ==========================================
function getAdvances() {
    let advs = localStorage.getItem('onyx_advances');
    return advs ? JSON.parse(advs) : [];
}
function saveAdvances(advs) {
    localStorage.setItem('onyx_advances', JSON.stringify(advs));
}

function getPenalties() {
    let pens = localStorage.getItem('onyx_penalties');
    return pens ? JSON.parse(pens) : [];
}
function savePenalties(pens) {
    localStorage.setItem('onyx_penalties', JSON.stringify(pens));
}


// ==========================================
// دوال الموازنات التقديرية (Budgets)
// ==========================================
function getBudgets() {
    let b = localStorage.getItem('onyx_budgets');
    return b ? JSON.parse(b) : {};
}
function saveBudgets(b) {
    localStorage.setItem('onyx_budgets', JSON.stringify(b));
}


// ==========================================
// دوال تحويل المخزون والعهدة (Stock Transfers & Petty Cash)
// ==========================================
function getStockTransfers() {
    let t = localStorage.getItem('onyx_stock_transfers');
    return t ? JSON.parse(t) : [];
}
function saveStockTransfers(t) {
    localStorage.setItem('onyx_stock_transfers', JSON.stringify(t));
}

function getPettyCash() {
    let p = localStorage.getItem('onyx_petty_cash');
    return p ? JSON.parse(p) : { balance: 0, transactions: [] };
}
function savePettyCash(p) {
    localStorage.setItem('onyx_petty_cash', JSON.stringify(p));
}


// ==========================================
// دوال دورة الموافقة والعكس (Workflow & Reversal)
// ==========================================
function approveEntry(id) {
    let entries = getEntries();
    let idx = entries.findIndex(e => e.id === id);
    if (idx !== -1) {
        entries[idx].status = 'posted';
        entries[idx].approvedAt = new Date().toISOString();
        saveEntries(entries);
        if (typeof saveAuditLog === 'function') saveAuditLog("اعتماد قيد", "تم اعتماد القيد " + entries[idx].entryNumber);
        return true;
    }
    return false;
}

function reverseEntry(id) {
    let entries = getEntries();
    let original = entries.find(e => e.id === id);
    if (!original) return null;
    if (original.status === 'reversed') return null;
    
    const reversalLines = original.lines.map(l => ({
        accountCode: l.accountCode,
        accountName: l.accountName,
        debit: parseFloat(l.credit) || 0,
        credit: parseFloat(l.debit) || 0
    }));
    
    const newId = Date.now();
    const newNum = `REV-${original.entryNumber}-${newId.toString().slice(-4)}`;
    const reversal = {
        id: newId,
        entryNumber: newNum,
        date: new Date().toISOString().split('T')[0],
        description: `عكس القيد ${original.entryNumber} - ${original.description || ''}`.trim(),
        lines: reversalLines,
        totalDebit: original.totalCredit,
        totalCredit: original.totalDebit,
        status: 'posted',
        reversedFrom: original.entryNumber
    };
    
    let idx = entries.findIndex(e => e.id === id);
    entries[idx].status = 'reversed';
    entries[idx].reversedBy = newNum;
    
    entries.push(reversal);
    saveEntries(entries);
    if (typeof saveAuditLog === 'function') saveAuditLog("عكس قيد", "تم عكس القيد " + original.entryNumber + " بالقيد " + newNum);
    return reversal;
}


// ==========================================
// دوال العملات وأسعار الصرف (Currencies)
// ==========================================
function getCurrencies() {
    let currencies = localStorage.getItem('onyx_currencies');
    if (!currencies) {
        const defaultCurrencies = [
            { id: 1, code: "SAR", name: "ريال سعودي", symbol: "ر.س", rate: 1, isBase: true, lastUpdated: new Date().toISOString() },
            { id: 2, code: "USD", name: "دولار أمريكي", symbol: "$", rate: 3.75, isBase: false, lastUpdated: new Date().toISOString() },
            { id: 3, code: "EUR", name: "يورو", symbol: "€", rate: 4.05, isBase: false, lastUpdated: new Date().toISOString() },
            { id: 4, code: "AED", name: "درهم إماراتي", symbol: "د.إ", rate: 1.02, isBase: false, lastUpdated: new Date().toISOString() }
        ];
        localStorage.setItem('onyx_currencies', JSON.stringify(defaultCurrencies));
        return defaultCurrencies;
    }
    return JSON.parse(currencies);
}

function saveCurrencies(currencies) {
    localStorage.setItem('onyx_currencies', JSON.stringify(currencies));
}

function getBaseCurrency() {
    const currencies = getCurrencies();
    return currencies.find(c => c.isBase) || currencies[0];
}

function getCurrencyByCode(code) {
    const currencies = getCurrencies();
    return currencies.find(c => c.code === code);
}

// تحويل مبلغ من عملة إلى العملة الأساسية
function convertToBase(amount, fromCurrencyCode) {
    if (!fromCurrencyCode) return amount;
    const currency = getCurrencyByCode(fromCurrencyCode);
    if (!currency) return amount;
    return parseFloat(amount) * currency.rate;
}

// تحويل مبلغ من العملة الأساسية إلى عملة أخرى
function convertFromBase(amount, toCurrencyCode) {
    if (!toCurrencyCode) return amount;
    const currency = getCurrencyByCode(toCurrencyCode);
    if (!currency || currency.rate === 0) return amount;
    return parseFloat(amount) / currency.rate;
}


// ==========================================
// دوال إغلاق الفترات المالية (Period Locking)
// ==========================================
function getClosedPeriods() {
    let periods = localStorage.getItem('onyx_closed_periods');
    return periods ? JSON.parse(periods) : [];
}

function saveClosedPeriods(periods) {
    localStorage.setItem('onyx_closed_periods', JSON.stringify(periods));
}

// فحص إذا كان التاريخ يقع في فترة مغلقة
function isDateInClosedPeriod(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const periods = getClosedPeriods();
    
    for (let period of periods) {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        if (date >= start && date <= end) {
            return period;
        }
    }
    return false;
}


// ==========================================
// دوال السنوات المالية (Fiscal Years)
// ==========================================
function getFiscalYears() {
    let years = localStorage.getItem('onyx_fiscal_years');
    return years ? JSON.parse(years) : [];
}

function saveFiscalYears(years) {
    localStorage.setItem('onyx_fiscal_years', JSON.stringify(years));
}

// جلب السنة المفتوحة الحالية
function getCurrentFiscalYear() {
    const years = getFiscalYears();
    return years.find(y => !y.isClosed) || null;
}

// فحص إذا كان التاريخ في سنة مغلقة
function isDateInClosedYear(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const years = getFiscalYears();
    for (let year of years) {
        if (year.isClosed) {
            const start = new Date(year.startDate);
            const end = new Date(year.endDate);
            if (date >= start && date <= end) return year;
        }
    }
    return null;
}

// إغلاق السنة المالية (نقل صافي الربح + قيد إغلاق)
function closeFiscalYear(yearId) {
    const years = getFiscalYears();
    const year = years.find(y => y.id === yearId);
    if (!year) return { success: false, error: 'السنة غير موجودة' };
    if (year.isClosed) return { success: false, error: 'السنة مغلقة بالفعل' };

    const accounts = getAccounts();
    const entries = getEntries();
    
    // تصفية القيود: فقط المعتمدة وليس قيد إغلاق سابق وضمن تاريخ السنة
    const yearEntries = entries.filter(e => 
        e.date >= year.startDate && 
        e.date <= year.endDate && 
        e.status === 'posted' && 
        !e.isClosingEntry
    );

    let totalRevenue = 0, totalExpense = 0;
    let revenueLines = [], expenseLines = [];

    accounts.forEach(acc => {
        if (acc.type === 'إيرادات' || acc.type === 'مصروفات') {
            let balance = 0;
            yearEntries.forEach(entry => {
                entry.lines.forEach(line => {
                    if (line.accountCode === acc.code) {
                        if (acc.type === 'إيرادات') balance += (line.credit - line.debit);
                        else balance += (line.debit - line.credit);
                    }
                });
            });
            if (balance > 0.01) {
                if (acc.type === 'إيرادات') {
                    totalRevenue += balance;
                    revenueLines.push({ accountCode: acc.code, accountName: acc.name, debit: balance, credit: 0 });
                } else {
                    totalExpense += balance;
                    expenseLines.push({ accountCode: acc.code, accountName: acc.name, debit: 0, credit: balance });
                }
            }
        }
    });

    const netProfit = totalRevenue - totalExpense;

    if (revenueLines.length === 0 && expenseLines.length === 0) {
        return { success: false, error: 'لا توجد إيرادات أو مصروفات معتمدة لهذه السنة لإغلاقها.' };
    }

    // بناء قيد الإغلاق
    let closingLines = [...revenueLines, ...expenseLines];

    // إضافة صافي الربح إلى الأرباح المحتجزة
    if (netProfit > 0) {
        closingLines.push({ accountCode: "3102", accountName: "الأرباح المحتجزة", debit: 0, credit: netProfit });
    } else if (netProfit < 0) {
        closingLines.push({ accountCode: "3102", accountName: "الأرباح المحتجزة", debit: Math.abs(netProfit), credit: 0 });
    }

    // حساب الإجماليات بدقة (مجموع السطور)
    let finalTotalDebit = 0;
    let finalTotalCredit = 0;
    closingLines.forEach(line => {
        finalTotalDebit += (parseFloat(line.debit) || 0);
        finalTotalCredit += (parseFloat(line.credit) || 0);
    });

    const closingEntryNumber = `CLS-${year.id}-${Date.now().toString().slice(-4)}`;
    const closingEntry = {
        id: Date.now(),
        entryNumber: closingEntryNumber,
        date: year.endDate,
        description: `قيد إغلاق السنة المالية ${year.name} - صافي ${netProfit >= 0 ? 'الربح' : 'الخسارة'}: ${Math.abs(netProfit).toFixed(2)}`,
        lines: closingLines,
        totalDebit: finalTotalDebit,
        totalCredit: finalTotalCredit,
        status: 'posted',
        isClosingEntry: true
    };

    // تحديث السنة
    year.isClosed = true;
    year.closedAt = new Date().toISOString();
    year.closingEntryNumber = closingEntryNumber;
    year.netProfit = netProfit;

    entries.push(closingEntry);
    saveEntries(entries);
    saveFiscalYears(years);

    if (typeof saveAuditLog === 'function') {
        saveAuditLog("إغلاق سنة مالية", `تم إغلاق السنة ${year.name} بصافي ربح ${netProfit.toFixed(2)}`);
    }

    return { success: true, netProfit, closingEntryNumber };
}


// إنشاء سنة مالية جديدة مع أرصدة افتتاحية
function createNewFiscalYear(name, startDate, endDate) {
    const years = getFiscalYears();
    if (years.some(y => y.name === name)) return { success: false, error: 'اسم السنة موجود بالفعل' };

    const newYear = {
        id: Date.now(),
        name: name,
        startDate: startDate,
        endDate: endDate,
        isClosed: false,
        createdAt: new Date().toISOString()
    };

    years.push(newYear);
    saveFiscalYears(years);

    if (typeof saveAuditLog === 'function') {
        saveAuditLog("إنشاء سنة مالية", `تم إنشاء السنة ${name}`);
    }

    return { success: true, year: newYear };
}


// ==========================================
// دوال ضريبة الاستقطاع (Withholding Tax - WHT)
// ==========================================
function getWHTRates() {
    let rates = localStorage.getItem('onyx_wht_rates');
    if (!rates) {
        const defaultRates = [
            { id: 1, code: 'SERV', name: 'خدمات استشارية', rate: 5 },
            { id: 2, code: 'MAINT', name: 'صيانة وتشغيل', rate: 5 },
            { id: 3, code: 'RENT', name: 'إيجار', rate: 15 },
            { id: 4, code: 'ROY', name: 'حقوق ملكية (Royalties)', rate: 15 },
            { id: 5, code: 'COMM', name: 'عمولات', rate: 5 },
            { id: 6, code: 'TRANS', name: 'نقل وشحن', rate: 5 },
            { id: 7, code: 'OTHER', name: 'خدمات أخرى', rate: 5 }
        ];
        localStorage.setItem('onyx_wht_rates', JSON.stringify(defaultRates));
        return defaultRates;
    }
    return JSON.parse(rates);
}

function saveWHTRates(rates) {
    localStorage.setItem('onyx_wht_rates', JSON.stringify(rates));
}

function getWHTRecords() {
    let records = localStorage.getItem('onyx_wht_records');
    return records ? JSON.parse(records) : [];
}

function saveWHTRecords(records) {
    localStorage.setItem('onyx_wht_records', JSON.stringify(records));
}

function calculateWHT(amount, rate) {
    return (parseFloat(amount) || 0) * ((parseFloat(rate) || 0) / 100);
}

function createWHTEntry(supplierName, grossAmount, whtRate, date, description) {
    const whtAmount = calculateWHT(grossAmount, whtRate);
    const netAmount = grossAmount - whtAmount;
    const entries = getEntries();
    const entryNumber = `WHT-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    
    const newEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: date,
        description: `ضريبة استقطاع - ${description || supplierName} (${whtRate}%)`,
        lines: [
            { accountCode: "2101", accountName: "الموردون (الذمم الدائنة)", debit: grossAmount, credit: 0 },
            { accountCode: "2108", accountName: "ضريبة الاستقطاع المستحقة", debit: 0, credit: whtAmount },
            { accountCode: "2101", accountName: "الموردون (الذمم الدائنة)", debit: 0, credit: netAmount }
        ],
        totalDebit: grossAmount,
        totalCredit: grossAmount,
        isWHT: true,
        status: 'posted',
        whtDetails: { supplierName, grossAmount, whtRate, whtAmount, netAmount }
    };
    
    entries.push(newEntry);
    saveEntries(entries);
    
    const records = getWHTRecords();
    records.push({
        id: Date.now(),
        entryNumber: entryNumber,
        date: date,
        supplierName: supplierName,
        grossAmount: grossAmount,
        whtRate: whtRate,
        whtAmount: whtAmount,
        netAmount: netAmount,
        description: description
    });
    saveWHTRecords(records);
    
    return { entryNumber, whtAmount, netAmount };
}

function ensureWHTAccount() {
    let accounts = getAccounts();
    if (!accounts.find(a => a.code === '2108')) {
        accounts.push({
            id: Date.now(),
            code: "2108",
            name: "ضريبة الاستقطاع المستحقة",
            type: "خصوم",
            parent: 9,
            level: 3
        });
        saveAccounts(accounts);
        return true;
    }
    return false;
}


function getQuotations() {
    let q = localStorage.getItem('onyx_quotations');
    return q ? JSON.parse(q) : [];
}
function saveQuotations(q) {
    localStorage.setItem('onyx_quotations', JSON.stringify(q));
}

function getDeliveryNotes() {
    let d = localStorage.getItem('onyx_delivery_notes');
    return d ? JSON.parse(d) : [];
}
function saveDeliveryNotes(d) {
    localStorage.setItem('onyx_delivery_notes', JSON.stringify(d));
}

function markDeliveryNoteInvoiced(dnId, invoiceNumber) {
    let notes = getDeliveryNotes();
    let idx = notes.findIndex(n => n.id === dnId);
    if (idx !== -1) {
        notes[idx].status = 'invoiced';
        notes[idx].invoiceNumber = invoiceNumber;
        notes[idx].invoicedAt = new Date().toISOString();
        saveDeliveryNotes(notes);
        return true;
    }
    return false;
}

function createDeliveryNoteEntry(dn) {
    const entries = getEntries();
    const entryNumber = `DN-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
    let totalCost = 0;
    dn.items.forEach(item => { totalCost += (parseFloat(item.qty) || 0) * (parseFloat(item.cost) || 0); });
    if (totalCost <= 0) return { success: false, error: 'التكلفة صفر' };

    const newEntry = {
        id: Date.now(),
        entryNumber: entryNumber,
        date: dn.date,
        description: `إذن تسليم ${dn.dnNumber} - ${dn.customerName} (تكلفة البضاعة المباعة)`,
        lines: [
            { accountCode: "5104", accountName: "تكلفة البضاعة المباعة", debit: totalCost, credit: 0 },
            { accountCode: "1104", accountName: "المخزون (البضاعة)", debit: 0, credit: totalCost }
        ],
        totalDebit: totalCost,
        totalCredit: totalCost,
        status: 'posted',
        isDeliveryNote: true,
        dnNumber: dn.dnNumber
    };
    entries.push(newEntry);
    saveEntries(entries);
    return { success: true, entryNumber, totalCost };
}


function getCreditNotes() {
    let cn = localStorage.getItem('onyx_credit_notes');
    return cn ? JSON.parse(cn) : [];
}
function saveCreditNotes(cn) {
    localStorage.setItem('onyx_credit_notes', JSON.stringify(cn));
}
function getDebitNotes() {
    let dn = localStorage.getItem('onyx_debit_notes');
    return dn ? JSON.parse(dn) : [];
}
function saveDebitNotes(dn) {
    localStorage.setItem('onyx_debit_notes', JSON.stringify(dn));
}


// ==========================================
// تكلفة الاستيراد (Landed Cost)
// ==========================================
function getLandedCosts() {
    let lc = localStorage.getItem('onyx_landed_costs');
    return lc ? JSON.parse(lc) : [];
}
function saveLandedCosts(lc) {
    localStorage.setItem('onyx_landed_costs', JSON.stringify(lc));
}


// ==========================================
// إدارة الائتمان المتقدمة (Credit Management)
// ==========================================
function toggleCustomerCreditHold(id) {
    let customers = getCustomers();
    let idx = customers.findIndex(c => c.id === id);
    if (idx !== -1) {
        customers[idx].isOnHold = !customers[idx].isOnHold;
        saveCustomers(customers);
        return customers[idx].isOnHold;
    }
    return false;
}




// ==========================================
// مزامنة البيانات من الخادم الخلفي (تثبيت نهائي)
// ==========================================
window.initBackendSync = async function() {
    if (window.location.protocol === 'file:') return;
    try {
        console.log('🔄 [Sync] جاري جلب البيانات من الخادم...');
        
        // 1. العملاء
        const custRes = await fetch('/api/customers');
        if (custRes.ok) {
            const customers = await custRes.json();
            localStorage.setItem('onyx_customers', JSON.stringify(customers.map(c => ({
                id: c.id, code: c.code, name: c.name, phone: c.phone, 
                balance: c.balance, creditLimit: c.credit_limit, isOnHold: c.is_on_hold
            }))));
            console.log('✅ [Sync] العملاء: ' + customers.length);
        }

        // 2. الموردين
        const supRes = await fetch('/api/suppliers');
        if (supRes.ok) {
            const suppliers = await supRes.json();
            localStorage.setItem('onyx_suppliers', JSON.stringify(suppliers.map(s => ({
                id: s.id, code: s.code, name: s.name, phone: s.phone, balance: s.balance
            }))));
            console.log('✅ [Sync] الموردين: ' + suppliers.length);
        }

        // 3. الأصناف
        const itemsRes = await fetch('/api/items');
        if (itemsRes.ok) {
            const items = await itemsRes.json();
            localStorage.setItem('onyx_items', JSON.stringify(items.map(i => ({
                id: i.id, code: i.code, name: i.name, barcode: i.barcode,
                purchasePrice: i.purchase_price, salePrice: i.sale_price,
                qty: i.qty, warehouseName: i.warehouse_name, warehouseId: 1 
            }))));
            console.log('✅ [Sync] الأصناف: ' + items.length);
        }

        // 4. القيود
        const entriesRes = await fetch('/api/entries');
        if (entriesRes.ok) {
            const entries = await entriesRes.json();
            localStorage.setItem('onyx_entries', JSON.stringify(entries));
            console.log('✅ [Sync] القيود: ' + entries.length);
        }

        // 5. فواتير المبيعات
        const invRes = await fetch('/api/sales_invoices');
        if (invRes.ok) {
            const invoices = await invRes.json();
            localStorage.setItem('onyx_invoices', JSON.stringify(invoices));
            console.log('✅ [Sync] فواتير المبيعات: ' + invoices.length);
        }

        // 6. فواتير المشتريات
        const purRes = await fetch('/api/purchase_invoices');
        if (purRes.ok) {
            const purchases = await purRes.json();
            localStorage.setItem('onyx_purchases', JSON.stringify(purchases));
            console.log('✅ [Sync] فواتير المشتريات: ' + purchases.length);
        }

    } catch (error) {
        console.error('❌ [Sync] خطأ في الاتصال بالخادم:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.initBackendSync();
});
