import os

html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم | AL SHAMEL</title>
    <link rel="stylesheet" href="/assets/css/style.css?v=3000">
    <link rel="stylesheet" href="/assets/css/components.css?v=3000">
    <link rel="stylesheet" href="/assets/css/sidebar.css?v=3000">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* ===== Hero ===== */
        .dash-hero {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #10b981 100%);
            color: white; padding: 30px 40px; border-radius: 20px; margin-bottom: 25px;
            box-shadow: 0 15px 40px rgba(16, 185, 129, 0.25);
            position: relative; overflow: hidden;
        }
        .dash-hero::after {
            content: ''; position: absolute; top: -60%; left: -20%;
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            border-radius: 50%;
        }
        .dash-hero-inner { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        .dash-hero h1 { margin: 0 0 5px 0; font-size: 26px; font-weight: 800; }
        .dash-hero p { margin: 0; opacity: 0.9; font-size: 14px; }
        .hero-metrics { display: flex; gap: 30px; }
        .hero-metric { display: flex; flex-direction: column; gap: 3px; }
        .hero-metric .lbl { font-size: 11px; opacity: 0.8; letter-spacing: 0.5px; text-transform: uppercase; }
        .hero-metric .val { font-size: 22px; font-weight: 800; font-family: monospace; }
        .setup-btn {
            background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white;
            border: none; padding: 11px 22px; border-radius: 10px; font-weight: 800;
            cursor: pointer; font-family: inherit; font-size: 13px;
            box-shadow: 0 4px 15px rgba(245,158,11,0.4);
            transition: all 0.2s;
        }
        .setup-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.5); }

        /* ===== KPI Cards ===== */
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 25px; }
        .kpi-box {
            background: white; padding: 20px; border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
            display: flex; flex-direction: column; gap: 8px;
            transition: all 0.3s; position: relative; overflow: hidden;
        }
        .kpi-box:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .kpi-box::before { content: ''; position: absolute; top: 0; right: 0; width: 4px; height: 100%; }
        .kpi-box.blue::before { background: linear-gradient(180deg, #3b82f6, #60a5fa); }
        .kpi-box.green::before { background: linear-gradient(180deg, #10b981, #34d399); }
        .kpi-box.red::before { background: linear-gradient(180deg, #ef4444, #f87171); }
        .kpi-box.amber::before { background: linear-gradient(180deg, #f59e0b, #fbbf24); }

        .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .kpi-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .kpi-box.blue .kpi-icon-wrap { background: #dbeafe; }
        .kpi-box.green .kpi-icon-wrap { background: #d1fae5; }
        .kpi-box.red .kpi-icon-wrap { background: #fee2e2; }
        .kpi-box.amber .kpi-icon-wrap { background: #fef3c7; }

        .kpi-trend { font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 20px; }
        .kpi-trend.up { background: #d1fae5; color: #065f46; }
        .kpi-trend.down { background: #fee2e2; color: #991b1b; }
        .kpi-trend.neutral { background: #f1f5f9; color: #64748b; }

        .kpi-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { font-size: 26px; font-weight: 800; font-family: monospace; color: #0f172a; letter-spacing: -0.5px; }
        .kpi-sub { font-size: 11px; color: #94a3b8; }

        /* ===== Charts Grid ===== */
        .charts-main { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
        .charts-secondary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .panel {
            background: white; border-radius: 14px; padding: 22px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
        }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; }
        .panel-header .badge { font-size: 10px; background: #f1f5f9; color: #64748b; padding: 3px 9px; border-radius: 20px; font-weight: 700; }
        .chart-wrapper { position: relative; height: 280px; }
        .chart-wrapper-sm { position: relative; height: 220px; }

        /* ===== Financial Ratios ===== */
        .ratios-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .ratio-card {
            background: white; padding: 18px; border-radius: 12px;
            border: 1px solid #f1f5f9; box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            text-align: center; transition: all 0.2s;
        }
        .ratio-card:hover { transform: translateY(-3px); }
        .ratio-card .ratio-name { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
        .ratio-card .ratio-value { font-size: 26px; font-weight: 800; font-family: monospace; margin-bottom: 5px; }
        .ratio-card .ratio-status { font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; display: inline-block; }
        .ratio-card .ratio-status.good { background: #d1fae5; color: #065f46; }
        .ratio-card .ratio-status.warn { background: #fef3c7; color: #92400e; }
        .ratio-card .ratio-status.bad { background: #fee2e2; color: #991b1b; }
        .ratio-card .ratio-desc { font-size: 10px; color: #94a3b8; margin-top: 6px; }

        /* ===== Activity Feed ===== */
        .activity-item {
            display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .activity-info { flex: 1; }
        .activity-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .activity-meta { font-size: 11px; color: #94a3b8; }
        .activity-amount { font-size: 13px; font-weight: 800; font-family: monospace; flex-shrink: 0; }
    </style>
</head>
<body>
    <aside class="sidebar" id="sidebar-container"></aside>
    <main class="main-wrapper">
        <header class="top-header">
            <div class="user-profile"><span>OMRAN AQLAN</span><div class="avatar">O</div></div>
            <div class="search-box"><input type="text" placeholder="بحث في النظام..."></div>
        </header>
        <section class="content-area">

            <!-- ============ HERO ============ -->
            <div class="dash-hero">
                <div class="dash-hero-inner">
                    <div>
                        <h1>👑 لوحة التحكم التنفيذية</h1>
                        <p id="hero-date">مرحبا بك إليك ملخص أداء الشركة اليوم.</p>
                    </div>
                    <div class="hero-metrics" id="hero-metrics">
                        <div class="hero-metric"><span class="lbl">الإيرادات</span><span class="val" id="hero-rev">0.00</span></div>
                        <div class="hero-metric"><span class="lbl">المصروفات</span><span class="val" id="hero-exp">0.00</span></div>
                        <div class="hero-metric"><span class="lbl">صافي الربح</span><span class="val" id="hero-profit">0.00</span></div>
                    </div>
                    <button class="setup-btn" onclick="setupDemoData()">🚀 تجهيز البيانات</button>
                </div>
            </div>

            <!-- ============ KPI ROW ============ -->
            <div class="kpi-row">
                <div class="kpi-box blue">
                    <div class="kpi-top">
                        <div class="kpi-icon-wrap">🏢</div>
                        <span class="kpi-trend up" id="trend-assets">▲ 0%</span>
                    </div>
                    <div class="kpi-label">إجمالي الأصول</div>
                    <div class="kpi-value" id="kpi-assets">0.00</div>
                    <div class="kpi-sub">الأصول المتداولة + الثابتة</div>
                </div>
                <div class="kpi-box green">
                    <div class="kpi-top">
                        <div class="kpi-icon-wrap">📈</div>
                        <span class="kpi-trend up" id="trend-rev">▲ 0%</span>
                    </div>
                    <div class="kpi-label">إجمالي الإيرادات</div>
                    <div class="kpi-value" id="kpi-revenue">0.00</div>
                    <div class="kpi-sub">من كل الفواتير المسجلة</div>
                </div>
                <div class="kpi-box red">
                    <div class="kpi-top">
                        <div class="kpi-icon-wrap">📉</div>
                        <span class="kpi-trend down" id="trend-exp">▼ 0%</span>
                    </div>
                    <div class="kpi-label">إجمالي المصروفات</div>
                    <div class="kpi-value" id="kpi-expense">0.00</div>
                    <div class="kpi-sub">تشغيلية + إدارية + تكلفة</div>
                </div>
                <div class="kpi-box amber">
                    <div class="kpi-top">
                        <div class="kpi-icon-wrap">💎</div>
                        <span class="kpi-trend neutral" id="trend-profit">—</span>
                    </div>
                    <div class="kpi-label">صافي الربح / الخسارة</div>
                    <div class="kpi-value" id="kpi-profit">0.00</div>
                    <div class="kpi-sub" id="kpi-margin">هامش ربح: 0%</div>
                </div>
            </div>

            <!-- ============ MAIN CHARTS ============ -->
            <div class="charts-main">
                <div class="panel">
                    <div class="panel-header">
                        <h3>📊 تحليل الإيرادات والمصروفات الشهري</h3>
                        <span class="badge">آخر 12 شهرا</span>
                    </div>
                    <div class="chart-wrapper"><canvas id="mainChart"></canvas></div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h3>🎯 صحة الشركة المالية</h3>
                        <span class="badge">مؤشر</span>
                    </div>
                    <div class="chart-wrapper"><canvas id="healthChart"></canvas></div>
                </div>
            </div>

            <!-- ============ FINANCIAL RATIOS ============ -->
            <div class="panel" style="margin-bottom: 20px;">
                <div class="panel-header">
                    <h3>📐 النسب المالية الرئيسية</h3>
                    <span class="badge">تحليل علمي</span>
                </div>
                <div class="ratios-grid" id="ratios-grid"></div>
            </div>

            <!-- ============ SECONDARY CHARTS ============ -->
            <div class="charts-secondary">
                <div class="panel">
                    <div class="panel-header">
                        <h3>🍩 هيكل المصروفات</h3>
                        <span class="badge">توزيع</span>
                    </div>
                    <div class="chart-wrapper-sm"><canvas id="expenseChart"></canvas></div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h3>🏆 أكبر 5 عملاء</h3>
                        <span class="badge">ذمم مدينة</span>
                    </div>
                    <div class="chart-wrapper-sm"><canvas id="customersChart"></canvas></div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h3>📦 حالة المخزون</h3>
                        <span class="badge">مستودعات</span>
                    </div>
                    <div class="chart-wrapper-sm"><canvas id="inventoryChart"></canvas></div>
                </div>
            </div>

            <!-- ============ ACTIVITY + QUICK ============ -->
            <div class="charts-main">
                <div class="panel">
                    <div class="panel-header">
                        <h3>🕒 أحدث القيود اليومية</h3>
                        <a href="/pages/financial/review-entries.html" style="font-size: 12px; color: #10b981; font-weight: 700; text-decoration: none;">عرض الكل ←</a>
                    </div>
                    <div id="recent-entries"></div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <h3>⚡ إجراءات سريعة</h3>
                        <span class="badge">اختصارات</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <a href="/pages/financial/journal-entries.html" style="text-decoration: none; padding: 15px; background: #f8fafc; border-radius: 10px; text-align: center; transition: all 0.2s;">
                            <div style="font-size: 26px; margin-bottom: 5px;">📝</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">قيد جديد</div>
                        </a>
                        <a href="/pages/commercial/sales-invoices.html" style="text-decoration: none; padding: 15px; background: #f8fafc; border-radius: 10px; text-align: center; transition: all 0.2s;">
                            <div style="font-size: 26px; margin-bottom: 5px;">🧾</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">فاتورة مبيعات</div>
                        </a>
                        <a href="/pages/commercial/purchase-invoices.html" style="text-decoration: none; padding: 15px; background: #f8fafc; border-radius: 10px; text-align: center; transition: all 0.2s;">
                            <div style="font-size: 26px; margin-bottom: 5px;">🛒</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">فاتورة مشتريات</div>
                        </a>
                        <a href="/pages/accounts/trial-balance.html" style="text-decoration: none; padding: 15px; background: #f8fafc; border-radius: 10px; text-align: center; transition: all 0.2s;">
                            <div style="font-size: 26px; margin-bottom: 5px;">⚖️</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">ميزان المراجعة</div>
                        </a>
                    </div>
                </div>
            </div>

        </section>
    </main>

    <script src="/assets/js/database.js?v=3000"></script>
    <script src="/assets/js/layout.js?v=3000"></script>
    <script src="/assets/js/app.js?v=3000"></script>
    <script src="/assets/js/company-info.js?v=3000"></script>
    <script src="/assets/js/branch-notifications.js?v=3000"></script>
    <script>
        Chart.defaults.font.family = "'Cairo', sans-serif";
        Chart.defaults.color = '#64748b';
        Chart.defaults.font.size = 11;

        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('hero-date').textContent = 'مرحبا بك اليوم: ' + today.toLocaleDateString('ar-EG', options);
            loadDashboard();
        });

        function loadDashboard() {
            const accounts = getAccounts();
            const entries = getEntries();
            const customers = getCustomers();
            const items = getItems();

            // ===== 1. حساب الإجماليات =====
            let totalRevenue = 0, totalExpense = 0, totalAssets = 0, totalLiab = 0, totalEquity = 0;
            let cash = 0, bank = 0, inventory = 0, receivables = 0;
            let expenseBreakdown = {};
            let monthlyData = {};

            accounts.forEach(acc => {
                let bal = 0;
                entries.forEach(e => {
                    const m = e.date.substring(0, 7);
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

            // Hero
            document.getElementById('hero-rev').textContent = totalRevenue.toFixed(2);
            document.getElementById('hero-exp').textContent = totalExpense.toFixed(2);
            document.getElementById('hero-profit').textContent = netProfit.toFixed(2);

            // KPIs
            document.getElementById('kpi-assets').textContent = totalAssets.toFixed(2);
            document.getElementById('kpi-revenue').textContent = totalRevenue.toFixed(2);
            document.getElementById('kpi-expense').textContent = totalExpense.toFixed(2);
            document.getElementById('kpi-profit').textContent = netProfit.toFixed(2);
            document.getElementById('kpi-profit').style.color = netProfit >= 0 ? '#10b981' : '#ef4444';
            document.getElementById('kpi-margin').textContent = `هامش ربح: ${margin.toFixed(1)}%`;

            // Trend: مقارنة الشهر الأخير بالشهر السابق
            const sortedMonths = Object.keys(monthlyData).sort();
            if (sortedMonths.length >= 2) {
                const last = monthlyData[sortedMonths[sortedMonths.length - 1]];
                const prev = monthlyData[sortedMonths[sortedMonths.length - 2]];
                const revTrend = prev.rev > 0 ? ((last.rev - prev.rev) / prev.rev * 100) : 0;
                const expTrend = prev.exp > 0 ? ((last.exp - prev.exp) / prev.exp * 100) : 0;
                document.getElementById('trend-rev').textContent = (revTrend >= 0 ? '▲' : '▼') + ' ' + Math.abs(revTrend).toFixed(0) + '%';
                document.getElementById('trend-rev').className = 'kpi-trend ' + (revTrend >= 0 ? 'up' : 'down');
                document.getElementById('trend-exp').textContent = (expTrend >= 0 ? '▲' : '▼') + ' ' + Math.abs(expTrend).toFixed(0) + '%';
                document.getElementById('trend-exp').className = 'kpi-trend ' + (expTrend <= 0 ? 'up' : 'down');
            }

            // ===== 2. الرسم الرئيسي =====
            const revData = sortedMonths.map(m => monthlyData[m].rev);
            const expData = sortedMonths.map(m => monthlyData[m].exp);
            const profitData = sortedMonths.map(m => monthlyData[m].rev - monthlyData[m].exp);

            const mainLabels = sortedMonths.length ? sortedMonths : ['لا توجد بيانات'];
            const mainRev = revData.length ? revData : [0];
            const mainExp = expData.length ? expData : [0];
            const mainProfit = profitData.length ? profitData : [0];

            new Chart(document.getElementById('mainChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: mainLabels,
                    datasets: [
                        { type: 'bar', label: 'الإيرادات', data: mainRev, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 4, barPercentage: 0.7 },
                        { type: 'bar', label: 'المصروفات', data: mainExp, backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 4, barPercentage: 0.7 },
                        { type: 'line', label: 'صافي الربح', data: mainProfit, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: false, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#3b82f6' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 11, weight: 700 } } } },
                    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                }
            });

            // ===== 3. مؤشر الصحة المالية (Gauge) =====
            const healthScore = Math.min(100, Math.max(0, 50 + margin + (totalLiab > 0 ? Math.min(20, (totalEquity / totalLiab) * 5) : 30)));
            
            new Chart(document.getElementById('healthChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['درجة الصحة', 'متبقي'],
                    datasets: [{
                        data: [healthScore, 100 - healthScore],
                        backgroundColor: [healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444', '#f1f5f9'],
                        borderWidth: 0,
                        cutout: '75%'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    afterDraw: (chart) => {
                        const { ctx, chartArea } = chart;
                        const centerX = (chartArea.left + chartArea.right) / 2;
                        const centerY = (chartArea.top + chartArea.bottom) / 2;
                        ctx.save();
                        ctx.font = 'bold 36px Cairo';
                        ctx.fillStyle = healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(healthScore.toFixed(0), centerX, centerY - 5);
                        ctx.font = 'bold 11px Cairo';
                        ctx.fillStyle = '#64748b';
                        ctx.fillText('من 100', centerX, centerY + 22);
                        ctx.restore();
                    }
                }]
            });

            // ===== 4. النسب المالية =====
            const currentRatio = totalLiab > 0 ? ((cash + bank + inventory + receivables) / totalLiab) : 0;
            const debtRatio = (totalLiab + totalEquity) > 0 ? (totalLiab / (totalLiab + totalEquity) * 100) : 0;
            const roa = totalAssets > 0 ? (netProfit / totalAssets * 100) : 0;
            const roe = totalEquity > 0 ? (netProfit / totalEquity * 100) : 0;

            document.getElementById('ratios-grid').innerHTML = `
                <div class="ratio-card">
                    <div class="ratio-name">نسبة التداول</div>
                    <div class="ratio-value" style="color: #3b82f6;">${currentRatio.toFixed(2)}</div>
                    <div class="ratio-status ${currentRatio >= 1.5 ? 'good' : currentRatio >= 1 ? 'warn' : 'bad'}">${currentRatio >= 1.5 ? 'ممتاز' : currentRatio >= 1 ? 'مقبول' : 'ضعيف'}</div>
                    <div class="ratio-desc">الأصول المتداولة ÷ الخصوم</div>
                </div>
                <div class="ratio-card">
                    <div class="ratio-name">نسبة المديونية</div>
                    <div class="ratio-value" style="color: #ef4444;">${debtRatio.toFixed(1)}%</div>
                    <div class="ratio-status ${debtRatio <= 40 ? 'good' : debtRatio <= 60 ? 'warn' : 'bad'}">${debtRatio <= 40 ? 'ممتاز' : debtRatio <= 60 ? 'مقبول' : 'مرتفع'}</div>
                    <div class="ratio-desc">الخصوم ÷ إجمالي الأصول</div>
                </div>
                <div class="ratio-card">
                    <div class="ratio-name">العائد على الأصول</div>
                    <div class="ratio-value" style="color: #10b981;">${roa.toFixed(1)}%</div>
                    <div class="ratio-status ${roa >= 10 ? 'good' : roa >= 3 ? 'warn' : 'bad'}">${roa >= 10 ? 'ممتاز' : roa >= 3 ? 'مقبول' : 'ضعيف'}</div>
                    <div class="ratio-desc">صافي الربح ÷ إجمالي الأصول</div>
                </div>
                <div class="ratio-card">
                    <div class="ratio-name">العائد على حقوق الملكية</div>
                    <div class="ratio-value" style="color: #8b5cf6;">${roe.toFixed(1)}%</div>
                    <div class="ratio-status ${roe >= 15 ? 'good' : roe >= 5 ? 'warn' : 'bad'}">${roe >= 15 ? 'ممتاز' : roe >= 5 ? 'مقبول' : 'ضعيف'}</div>
                    <div class="ratio-desc">صافي الربح ÷ حقوق الملكية</div>
                </div>
            `;

            // ===== 5. هيكل المصروفات =====
            const expLabels = Object.keys(expenseBreakdown);
            const expValues = Object.values(expenseBreakdown);
            const softColors = ['#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#84cc16'];
            
            new Chart(document.getElementById('expenseChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: expLabels.length ? expLabels : ['لا توجد مصروفات'],
                    datasets: [{ data: expValues.length ? expValues : [1], backgroundColor: softColors, borderWidth: 3, borderColor: '#fff' }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 10 }, boxWidth: 12 } } }
                }
            });

            // ===== 6. أكبر 5 عملاء =====
            const topCustomers = customers.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);
            
            new Chart(document.getElementById('customersChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: topCustomers.length ? topCustomers.map(c => c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name) : ['لا يوجد مدينين'],
                    datasets: [{ label: 'الرصيد', data: topCustomers.length ? topCustomers.map(c => parseFloat(c.balance)) : [0], backgroundColor: 'rgba(139,92,246,0.8)', borderRadius: 6 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false }, ticks: { font: { size: 9 } } } } }
            });

            // ===== 7. حالة المخزون =====
            let inStock = 0, lowStock = 0, outStock = 0;
            items.forEach(i => { if (i.qty === 0) outStock++; else if (i.qty <= 5) lowStock++; else inStock++; });

            new Chart(document.getElementById('inventoryChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['متوفر', 'منخفض', 'نفد'],
                    datasets: [{ data: [inStock, lowStock, outStock], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 3, borderColor: '#fff' }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 10 }, boxWidth: 12 } } }
                }
            });

            // ===== 8. أحدث القيود =====
            const recent = entries.slice(-5).reverse();
            const recentHTML = recent.length ? recent.map(e => `
                <div class="activity-item">
                    <div class="activity-icon" style="background: #dbeafe;">📝</div>
                    <div class="activity-info">
                        <div class="activity-title">${e.entryNumber}</div>
                        <div class="activity-meta">${e.date} • ${(e.description || 'بدون بيان').substring(0, 40)}</div>
                    </div>
                    <div class="activity-amount text-debit">${e.totalDebit.toFixed(2)}</div>
                </div>
            `).join('') : '<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 13px;">لا توجد قيود حديثة</div>';
            document.getElementById('recent-entries').innerHTML = recentHTML;
        }

        function setupDemoData() {
            if (!confirm('سيتم مسح البيانات الحالية وإدخال بيانات واقعية. متابعة')) return;
            let keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key && key.startsWith('onyx_')) keysToRemove.push(key);
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            localStorage.setItem('onyx_cost_centers', JSON.stringify([{ id: 1, code: "BR-001", name: "الفرع الرئيسي", type: "فرع", parentId: null }]));
            localStorage.setItem('onyx_warehouses', JSON.stringify([{ id: 1, code: "WH-001", name: "المستودع الرئيسي", location: "الرياض" }]));
            localStorage.setItem('onyx_customers', JSON.stringify([
                { id: 101, code: "C-0001", name: "مؤسسة النور التجارية", phone: "0501111111", balance: 51750.00, creditLimit: 100000 },
                { id: 102, code: "C-0002", name: "شركة الأمل", phone: "0502222222", balance: 0, creditLimit: 50000 }
            ]));
            localStorage.setItem('onyx_suppliers', JSON.stringify([{ id: 201, code: "SUP-001", name: "شركة التقنية المتقدمة", phone: "0503333333", balance: 172500.00 }]));
            localStorage.setItem('onyx_items', JSON.stringify([
                { id: 301, code: "ITM-0001", name: "لابتوب Dell", purchasePrice: 3000, salePrice: 4500, qty: 40, warehouseId: 1, warehouseName: "المستودع الرئيسي" },
                { id: 302, code: "ITM-0002", name: "شاشة سامسونج", purchasePrice: 500, salePrice: 800, qty: 3, warehouseId: 1, warehouseName: "المستودع الرئيسي" }
            ]));
            localStorage.setItem('onyx_employees', JSON.stringify([{ id: 401, code: "EMP-001", name: "أحمد محمد", branchId: 1, branchName: "الفرع الرئيسي", base: 8000, allow: 2000, ded: 10, jobTitle: "محاسب" }]));
            localStorage.setItem('onyx_entries', JSON.stringify([
                { id: 1001, entryNumber: "JV-2026-0001", date: "2026-01-01", description: "إيداع رأس المال", lines: [{ accountCode: "1102", accountName: "البنك", debit: 500000, credit: 0 }, { accountCode: "3101", accountName: "رأس المال", debit: 0, credit: 500000 }], totalDebit: 500000, totalCredit: 500000, status: "posted" },
                { id: 1002, entryNumber: "JV-2026-0002", date: "2026-01-05", description: "فاتورة مشتريات - المستودع الرئيسي", lines: [{ accountCode: "1104", accountName: "المخزون", debit: 150000, credit: 0 }, { accountCode: "1105", accountName: "ضريبة المدخلات", debit: 22500, credit: 0 }, { accountCode: "2101", accountName: "الموردون", debit: 0, credit: 172500 }], totalDebit: 172500, totalCredit: 172500, status: "posted" },
                { id: 1003, entryNumber: "JV-2026-0003", date: "2026-02-10", description: "فاتورة مبيعات - المستودع الرئيسي", lines: [{ accountCode: "1103", accountName: "العملاء", debit: 51750, credit: 0 }, { accountCode: "4101", accountName: "إيرادات المبيعات", debit: 0, credit: 45000 }, { accountCode: "2102", accountName: "ضريبة المخرجات", debit: 0, credit: 6750 }], totalDebit: 51750, totalCredit: 51750, status: "posted" },
                { id: 1004, entryNumber: "JV-2026-0004", date: "2026-02-10", description: "تكلفة مبيعات", lines: [{ accountCode: "5104", accountName: "تكلفة البضاعة المباعة", debit: 30000, credit: 0 }, { accountCode: "1104", accountName: "المخزون", debit: 0, credit: 30000 }], totalDebit: 30000, totalCredit: 30000, status: "posted" },
                { id: 1005, entryNumber: "JV-2026-0005", date: "2026-03-15", description: "سداد إيجار المكتب", lines: [{ accountCode: "5102", accountName: "مصروف الإيجار", debit: 10000, credit: 0 }, { accountCode: "1102", accountName: "البنك", debit: 0, credit: 10000 }], totalDebit: 10000, totalCredit: 10000, status: "posted" }
            ]));
            localStorage.setItem('onyx_invoices', JSON.stringify([{ id: 2001, invoiceNumber: "INV-2026-0001", customerId: 101, customerName: "مؤسسة النور التجارية", date: "2026-02-10", total: 51750, items: [{ itemId: 301, itemName: "لابتوب Dell", qty: 10, price: 4500, cost: 3000 }] }]));
            localStorage.setItem('onyx_purchases', JSON.stringify([{ id: 3001, invoiceNumber: "PUR-2026-0001", supplierId: 201, supplierName: "شركة التقنية المتقدمة", date: "2026-01-05", total: 172500, items: [{ itemId: 301, itemName: "لابتوب Dell", qty: 50, price: 3000 }] }]));

            alert('تم تجهيز البيانات! جاري إعادة التحميل...');
            location.reload();
        }
    </script>
</body>
</html>"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ تم بناء لوحة التحكم العلمية المتقدمة")
