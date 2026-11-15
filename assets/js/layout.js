
    // 🔒 فحص ترخيص النظام (License Guard)
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('login.html') || currentPath.includes('activate.html');
    
    if (!isPublicPage && localStorage.getItem('onyx_license_valid') !== 'true') {
        window.location.href = '/pages/activate.html';
    }


// إضافة شاشة تحميل عند فتح النظام
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) return;
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f8fafc; z-index: 999999; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Noto Naskh Arabic', sans-serif;">
            <div style="width: 60px; height: 60px; border: 5px solid #e2e8f0; border-top: 5px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h2 style="margin-top: 20px; color: #0f172a; font-weight: bold; font-size: 20px;">جاري تحميل البيانات من السحابة...</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 10px;">قد يستغرق هذا الأمر بضع ثوانٍ إذا كان الخادم في وضع النوم.</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;
    document.body.appendChild(loader);

    // إخفاء الشاشة بعد 3 ثوانٍ كحد أقصى (حتى لو تأخر الخادم)
    setTimeout(() => {
        const l = document.getElementById('global-loader');
        if (l) l.style.display = 'none';
    }, 4000);
});


document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        fetch('/components/sidebar.html?v=' + new Date().getTime())
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                if(typeof initSidebar === 'function') { initSidebar(); }
                
                // ===== تفعيل الرابط النشط =====
                const currentPath = window.location.pathname;
                document.querySelectorAll('.sidebar-nav a').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href !== 'javascript:void(0)' && href !== '#') {
                        const cleanHref = href.startsWith('/') ? href : '/' + href;
                        if (currentPath === cleanHref || currentPath.endsWith(cleanHref)) {
                            link.classList.add('active');
                            const parentLi = link.closest('.has-submenu');
                            if (parentLi) {
                                parentLi.classList.add('active');
                                const submenu = parentLi.querySelector('.submenu');
                                if(submenu) submenu.style.display = 'block';
                            }
                        }
                    }
                });

                // ===== إضافة ميزة حفظ واستعادة موضع التمرير للقائمة الجانبية =====
                const sidebarNav = document.querySelector('.sidebar-nav');
                if (sidebarNav) {
                    // استعادة الموضع المحفوظ
                    const savedScroll = sessionStorage.getItem('sidebarScrollPos');
                    if (savedScroll) {
                        sidebarNav.scrollTop = parseInt(savedScroll);
                    }
                    
                    // حفظ الموضع عند كل تمرير
                    sidebarNav.addEventListener('scroll', () => {
                        sessionStorage.setItem('sidebarScrollPos', sidebarNav.scrollTop);
                    });
                }

                document.dispatchEvent(new Event('sidebarLoaded'));
            })
            .catch(error => console.error('خطأ في تحميل القائمة:', error));
    } else {
        document.dispatchEvent(new Event('sidebarLoaded'));
    }
});
