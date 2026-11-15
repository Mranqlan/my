// ==========================================
// فلتر الفروع للتقارير (Report Branch Filter)
// ==========================================

function injectReportFilter(containerSelector) {
    const branches = getCostCenters().filter(c => c.type === 'فرع' || c.type === 'قسم');
    const urlParams = new URLSearchParams(window.location.search);
    const selectedBranch = urlParams.get('branch') || localStorage.getItem('onyx_report_branch_filter') || 'all';

    const filterHTML = `
        <div class="report-branch-filter" style="background: linear-gradient(135deg, #0f172a, #1e3a8a); color: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(15, 23, 42, 0.2);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">🏢</span>
                <div>
                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 3px;">تصفية التقرير حسب الفرع</div>
                    <select id="report-branch-select" onchange="applyBranchFilter(this.value)" style="padding: 8px 15px; border-radius: 6px; border: none; font-family: inherit; font-weight: bold; font-size: 14px; cursor: pointer; min-width: 220px;">
                        <option value="all" ${selectedBranch === 'all' ? 'selected' : ''}>🌐 كل الفروع (تقرير عام)</option>
                        ${branches.map(b => `<option value="${b.id}" ${selectedBranch == b.id ? 'selected' : ''}>${b.type === 'فرع' ? '🏢' : '↳'} ${b.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div style="font-size: 13px; opacity: 0.9; text-align: left;">
                <div>التقرير الحالي:</div>
                <div style="font-size: 16px; font-weight: bold;" id="current-report-scope">
                    ${selectedBranch === 'all' ? 'جميع الفروع' : (branches.find(b => b.id == selectedBranch)?.name || 'جميع الفروع')}
                </div>
            </div>
        </div>
    `;

    const contentArea = document.querySelector(containerSelector || '.content-area');
    if (!contentArea) return;
    const pageHeader = contentArea.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.insertAdjacentHTML('afterend', filterHTML);
    } else {
        contentArea.insertAdjacentHTML('afterbegin', filterHTML);
    }
}

function applyBranchFilter(branchId) {
    localStorage.setItem('onyx_report_branch_filter', branchId);
    const url = new URL(window.location.href);
    if (branchId === 'all') {
        url.searchParams.delete('branch');
    } else {
        url.searchParams.set('branch', branchId);
    }
    window.location.href = url.toString();
}

function getActiveBranch() {
    const urlParams = new URLSearchParams(window.location.search);
    const branchId = urlParams.get('branch') || localStorage.getItem('onyx_report_branch_filter');
    if (!branchId || branchId === 'all') return null;
    return getCostCenters().find(c => c.id == branchId);
}

// فلترة القيود حسب الفرع (من خلال الوصف)
function filterEntriesByBranch(entries) {
    const branch = getActiveBranch();
    if (!branch) return entries;
    return entries.filter(e => e.description && e.description.includes(branch.name));
}

// فلترة الفواتير حسب الفرع (من خلال branchName)
function filterInvoicesByBranch(invoices) {
    const branch = getActiveBranch();
    if (!branch) return invoices;
    return invoices.filter(i => i.branchName === branch.name || (i.warehouse && i.warehouse.includes(branch.name)));
}

function filterPurchasesByBranch(purchases) {
    const branch = getActiveBranch();
    if (!branch) return purchases;
    return purchases.filter(p => p.branchName === branch.name || (p.warehouse && p.warehouse.includes(branch.name)));
}

function filterItemsByBranch(items) {
    const branch = getActiveBranch();
    if (!branch) return items;
    const warehouses = getWarehouses();
    const branchWh = warehouses.find(w => w.name.includes(branch.name));
    if (!branchWh) return items;
    return items.filter(i => i.warehouseId === branchWh.id);
}
