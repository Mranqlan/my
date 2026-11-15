
function initSidebar() {
    const menuItems = document.querySelectorAll('.has-submenu > a');
    menuItems.forEach(item => {
        // استنساخ العنصر لإزالة أي أحداث قديمة
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // منع القفز نهائيا في حال كان الرابط # أو javascript:void(0)
            if (href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') {
                e.preventDefault(); 
                e.stopPropagation();
                
                const parentLi = this.parentElement;
                
                if (!parentLi.classList.contains('active')) {
                    document.querySelectorAll('.has-submenu').forEach(li => {
                        li.classList.remove('active');
                        const submenu = li.querySelector('.submenu');
                        if (submenu) submenu.style.display = 'none';
                    });
                    parentLi.classList.add('active');
                    const currentSubmenu = parentLi.querySelector('.submenu');
                    if (currentSubmenu) currentSubmenu.style.display = 'block';
                } else {
                    parentLi.classList.remove('active');
                    const currentSubmenu = parentLi.querySelector('.submenu');
                    if (currentSubmenu) currentSubmenu.style.display = 'none';
                }
                return false; // تأكيد إضافي لمنع القفز
            }
        });
    });
}
