document.addEventListener('DOMContentLoaded', () => {
    renderAccounts();
});

// دالة عرض الحسابات في الجدول
function renderAccounts(filteredData = null) {
    const tbody = document.getElementById('accounts-body');
    tbody.innerHTML = ''; 

    const accounts = filteredData || getAccounts();

    accounts.forEach(acc => {
        const tr = document.createElement('tr');
        
        if (acc.level === 1) tr.classList.add('main-account-row');
        if (acc.level === 2) tr.classList.add('sub-account-row');

        let paddingStyle = '';
        if (acc.level === 2) paddingStyle = 'style="padding-right: 30px;"';
        if (acc.level === 3) paddingStyle = 'style="padding-right: 60px;"';

        let typeBadge = `<span class="badge badge-${acc.type}">${acc.type}</span>`;

        tr.innerHTML = `
            <td class="acc-code-cell">${acc.code}</td>
            <td ${paddingStyle}>
                ${acc.level === 1 ? '📁 ' : (acc.level === 2 ? '📂 ' : '📄 ')} 
                ${acc.name}
            </td>
            <td>${typeBadge}</td>
            <td>0.00</td>
            <td>
                <button class="btn-icon" title="تعديل">✏️</button>
                <button class="btn-icon" title="حذف">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// دالة البحث والتصفية
function filterAccounts() {
    const searchTerm = document.getElementById('search-account').value.toLowerCase();
    const accounts = getAccounts();
    const filtered = accounts.filter(acc => 
        acc.name.toLowerCase().includes(searchTerm) || 
        acc.code.includes(searchTerm)
    );
    renderAccounts(filtered);
}

// ==========================================
// دوال النافذة المنبثقة (Modal)
// ==========================================
function openAccountModal() {
    const modal = document.getElementById('account-modal');
    modal.style.display = 'flex';

    // تعبئة قائمة الحساب الأب
    const parentSelect = document.getElementById('new-acc-parent');
    parentSelect.innerHTML = '<option value="">-- حساب رئيسي (بدون أب) --</option>';
    
    const accounts = getAccounts();
    // عرض الحسابات التي يمكن أن تكون أباً (المستوى 1 و 2)
    accounts.filter(acc => acc.level < 3).forEach(acc => {
        parentSelect.innerHTML += `<option value="${acc.id}">${acc.code} - ${acc.name}</option>`;
    });
}

function closeAccountModal() {
    document.getElementById('account-modal').style.display = 'none';
    document.getElementById('add-account-form').reset();
}

// دالة حفظ الحساب الجديد
function saveNewAccount(event) {
    event.preventDefault(); // منع تحديث الصفحة

    const code = document.getElementById('new-acc-code').value.trim();
    const name = document.getElementById('new-acc-name').value.trim();
    const type = document.getElementById('new-acc-type').value;
    const parentId = document.getElementById('new-acc-parent').value;

    let accounts = getAccounts();

    // التحقق من عدم تكرار رقم الحساب
    if (accounts.some(acc => acc.code === code)) {
        alert('عذراً، رقم الحساب هذا موجود بالفعل!');
        return;
    }

    let level = 1;
    let parent = null;

    if (parentId) {
        parent = parseInt(parentId);
        const parentAcc = accounts.find(acc => acc.id === parent);
        level = parentAcc.level + 1;
    }

    // إنشاء كائن الحساب الجديد
    const newAccount = {
        id: Date.now(), // معرف فريد بناءً على الوقت
        code: code,
        name: name,
        type: type,
        parent: parent,
        level: level
    };

    accounts.push(newAccount);
    saveAccounts(accounts); // حفظ في المتصفح

    closeAccountModal();
    renderAccounts(); // إعادة رسم الجدول
    alert('تم إضافة الحساب بنجاح!');
}
