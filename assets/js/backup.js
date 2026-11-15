// دالة تصدير البيانات
function exportData() {
    const data = {
        accounts: getAccounts(),
        entries: getEntries()
    };

    // تحويل البيانات إلى نص JSON
    const jsonString = JSON.stringify(data, null, 2);
    
    // إنشاء ملف للتحميل
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ONYX-Backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('تم تصدير البيانات بنجاح!');
}

// دالة استيراد البيانات
function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('الرجاء اختيار ملف نسخة احتياطية أولاً.');
        return;
    }

    if (!confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم حذف جميع البيانات الحالية واستبدالها.')) {
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            // التحقق من وجود البيانات المطلوبة
            if (!data.accounts || !data.entries) {
                alert('ملف النسخة الاحتياطية غير صالح أو تالف.');
                return;
            }

            // حفظ البيانات في localStorage
            saveAccounts(data.accounts);
            saveEntries(data.entries);

            alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
            window.location.reload();

        } catch (error) {
            alert('حدث خطأ أثناء قراءة الملف. تأكد من أن الملف بصيغة JSON صحيحة.');
            console.error(error);
        }
    };

    reader.readAsText(file);
}
