"use strict";

const translations = {
  ar: {
    mainMenu: "القائمة الرئيسية", dashboard: "الرئيسية", sales: "المبيعات",
    purchases: "المشتريات", inventory: "المخزون", accounting: "الحسابات",
    reports: "التقارير", settings: "الإعدادات",
    systemOnline: "النظام يعمل بشكل طبيعي",
    searchPlaceholder: "ابحث عن عملية أو عميل",
    mainBranch: "الفرع الرئيسي", riyadhBranch: "فرع الرياض",
    userName: "محمد أحمد", userRole: "مدير النظام",
    welcome: "مرحبًا، محمد", welcomeSubtitle: "إليك ملخص أداء منشأتك.",
    overview: "نظرة عامة", overviewSubtitle: "مؤشرات الأداء الرئيسية",
    lastSixMonths: "آخر 6 أشهر", thisMonth: "هذا الشهر",
    totalSales: "إجمالي المبيعات", totalPurchases: "إجمالي المشتريات",
    receivables: "المبالغ المستحقة", productsInStock: "المنتجات في المخزون",
    vsPrevious: "مقارنة بالفترة السابقة", activeProducts: "منتج نشط",
    incomeExpenses: "الإيرادات والمصروفات",
    performanceByMonth: "الأداء خلال الأشهر الماضية",
    exportChart: "تصدير الرسم", alerts: "التنبيهات",
    needsAttention: "أمور تحتاج إلى متابعة",
    overdueInvoices: "فواتير مستحقة",
    overdueDetails: "هناك 5 فواتير تحتاج إلى متابعة",
    lowStock: "مخزون منخفض",
    lowStockDetails: "3 منتجات وصلت إلى حد إعادة الطلب",
    approvalRequired: "موافقة مطلوبة",
    purchaseWaiting: "طلب شراء بانتظار المراجعة",
    review: "مراجعة", recentTransactions: "أحدث المعاملات",
    recentTransactionsSubtitle: "آخر العمليات المسجلة في النظام",
    viewAll: "عرض الكل", transactionId: "رقم العملية",
    customerSupplier: "العميل / المورد", date: "التاريخ",
    amount: "المبلغ", status: "الحالة", actions: "الإجراءات",
    loading: "جارٍ تحميل البيانات...", prototype: "نموذج أولي",
    revenue: "الإيرادات", expenses: "المصروفات",
    paid: "مدفوعة", pending: "معلّقة", reviewStatus: "قيد المراجعة",
    noResults: "لا توجد معاملات مطابقة", loadError: "تعذر تحميل البيانات. تحقق من الاتصال بالخادم.",
    newInvoice: "تم اختيار إنشاء فاتورة جديدة",
    newReceipt: "تم اختيار إنشاء سند قبض",
    overdue: "عرض الفواتير المستحقة",
    lowStockToast: "عرض المنتجات منخفضة المخزون",
    reviewToast: "فتح طلب الشراء للمراجعة",
    viewAllToast: "عرض جميع المعاملات",
    options: "خيارات المعاملة", today: "اليوم"
  },
  en: {
    mainMenu: "MAIN MENU", dashboard: "Dashboard", sales: "Sales",
    purchases: "Purchases", inventory: "Inventory", accounting: "Accounting",
    reports: "Reports", settings: "Settings",
    systemOnline: "All systems operational",
    searchPlaceholder: "Search transactions or customers",
    mainBranch: "Main branch", riyadhBranch: "Riyadh branch",
    userName: "Mohammed Ahmed", userRole: "System administrator",
    welcome: "Welcome, Mohammed", welcomeSubtitle: "Here is your business summary.",
    overview: "Overview", overviewSubtitle: "Key performance indicators",
    lastSixMonths: "Last 6 months", thisMonth: "This month",
    totalSales: "Total sales", totalPurchases: "Total purchases",
    receivables: "Receivables", productsInStock: "Products in stock",
    vsPrevious: "vs previous period", activeProducts: "active products",
    incomeExpenses: "Income and expenses",
    performanceByMonth: "Performance over recent months",
    exportChart: "Export chart", alerts: "Alerts",
    needsAttention: "Items that need attention",
    overdueInvoices: "Overdue invoices",
    overdueDetails: "5 invoices need follow-up",
    lowStock: "Low stock",
    lowStockDetails: "3 products reached their reorder point",
    approvalRequired: "Approval required",
    purchaseWaiting: "A purchase order is awaiting review",
    review: "Review", recentTransactions: "Recent transactions",
    recentTransactionsSubtitle: "Latest operations recorded in the system",
    viewAll: "View all", transactionId: "Transaction ID",
    customerSupplier: "Customer / Supplier", date: "Date",
    amount: "Amount", status: "Status", actions: "Actions",
    loading: "Loading data...", prototype: "Prototype",
    revenue: "Revenue", expenses: "Expenses",
    paid: "Paid", pending: "Pending", reviewStatus: "In review",
    noResults: "No matching transactions", loadError: "Could not load data. Check the server connection.",
    newInvoice: "New invoice selected",
    newReceipt: "New receipt selected",
    overdue: "Opening overdue invoices",
    lowStockToast: "Opening low-stock products",
    reviewToast: "Opening purchase order for review",
    viewAllToast: "Opening all transactions",
    options: "Transaction options", today: "Today"
  }
};

const statusKeys = {
  paid: "paid",
  pending: "pending",
  review: "reviewStatus"
};

const toastKeys = {
  newInvoice: "newInvoice",
  newReceipt: "newReceipt",
  overdue: "overdue",
  lowStock: "lowStockToast",
  review: "reviewToast",
  viewAll: "viewAllToast"
};

let currentLanguage = localStorage.getItem("onyx-language") || "ar";
let dashboardData = null;
let chart = null;

const $ = (selector, root = document) => root.querySelector(selector);

function translate(key) {
  return translations[currentLanguage][key] || key;
}

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("onyx-language", language);

  const isArabic = language === "ar";
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  $("#languageToggle span").textContent = isArabic ? "EN" : "AR";
  $("#languageToggle").setAttribute(
    "aria-label",
    isArabic ? "Change language" : "تغيير اللغة"
  );

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });

  updateDate();
  renderTransactions();
  updateChartLanguage();
}

function updateDate() {
  const locale = currentLanguage === "ar" ? "ar-SA" : "en-US";
  $("#todayLabel").textContent = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date());
}

function formatCurrency(halalas) {
  const locale = currentLanguage === "ar" ? "ar-SA" : "en-SA";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2
  }).format(halalas / 100);
}

function formatNumber(value) {
  const locale = currentLanguage === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(locale).format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  const locale = currentLanguage === "ar" ? "ar-SA" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function showToast(message, type = "success") {
  const container = $("#toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;
  container.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function renderStats(stats) {
  $("#sales").textContent = formatCurrency(stats.sales);
  $("#purchases").textContent = formatCurrency(stats.purchases);
  $("#receivables").textContent = formatCurrency(stats.receivables);
  $("#products").textContent = formatNumber(stats.products);
}

function renderTransactions(searchTerm = "") {
  const tbody = $("#transactionsBody");
  tbody.replaceChildren();

  if (!dashboardData) return;

  const term = searchTerm.trim().toLocaleLowerCase();
  const transactions = dashboardData.transactions.filter((item) => {
    const searchable = `${item.id} ${item.customer}`.toLocaleLowerCase();
    return searchable.includes(term);
  });

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-cell";
    cell.textContent = translate("noResults");
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  transactions.forEach((item) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    const idStrong = document.createElement("strong");
    idStrong.textContent = item.id;
    idCell.appendChild(idStrong);

    const customerCell = document.createElement("td");
    customerCell.textContent = item.customer;

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(item.date);

    const amountCell = document.createElement("td");
    amountCell.textContent = formatCurrency(item.amount);

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `status-pill status-${item.status}`;
    status.textContent = translate(statusKeys[item.status] || "status");
    statusCell.appendChild(status);

    const actionCell = document.createElement("td");
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "row-action";
    actionButton.textContent = "•••";
    actionButton.setAttribute("aria-label", translate("options"));
    actionButton.addEventListener("click", () => {
      showToast(`${translate("options")}: ${item.id}`);
    });
    actionCell.appendChild(actionButton);

    row.append(idCell, customerCell, dateCell, amountCell, statusCell, actionCell);
    tbody.appendChild(row);
  });
}

function createChart(data) {
  if (typeof Chart === "undefined") {
    showToast(translate("loadError"), "error");
    return;
  }

  const context = $("#performanceChart").getContext("2d");
  const labels = data.months.map((month) => month[currentLanguage]);

  chart = new Chart(context, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: translate("revenue"),
          data: data.income,
          borderColor: "#119f8b",
          backgroundColor: "rgba(17, 159, 139, .10)",
          fill: true,
          tension: 0.35,
          pointRadius: 3
        },
        {
          label: translate("expenses"),
          data: data.expenses,
          borderColor: "#6f91d8",
          backgroundColor: "transparent",
          tension: 0.35,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, boxWidth: 7, padding: 18 }
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(130,145,165,.15)" } },
        x: { grid: { display: false } }
      }
    }
  });
}

function updateChartLanguage() {
  if (!chart || !dashboardData) return;

  chart.data.labels = dashboardData.months.map(
    (month) => month[currentLanguage]
  );
  chart.data.datasets[0].label = translate("revenue");
  chart.data.datasets[1].label = translate("expenses");
  chart.update();
}

async function loadDashboard() {
  try {
    const response = await fetch("/api/dashboard", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    dashboardData = await response.json();
    renderStats(dashboardData.stats);
    renderTransactions($("#searchInput").value);
    createChart(dashboardData);
  } catch (error) {
    console.error("Dashboard loading failed:", error);
    $("#transactionsBody").replaceChildren();
    showToast(translate("loadError"), "error");
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("onyx-theme", theme);

  const icon = $("#themeToggle");
  icon.replaceChildren();
  const iconElement = document.createElement("i");
  iconElement.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
  icon.appendChild(iconElement);
  if (window.lucide) window.lucide.createIcons();
}

function init() {
  if (window.lucide) window.lucide.createIcons();

  const savedTheme = localStorage.getItem("onyx-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  applyTheme(savedTheme || preferredTheme);

  setLanguage(currentLanguage);
  loadDashboard();

  $("#languageToggle").addEventListener("click", () => {
    setLanguage(currentLanguage === "ar" ? "en" : "ar");
  });

  $("#themeToggle").addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
  });

  $("#menuToggle").addEventListener("click", (event) => {
    const sidebar = $("#sidebar");
    const isOpen = sidebar.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  });

  $("#searchInput").addEventListener("input", (event) => {
    renderTransactions(event.target.value);
  });

  $("#exportChart").addEventListener("click", () => {
    if (!chart) {
      showToast(translate("loadError"), "error");
      return;
    }

    const link = document.createElement("a");
    link.href = chart.toBase64Image();
    link.download = "onyx-performance.png";
    link.click();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toast]");
    if (!button) return;

    event.preventDefault();
    const key = toastKeys[button.dataset.toast];
    if (key) showToast(translate(key));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      $("#searchInput").focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
