document.addEventListener('DOMContentLoaded', () => {
    renderEntries();
});

function renderEntries() {
    const tbody = document.getElementById('review-body');
    if (!tbody) return;

    const entries = getEntries();

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">لا توجد قيود محاسبية مسجلة حتى الآن.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    
    // ترتيب القيود من الأحدث للأقدم
    entries.sort((a, b) => b.id - a.id).forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: bold; color: var(--primary-color);">${entry.entryNumber}</td>
            <td>${entry.date}</td>
            <td style="text-align: right;">${entry.description || 'بدون بيان'}</td>
            <td class="text-debit">${entry.totalDebit.toFixed(2)}</td>
            <td class="text-credit">${entry.totalCredit.toFixed(2)}</td>
            <td>
                <button class="btn-delete" onclick="deleteEntry(${entry.id})">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteEntry(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القيد نهائياً؟ سيؤثر ذلك على جميع التقارير.')) {
        return;
    }

    let entries = getEntries();
    entries = entries.filter(entry => entry.id !== id);
    saveEntries(entries);
    
    // محاولة تسجيل الحذف في سجل التدقيق (إذا كان موجوداً)
    if (typeof saveAuditLog === 'function') {
        saveAuditLog("حذف قيد محاسبي", "تم حذف القيد برقم المعرف " + id);
    }

    renderEntries();
}
