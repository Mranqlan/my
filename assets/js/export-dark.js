// ==========================================
// التصدير (Export) - ONYX PRO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    injectExportButtons();
});

function injectExportButtons() {
    const tableContainers = document.querySelectorAll('.table-container');
    
    tableContainers.forEach((container, index) => {
        if (container.querySelector('.export-buttons')) return;
        
        const table = container.querySelector('table');
        if (!table) return;

        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'export-buttons';
        btnWrapper.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 15px;';

        const excelBtn = document.createElement('button');
        excelBtn.innerHTML = '📊 تصدير Excel';
        excelBtn.style.cssText = 'background: #10b981; color: white; padding: 8px 15px; font-size: 13px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;';
        excelBtn.onclick = () => exportTableToExcel(table, `ONYX-Export-${index + 1}`);
        
        const pdfBtn = document.createElement('button');
        pdfBtn.innerHTML = '📄 تصدير PDF';
        pdfBtn.style.cssText = 'background: #ef4444; color: white; padding: 8px 15px; font-size: 13px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;';
        pdfBtn.onclick = () => window.print();

        btnWrapper.appendChild(excelBtn);
        btnWrapper.appendChild(pdfBtn);
        
        container.insertBefore(btnWrapper, container.firstChild);
    });
}

function exportTableToExcel(table, filename) {
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        let cols = row.querySelectorAll('td, th');
        let rowData = [];
        cols.forEach(col => {
            let text = col.innerText.trim().replace(/"/g, '""');
            rowData.push(`"${text}"`);
        });
        if (rowData.length > 0) csv.push(rowData.join(','));
    });

    const csvString = '\uFEFF' + csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
