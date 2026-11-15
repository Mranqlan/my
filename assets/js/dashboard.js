
document.addEventListener('DOMContentLoaded', async () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('hero-date').textContent = 'مرحبا بك اليوم: ' + today.toLocaleDateString('ar-EG', options);
    
    // انتظار جلب البيانات من قاعدة البيانات
    if (typeof window.initBackendSync === 'function') {
        try { await window.initBackendSync(); } catch(e) { console.error(e); }
    }
    
    loadDashboard();
});

let dashboardCharts = {};

function loadDashboard() {
    try {
        const accounts = getAccounts();
        const entries = getEntries();
        const customers = getCustomers();
        const items = getItems();

        let totalRevenue = 0, totalExpense = 0, totalAssets = 0, totalLiab = 0, totalEquity = 0;
        let cash = 0, bank = 0, inventory = 0, receivables = 0;
        let expenseBreakdown = {};
        let monthlyData = {};

        accounts.forEach(acc => {
            let bal = 0;
            entries.forEach(e => {
                const m = e.date ? e.date.substring(0, 7) : '2026-01';
                if (!monthlyData[m]) monthlyData[m] = { rev: 0, exp: 0 };
                e.lines.forEach(l => {
                    if (l.accountCode === acc.code) {
                        if (acc.type === 'أصول' || acc.type === 'مصروفات') bal += (l.debit - l.credit);
                        else bal += (l.credit - l.debit);
                    }
                });
            });

            if (acc.type === 'إيرادات' && acc.level === 2) {
                totalRevenue += bal;
                entries.forEach(e => e.lines.forEach(l => {
                    if (l.accountCode === acc.code) monthlyData[e.date.substring(0,7)].rev += (l.credit - l.debit);
                }));
            }
            if (acc.type === 'مصروفات' && acc.level === 2 && bal > 0) {
                totalExpense += bal;
                expenseBreakdown[acc.name] = bal;
                entries.forEach(e => e.lines.forEach(l => {
                    if (l.accountCode === acc.code) monthlyData[e.date.substring(0,7)].exp += (l.debit - l.credit);
                }));
            }
            if (acc.type === 'أصول' && acc.code !== '12' && !acc.code.startsWith('12')) totalAssets += bal;
            if (acc.type === 'خصوم') totalLiab += bal;
            if (acc.type === 'حقوق ملكية') totalEquity += bal;
            if (acc.code === '1101') cash = bal;
            if (acc.code === '1102') bank = bal;
            if (acc.code === '1103') receivables = bal;
            if (acc.code === '1104') inventory = bal;
        });

        const netProfit = totalRevenue - totalExpense;
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

        // تحديث الأرقام
        document.getElementById('hero-rev').textContent = totalRevenue.toFixed(2);
        document.getElementById('hero-exp').textContent = totalExpense.toFixed(2);
        document.getElementById('hero-profit').textContent = netProfit.toFixed(2);
        document.getElementById('kpi-assets').textContent = totalAssets.toFixed(2);
        document.getElementById('kpi-revenue').textContent = totalRevenue.toFixed(2);
        document.getElementById('kpi-expense').textContent = totalExpense.toFixed(2);
        document.getElementById('kpi-profit').textContent = netProfit.toFixed(2);
        document.getElementById('kpi-profit').style.color = netProfit >= 0 ? '#10b981' : '#ef4444';
        document.getElementById('kpi-margin').textContent = `هامش ربح: ${margin.toFixed(1)}%`;

        // رسم المخططات
        drawCharts(monthlyData, expenseBreakdown, customers, items, totalLiab, totalEquity, cash, bank, inventory, receivables, margin, netProfit, totalAssets);

    } catch (error) {
        console.error("خطأ في تحميل لوحة التحكم:", error);
    }
}

function drawCharts(monthlyData, expenseBreakdown, customers, items, totalLiab, totalEquity, cash, bank, inventory, receivables, margin, netProfit, totalAssets) {
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // 1. Main Chart
    try {
        if (dashboardCharts.main) dashboardCharts.main.destroy();
        const labels = sortedMonths.length ? sortedMonths : ['لا توجد بيانات'];
        const revData = sortedMonths.length ? sortedMonths.map(m => monthlyData[m].rev) : [0];
        const expData = sortedMonths.length ? sortedMonths.map(m => monthlyData[m].exp) : [0];
        const profitData = sortedMonths.length ? sortedMonths.map(m => monthlyData[m].rev - monthlyData[m].exp) : [0];
        
        dashboardCharts.main = new Chart(document.getElementById('mainChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { type: 'bar', label: 'الإيرادات', data: revData, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 4 },
                    { type: 'bar', label: 'المصروفات', data: expData, backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 4 },
                    { type: 'line', label: 'صافي الربح', data: profitData, borderColor: '#3b82f6', borderWidth: 3, tension: 0.4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch(e) { console.error("خطأ في mainChart:", e); }

    // 2. Health Chart
    try {
        if (dashboardCharts.health) dashboardCharts.health.destroy();
        const healthScore = Math.min(100, Math.max(0, 50 + margin + (totalLiab > 0 ? Math.min(20, (totalEquity / totalLiab) * 5) : 30)));
        dashboardCharts.health = new Chart(document.getElementById('healthChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['درجة الصحة', 'متبقي'],
                datasets: [{ data: [healthScore, 100 - healthScore], backgroundColor: [healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444', '#f1f5f9'], borderWidth: 0, cutout: '75%' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch(e) { console.error("خطأ في healthChart:", e); }

    // 3. Expense Chart
    try {
        if (dashboardCharts.expense) dashboardCharts.expense.destroy();
        const expLabels = Object.keys(expenseBreakdown);
        const expValues = Object.values(expenseBreakdown);
        dashboardCharts.expense = new Chart(document.getElementById('expenseChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels: expLabels.length ? expLabels : ['لا توجد مصروفات'], datasets: [{ data: expValues.length ? expValues : [1], backgroundColor: palette, borderWidth: 3, borderColor: '#fff' }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
        });
    } catch(e) { console.error("خطأ في expenseChart:", e); }

    // 4. Customers Chart
    try {
        if (dashboardCharts.customers) dashboardCharts.customers.destroy();
        const topCustomers = customers.filter(c => parseFloat(c.balance) > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);
        dashboardCharts.customers = new Chart(document.getElementById('customersChart').getContext('2d'), {
            type: 'bar',
            data: { labels: topCustomers.length ? topCustomers.map(c => c.name) : ['لا يوجد مدينين'], datasets: [{ label: 'الرصيد', data: topCustomers.length ? topCustomers.map(c => parseFloat(c.balance)) : [0], backgroundColor: 'rgba(139,92,246,0.8)', borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
        });
    } catch(e) { console.error("خطأ في customersChart:", e); }

    // 5. Inventory Chart
    try {
        if (dashboardCharts.inventory) dashboardCharts.inventory.destroy();
        let inStock = 0, lowStock = 0, outOfStock = 0;
        items.forEach(i => { if (parseFloat(i.qty) === 0) outOfStock++; else if (parseFloat(i.qty) <= 5) lowStock++; else inStock++; });
        dashboardCharts.inventory = new Chart(document.getElementById('inventoryChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels: ['متوفر', 'منخفض', 'نفد'], datasets: [{ data: [inStock, lowStock, outOfStock], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 3, borderColor: '#fff' }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
        });
    } catch(e) { console.error("خطأ في inventoryChart:", e); }
}
