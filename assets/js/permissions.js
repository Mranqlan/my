
function getCurrentUser() {
    let user = localStorage.getItem('onyx_current_user');
    if (!user) return { fullName: "OMRAN AQLAN", role: "admin", username: "admin" };
    return JSON.parse(user);
}

function getRoleName(role) {
    const names = { 'admin': 'مدير النظام', 'gm': 'المدير العام', 'finance_mgr': 'المدير المالي', 'accountant': 'محاسب', 'sales_mgr': 'مدير مبيعات', 'sales_rep': 'مندوب مبيعات', 'purchasing_mgr': 'مدير مشتريات', 'storekeeper': 'أمين مخزن', 'hr_mgr': 'مدير موارد بشرية', 'worker': 'عامل / فني' };
    return names[role] || role;
}

const rolePermissions = {
    'admin': ['*'],
    'gm': ['/', 'index.html', 'reports', 'executive-dashboard.html', 'chart-of-accounts', 'budgets.html', 'financial-analysis.html', 'branch-analysis.html', 'cost-centers', 'journal-entries', 'vouchers', 'sales-invoices', 'sales-returns', 'purchase-invoices', 'purchase-returns', 'inventory.html', 'fixed-assets', 'employees', 'payroll', 'cheques', 'bank-reconciliation', 'vat-return', 'income-statement', 'balance-sheet', 'cash-flow'],
    'finance_mgr': ['/', 'index.html', 'reports', 'executive-dashboard.html', 'budgets.html', 'financial-analysis.html', 'branch-analysis.html', 'chart-of-accounts', 'cost-centers', 'journal-entries', 'vouchers', 'payroll', 'fixed-assets', 'cheques', 'bank-reconciliation', 'vat-return', 'income-statement', 'balance-sheet', 'cash-flow'],
    'accountant': ['index.html', 'chart-of-accounts', 'journal-entries', 'vouchers', 'sales-invoices', 'sales-returns', 'purchase-invoices', 'purchase-returns', 'inventory.html', 'adjustments', 'fixed-assets', 'cheques', 'bank-reconciliation', 'vat-return', 'income-statement', 'balance-sheet', 'cash-flow'],
    'sales_mgr': ['/', 'index.html', 'sales-orders', 'sales-invoices', 'sales-returns', 'customer-statement', 'aging-report'],
    'sales_rep': ['sales-orders', 'sales-invoices', 'sales-returns', 'customer-statement', 'aging-report'],
    'purchasing_mgr': ['purchase-invoices', 'purchase-returns', 'supplier-aging'],
    'storekeeper': ['inventory.html', 'warehouses', 'adjustments'],
    'hr_mgr': ['employees', 'payroll'],
    'worker': ['inventory.html']
};

function hasAccess(path, role) {
    if (role === 'admin') return true;
    const allowed = rolePermissions[role] || [];
    if (path === '/' || path.endsWith('index.html')) return true; 
    return allowed.some(keyword => path.includes(keyword));
}

function checkPageAccess() {
    if (!localStorage.getItem('onyx_current_user') && !window.location.pathname.includes('login.html')) {
        window.location.href = '/login.html';
        return;
    }
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    if (currentPath.includes('settings-users.html') && currentUser.role !== 'admin') {
        alert(`⚠️ عذرا لا تملك الصلاحية.`);
        window.location.href = '/index.html';
    }
}

function applySidebarPermissions() {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'admin') return;

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') return;
        if (!hasAccess(href, currentUser.role)) {
            const li = link.closest('li');
            if (li) li.style.display = 'none';
        }
    });
    document.querySelectorAll('.has-submenu').forEach(li => {
        const submenu = li.querySelector('.submenu');
        if (submenu) {
            const visibleItems = Array.from(submenu.querySelectorAll('li')).filter(item => item.style.display !== 'none');
            if (visibleItems.length === 0) li.style.display = 'none';
        }
    });
}

function updateHeaderProfile() {
    const currentUser = getCurrentUser();
    const profileSpan = document.querySelector('.user-profile span');
    if (profileSpan) profileSpan.textContent = `${currentUser.fullName} (${getRoleName(currentUser.role)})`;
    
    // إصلاح الصورة الرمزية لتكون ديناميكية
    const avatarDiv = document.querySelector('.user-profile .avatar');
    if (avatarDiv) {
        let initial = 'U';
        if (currentUser.fullName && currentUser.fullName.trim().length > 0) {
            initial = currentUser.fullName.trim().charAt(0).toUpperCase();
        }
        avatarDiv.textContent = initial;
    }
}

function logoutSystem() {
    if(confirm('هل أنت متأكد من تسجيل الخروج')) {
        localStorage.removeItem('onyx_current_user');
        window.location.href = '/login.html';
    }
}

function injectLogoutButton() {
    const userProfile = document.querySelector('.user-profile');
    if (userProfile && !document.getElementById('logout-btn')) {
        const btn = document.createElement('button');
        btn.id = 'logout-btn';
        btn.textContent = '🚪 تسجيل خروج';
        btn.style.cssText = 'background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-right: 15px; font-family: inherit; font-size: 13px;';
        btn.onclick = logoutSystem;
        userProfile.insertBefore(btn, userProfile.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', () => { checkPageAccess(); });
document.addEventListener('sidebarLoaded', () => {
    applySidebarPermissions();
    updateHeaderProfile();
    injectLogoutButton();
});
