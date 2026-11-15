document.addEventListener('DOMContentLoaded', () => {
    const settings = getSettings() || { companyName: "AL SHAMEL ACCOUNTING", companyTagline: "Integrated Accounting Systems", logoText: "S" };

    // 1. تحديث اسم الشركة في القائمة الجانبية
    const sidebarTitle = document.querySelector('.sidebar-header h2');
    if (sidebarTitle) sidebarTitle.textContent = settings.companyName;
    
    const logoBox = document.querySelector('.logo-box');
    if (logoBox) logoBox.textContent = settings.logoText;

    // 2. تحديث اسم الشركة في جميع المطبوعات (الفواتير السندات التقارير)
    document.querySelectorAll('.dynamic-company-name').forEach(el => {
        el.textContent = settings.companyName;
    });

    // 3. تحديث الشعار النصي (الوصف)
    document.querySelectorAll('.dynamic-tagline').forEach(el => {
        el.textContent = settings.companyTagline;
    });
});
