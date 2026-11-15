document.addEventListener('DOMContentLoaded', () => { generateTrialBalance(); });

function generateTrialBalance() {
    const tbody = document.getElementById('tb-body');
    const accounts = getAccounts();
    const entries = getEntries();
    
    let tbData = [], totD = 0, totC = 0, totBD = 0, totBC = 0;

    accounts.forEach(acc => {
        if (acc.level === 1) return;
        let tDebit = 0, tCredit = 0;

        entries.forEach(entry => {
            entry.lines.forEach(line => {
                if (line.accountCode === acc.code) { tDebit += line.debit; tCredit += line.credit; }
            });
        });

        if (tDebit === 0 && tCredit === 0) return;

        let bDebit = 0, bCredit = 0, net = tDebit - tCredit;
        if (net > 0) bDebit = net; else if (net < 0) bCredit = Math.abs(net);

        totD += tDebit; totC += tCredit; totBD += bDebit; totBC += bCredit;
        tbData.push({ code: acc.code, name: acc.name, tDebit, tCredit, bDebit, bCredit });
    });

    tbody.innerHTML = '';
    tbData.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td class="acc-code-cell">${row.code}</td>
                <td style="text-align: right; padding-right: 20px;">${row.name}</td>
                <td>${row.tDebit > 0 ? row.tDebit.toFixed(2) : '-'}</td>
                <td>${row.tCredit > 0 ? row.tCredit.toFixed(2) : '-'}</td>
                <td class="text-debit">${row.bDebit > 0 ? row.bDebit.toFixed(2) : '-'}</td>
                <td class="text-credit">${row.bCredit > 0 ? row.bCredit.toFixed(2) : '-'}</td>
            </tr>`;
    });

    document.getElementById('tb-total-debit-movement').textContent = totD.toFixed(2);
    document.getElementById('tb-total-credit-movement').textContent = totC.toFixed(2);
    document.getElementById('tb-total-debit-balance').textContent = totBD.toFixed(2);
    document.getElementById('tb-total-credit-balance').textContent = totBC.toFixed(2);
}
