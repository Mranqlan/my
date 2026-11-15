
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
