// ==========================================
// محرك إشعارات الفروع والمخزون الحي (Live Branch & Inventory Engine)
// ==========================================

function generateLiveNotifications() {
    const notifications = [];
    const branches = getCostCenters().filter(c => c.type === 'فرع');
    const invoices = getInvoices();
    const purchases = getPurchases();
    const items = getItems();
    const warehouses = getWarehouses();
    const today = new Date();

    if (branches.length === 0) return notifications;

    // ===== حساب إحصائيات كل فرع =====
    const stats = branches.map(branch => {
        const brInv = invoices.filter(i => i.branchName === branch.name);
        const brPur = purchases.filter(p => p.branchName === branch.name);
        
        const totalSales = brInv.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);
        const totalPurchases = brPur.reduce((s, p) => s + (parseFloat(p.total) || 0), 0);
        const profit = totalSales - totalPurchases;
        const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
        
        const wh = warehouses.find(w => w.name.includes(branch.name));
        const brItems = wh ? items.filter(i => i.warehouseId === wh.id) : [];
        const outOfStock = brItems.filter(i => i.qty === 0);
        const lowStock = brItems.filter(i => i.qty > 0 && i.qty <= 5);
        
        // آخر نشاط
        let lastActivity = null;
        if (brInv.length > 0) {
            const latest = brInv.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
            lastActivity = latest.date;
        }
        const daysSinceActivity = lastActivity ? Math.floor((today - new Date(lastActivity)) / 86400000) : null;
        
        return { branch, totalSales, totalPurchases, profit, margin, brItems, outOfStock, lowStock, daysSinceActivity, invoiceCount: brInv.length };
    });

    const activeBranches = stats.filter(s => s.totalSales > 0 || s.invoiceCount > 0);
    const totalAllSales = stats.reduce((s, b) => s + b.totalSales, 0);
    const totalAllProfit = stats.reduce((s, b) => s + b.profit, 0);

    // ===== 1. إشعارات ترتيب المبيعات =====
    if (activeBranches.length > 1 && totalAllSales > 0) {
        const sorted = [...activeBranches].sort((a, b) => b.totalSales - a.totalSales);
        const top = sorted[0];
        const worst = sorted[sorted.length - 1];
        const share = (top.totalSales / totalAllSales) * 100;

        notifications.push({
            id: 'top_sales', type: 'sales_ranking', priority: 'success', icon: '🏆',
            title: `فرع "${top.branch.name}" يتصدر المبيعات الآن`,
            message: `مبيعاته ${top.totalSales.toFixed(2)} ريال (${share.toFixed(1)}% من إجمالي الشركة البالغ ${totalAllSales.toFixed(2)} ريال)`,
            action: '/pages/reports/branch-comparison.html', actionLabel: 'عرض المقارنة'
        });

        if (worst.totalSales < top.totalSales * 0.3 && worst.invoiceCount > 0) {
            notifications.push({
                id: 'weak_sales', type: 'sales_ranking', priority: 'warning', icon: '📉',
                title: `فرع "${worst.branch.name}" يتراجع`,
                message: `مبيعاته ${worst.totalSales.toFixed(2)} ريال فقط (${((worst.totalSales/top.totalSales)*100).toFixed(0)}% من أداء الفرع الأول)`,
                action: '/pages/reports/branch-comparison.html', actionLabel: 'مراجعة الأداء'
            });
        }

        if (worst.totalSales === 0 && worst.invoiceCount === 0 && worst.brItems.length > 0) {
            notifications.push({
                id: 'no_sales', type: 'sales_ranking', priority: 'critical', icon: '🔴',
                title: `فرع "${worst.branch.name}" بدون أي مبيعات`,
                message: `لديه ${worst.brItems.length} صنف في المخزون لكن صفر مبيعات - يحتاج تدخل فوري`,
                action: '/pages/reports/branch-comparison.html', actionLabel: 'اتخاذ إجراء'
            });
        }
    }

    // ===== 2. إشعارات الربحية =====
    if (activeBranches.length > 1) {
        const sorted = [...activeBranches].sort((a, b) => b.margin - a.margin);
        const best = sorted[0];
        
        notifications.push({
            id: 'top_profit', type: 'profitability', priority: 'success', icon: '💎',
            title: `فرع "${best.branch.name}" الأكثر ربحية`,
            message: `هامش ربح ${best.margin.toFixed(1)}% (صافي ${best.profit.toFixed(2)} ريال من مبيعات ${best.totalSales.toFixed(2)})`,
            action: '/pages/reports/branch-comparison.html', actionLabel: 'عرض التفاصيل'
        });

        stats.forEach(s => {
            if (s.profit < 0) {
                notifications.push({
                    id: 'loss_' + s.branch.id, type: 'profitability', priority: 'critical', icon: '⚠️',
                    title: `فرع "${s.branch.name}" يحقق خسارة`,
                    message: `خسارة ${Math.abs(s.profit).toFixed(2)} ريال (هامش ${s.margin.toFixed(1)}%) - المصروفات أعلى من الإيرادات`,
                    action: '/pages/reports/branch-comparison.html', actionLabel: 'مراجعة'
                });
            }
        });
    }

    // ===== 3. إشعارات المخزون لكل فرع =====
    stats.forEach(s => {
        if (s.outOfStock.length > 0) {
            const itemNames = s.outOfStock.slice(0, 3).map(i => i.name).join(', ');
            notifications.push({
                id: 'out_stock_' + s.branch.id, type: 'inventory', priority: 'critical', icon: '📦',
                title: `فرع "${s.branch.name}": ${s.outOfStock.length} صنف نفد تماماً`,
                message: `${itemNames}${s.outOfStock.length > 3 ? ' وأصناف أخرى' : ''}`,
                action: '/pages/inventory.html', actionLabel: 'مراجعة المخزون'
            });
        }

        if (s.lowStock.length > 0) {
            const itemNames = s.lowStock.slice(0, 3).map(i => `${i.name} (${i.qty})`).join(', ');
            notifications.push({
                id: 'low_stock_' + s.branch.id, type: 'inventory', priority: 'warning', icon: '⚠️',
                title: `فرع "${s.branch.name}": ${s.lowStock.length} صنف على وشك النفاد`,
                message: `أصناف بكمية ≤ 5: ${itemNames}${s.lowStock.length > 3 ? '...' : ''}`,
                action: '/pages/commercial/purchase-orders.html', actionLabel: 'طلب شراء'
            });
        }
    });

    // ===== 4. إشعارات النشاط =====
    stats.forEach(s => {
        if (s.daysSinceActivity === null && s.brItems.length > 0) {
            notifications.push({
                id: 'never_active_' + s.branch.id, type: 'activity', priority: 'warning', icon: '🆕',
                title: `فرع "${s.branch.name}" لم يسجل أي مبيعات بعد`,
                message: `الفرع جاهز بمخزون ${s.brItems.length} صنف لكن لم يبع أي شيء - يرجى تفعيله`,
                action: '/pages/commercial/sales-invoices.html', actionLabel: 'تسجيل مبيعات'
            });
        } else if (s.daysSinceActivity !== null) {
            if (s.daysSinceActivity > 30) {
                notifications.push({
                    id: 'dead_' + s.branch.id, type: 'activity', priority: 'critical', icon: '🛑',
                    title: `فرع "${s.branch.name}" متوقف تماماً`,
                    message: `لم يسجل مبيعات منذ ${s.daysSinceActivity} يوم - يحتاج تدخل عاجل`,
                    action: '/pages/reports/branch-comparison.html', actionLabel: 'مراجعة'
                });
            } else if (s.daysSinceActivity > 7) {
                notifications.push({
                    id: 'inactive_' + s.branch.id, type: 'activity', priority: 'warning', icon: '⏰',
                    title: `فرع "${s.branch.name}" غير نشط`,
                    message: `لم يسجل مبيعات منذ ${s.daysSinceActivity} يوم`,
                    action: '/pages/commercial/sales-invoices.html', actionLabel: 'تسجيل مبيعات'
                });
            }
        }
    });

    return notifications;
}





function updateBellBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    
    const notifications = generateLiveNotifications();
    const count = notifications.length;
    
    if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
    } else {
        badge.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateBellBadge, 500);
});
