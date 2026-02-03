 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index f1a117f476595beaba8601b6bb77e23b1ffbacd3..d27cf948c68693416996060d1ffa2d8a701781ea 100644
--- a/app.js
+++ b/app.js
@@ -1,42 +1,49 @@
 // Глобальные переменные и данные приложения
 const STORAGE_KEY = 'myfinance_appData';
 let cloudSaveErrorShown = false;
 
 function getTelegramWebApp() {
     if (typeof window === 'undefined') return null;
     const telegram = window.Telegram;
     if (!telegram || !telegram.WebApp) return null;
     return telegram.WebApp;
 }
 
 function getTelegramCloudStorage() {
     const webApp = getTelegramWebApp();
     if (!webApp) return null;
     return webApp.CloudStorage || webApp.cloudStorage || null;
 }
 
+const INCOME_CATEGORIES = CATEGORY_CONFIG.filter(category =>
+    category.type === 'income' || category.type === 'shared'
+);
+const EXPENSE_CATEGORIES = CATEGORY_CONFIG.filter(category =>
+    category.type === 'expense' || category.type === 'shared'
+);
+
 let appData = {
     currentPeriod: {
         id: "2025_10",
         title: "Октябрь 2025",
         startDate: "2025-10-01",
         endDate: "2025-10-31",
         incomes: [
             {id: 1, name: "Зарплата", amount: 80000, category: "work", date: "2025-10-01"},
             {id: 2, name: "Аванс", amount: 40000, category: "work", date: "2025-10-15"},
             {id: 3, name: "Подработка", amount: 15000, category: "freelance", date: "2025-10-05"}
         ],
         fixedExpenses: [
             {id: 1, category: "housing", name: "Квартира", amount: 25000, icon: "🏠", color: "#FF6B35"},
             {id: 2, category: "food", name: "Продукты", amount: 20000, icon: "🛒", color: "#4ECDC4"},
             {id: 3, category: "transport", name: "Транспорт", amount: 8000, icon: "🚗", color: "#45B7D1"},
             {id: 4, category: "utilities", name: "Интернет", amount: 1500, icon: "📡", color: "#F39C12"}
         ],
         savingsPercentage: 20,
         dailyExpenses: [
             {id: 1, date: "2025-10-01", amount: 1200, description: "Обед в кафе, кофе", category: "food", predicted: false},
             {id: 2, date: "2025-10-01", amount: 300, description: "Автобус", category: "transport", predicted: false},
             {id: 3, date: "2025-10-02", amount: 2500, description: "Продукты в супермаркете", category: "food", predicted: false},
             {id: 4, date: "2025-10-02", amount: 800, description: "Такси", category: "transport", predicted: false},
             {id: 5, date: "2025-10-03", amount: 600, description: "Завтрак", category: "food", predicted: false},
             {id: 6, date: "2025-10-03", amount: 1500, description: "Одежда", category: "shopping", predicted: false}
@@ -55,106 +62,97 @@ let appData = {
             },
             dailySpending: {
                 "2025-09-01": 1100, "2025-09-02": 2200, "2025-09-03": 800,
                 "2025-09-04": 1500, "2025-09-05": 3200, "2025-09-06": 900,
                 "2025-09-07": 1300, "2025-09-08": 1800, "2025-09-09": 2100,
                 "2025-09-10": 1600, "2025-09-11": 2500, "2025-09-12": 1200,
                 "2025-09-13": 1400, "2025-09-14": 1900, "2025-09-15": 4500,
                 "2025-09-16": 1100, "2025-09-17": 1700, "2025-09-18": 2000,
                 "2025-09-19": 1300, "2025-09-20": 2800, "2025-09-21": 1500,
                 "2025-09-22": 1600, "2025-09-23": 2200, "2025-09-24": 1800,
                 "2025-09-25": 2400, "2025-09-26": 1900, "2025-09-27": 1700,
                 "2025-09-28": 2100, "2025-09-29": 1500, "2025-09-30": 1800
             }
         },
         {
             id: "2025_08",
             title: "Август 2025",
             totalIncome: 120000,
             totalExpenses: 48000,
             categorySpending: {
                 food: 16800, transport: 7500, entertainment: 8200,
                 shopping: 6500, housing: 25000, utilities: 3200, other: 2000
             }
         }
     ],
-    categories: [
-        {id: "food", name: "Еда", icon: "🍽️", color: "#FF6B35", keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин"]},
-        {id: "transport", name: "Транспорт", icon: "🚗", color: "#4ECDC4", keywords: ["такси", "автобус", "метро", "бензин", "парковка"]},
-        {id: "entertainment", name: "Развлечения", icon: "🎬", color: "#45B7D1", keywords: ["кино", "концерт", "игры", "развлечения"]},
-        {id: "shopping", name: "Покупки", icon: "🛍️", color: "#F39C12", keywords: ["одежда", "обувь", "техника", "покупки"]},
-        {id: "housing", name: "Жилье", icon: "🏠", color: "#E74C3C", keywords: ["квартира", "аренда", "коммунальные"]},
-        {id: "utilities", name: "Коммунальные", icon: "📡", color: "#9B59B6", keywords: ["интернет", "телефон", "электричество"]},
-        {id: "health", name: "Здоровье", icon: "⚕️", color: "#27AE60", keywords: ["врач", "лекарства", "аптека"]},
-        {id: "other", name: "Прочее", icon: "📋", color: "#95A5A6", keywords: []}
-    ],
+    categories: EXPENSE_CATEGORIES,
     predictions: {
         endOfMonthSpending: 58000,
         confidenceLevel: 0.85,
         recommendedDailyBudget: 1650,
         trendDirection: "increasing",
         anomalies: [
             {date: "2025-10-03", amount: 1500, reason: "Unusually high shopping expense"}
         ]
     },
     patterns: {
         weekdayVsWeekend: {weekday: 1200, weekend: 1800},
         regularExpenses: [
             {description: "Утренний кофе", amount: 200, frequency: "daily"},
             {description: "Продукты", amount: 2500, frequency: "weekly"}
         ],
         seasonalTrends: {
             highest_month: "декабрь",
             lowest_month: "февраль"
         }
     }
 };
 
 async function loadAppDataFromStorage() {
     const loadedFromCloud = await loadAppDataFromCloudStorage();
     if (loadedFromCloud) {
         saveAppDataToLocalStorage();
         return;
     }
     loadAppDataFromLocalStorage();
 }
 
 function mergeAppData(savedData) {
     if (!savedData || typeof savedData !== 'object') return;
 
     appData = {
         ...appData,
         ...savedData,
         currentPeriod: {
             ...appData.currentPeriod,
             ...(savedData.currentPeriod || {}),
             incomes: savedData.currentPeriod?.incomes || appData.currentPeriod.incomes,
             fixedExpenses: savedData.currentPeriod?.fixedExpenses || appData.currentPeriod.fixedExpenses,
             dailyExpenses: savedData.currentPeriod?.dailyExpenses || appData.currentPeriod.dailyExpenses
         },
         historicalData: savedData.historicalData || appData.historicalData,
-        categories: savedData.categories || appData.categories,
+        categories: appData.categories,
         predictions: savedData.predictions || appData.predictions,
         patterns: savedData.patterns || appData.patterns
     };
 }
 
 async function loadAppDataFromCloudStorage() {
     const cloudStorage = getTelegramCloudStorage();
     if (!cloudStorage || typeof cloudStorage.getItem !== 'function') {
         return false;
     }
 
     try {
         const storedValue = await new Promise((resolve, reject) => {
             cloudStorage.getItem(STORAGE_KEY, (error, value) => {
                 if (error) {
                     reject(error);
                 } else {
                     resolve(value);
                 }
             });
         });
 
         if (!storedValue) {
             return false;
         }
@@ -257,114 +255,138 @@ function initializeTabs() {
 
     tabButtons.forEach(button => {
         button.addEventListener('click', () => {
             const tabId = button.dataset.tab;
             
             // Убираем активные классы
             tabButtons.forEach(btn => btn.classList.remove('active'));
             tabContents.forEach(content => content.classList.remove('active'));
             
             // Активируем нужные элементы
             button.classList.add('active');
             document.getElementById(tabId).classList.add('active');
             
             // Специальные действия для вкладок
             if (tabId === 'analytics') {
                 setTimeout(() => {
                     updateCharts();
                 }, 100);
             }
         });
     });
 }
 
 // Загрузка начальных данных
 function loadInitialData() {
+    renderCategoryOptions();
     renderIncomes();
     renderFixedExpenses();
     renderDailyExpenses();
     renderArchive();
 
     // Устанавливаем значения форм
     document.getElementById('startDate').value = appData.currentPeriod.startDate;
     document.getElementById('endDate').value = appData.currentPeriod.endDate;
 
     const savingsSelect = document.getElementById('savingsPercentage');
     const savingsValue = String(appData.currentPeriod.savingsPercentage);
     if (savingsSelect) {
         const hasValue = Array.from(savingsSelect.options).some(option => option.value === savingsValue);
         if (!hasValue) {
             const customOption = document.createElement('option');
             customOption.value = savingsValue;
             customOption.textContent = `${appData.currentPeriod.savingsPercentage}% от дохода`;
             savingsSelect.appendChild(customOption);
         }
         savingsSelect.value = savingsValue;
     }
 }
 
+function renderCategoryOptions() {
+    const incomeSelect = document.getElementById('incomeCategory');
+    if (incomeSelect) {
+        incomeSelect.innerHTML = INCOME_CATEGORIES.map(category => `
+            <option value="${category.id}">${category.icon} ${category.name}</option>
+        `).join('');
+    }
+
+    const expenseOptions = EXPENSE_CATEGORIES.map(category => `
+        <option value="${category.id}">${category.icon} ${category.name}</option>
+    `).join('');
+
+    const dailySelect = document.getElementById('dailyCategory');
+    if (dailySelect) {
+        dailySelect.innerHTML = expenseOptions;
+    }
+
+    const editSelect = document.getElementById('editCategory');
+    if (editSelect) {
+        editSelect.innerHTML = expenseOptions;
+    }
+}
+
 // Обновление всех расчетов
 function updateAllCalculations() {
     const totalIncome = appData.currentPeriod.incomes.reduce((sum, income) => sum + income.amount, 0);
     const totalFixed = appData.currentPeriod.fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
     const totalSavings = totalIncome * appData.currentPeriod.savingsPercentage / 100;
     const totalDailyExpenses = appData.currentPeriod.dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
     const totalSpent = totalFixed + totalDailyExpenses;
     const remainingBudget = totalIncome - totalSpent - totalSavings;
     
     // Вычисляем дневной бюджет
     const startDate = new Date(appData.currentPeriod.startDate);
     const endDate = new Date(appData.currentPeriod.endDate);
     const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
-    const dailyBudget = remainingBudget / totalDays;
+    const dailyBudget = totalDays > 0 ? (remainingBudget / totalDays) : 0;
     
     // Траты сегодня
     const today = new Date().toISOString().split('T')[0];
     const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
     const todaySpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
     const todayRemaining = dailyBudget - todaySpent;
-    const todayProgress = Math.min((todaySpent / dailyBudget) * 100, 100);
+    const todayProgress = dailyBudget > 0 ? Math.min((todaySpent / dailyBudget) * 100, 100) : 0;
     
     // Обновляем UI
     updateElement('totalIncome', formatCurrency(totalIncome));
     updateElement('totalSpent', formatCurrency(totalSpent));
     updateElement('totalSavings', formatCurrency(totalSavings));
     updateElement('remainingBudget', formatCurrency(remainingBudget));
     updateElement('dailyBudget', formatCurrency(dailyBudget));
     updateElement('todaySpent', formatCurrency(todaySpent));
     updateElement('todayRemaining', formatCurrency(todayRemaining));
     
     // Обновляем прогресс бары
     const todayProgressBar = document.getElementById('todayProgress');
     if (todayProgressBar) {
         todayProgressBar.style.width = `${todayProgress}%`;
         todayProgressBar.className = `progress-fill ${todayProgress > 100 ? 'error' : todayProgress > 80 ? 'warning' : 'primary'}`;
     }
     
     // Обновляем прогресс сбережений
     const currentSavings = totalIncome * 0.65 * appData.currentPeriod.savingsPercentage / 100; // Текущие сбережения (65% месяца прошло)
-    const savingsProgress = (currentSavings / totalSavings) * 100;
+    const savingsProgress = totalSavings > 0 ? (currentSavings / totalSavings) * 100 : 0;
     const savingsProgressBar = document.getElementById('savingsProgress');
     if (savingsProgressBar) {
         savingsProgressBar.style.width = `${Math.min(savingsProgress, 100)}%`;
     }
 }
 
 // Управление доходами
 function addIncome() {
     const titleInput = document.getElementById('incomeTitle');
     const amountInput = document.getElementById('incomeAmount');
     const categorySelect = document.getElementById('incomeCategory');
     
     const title = titleInput.value.trim();
     const amount = parseFloat(amountInput.value);
     const category = categorySelect.value;
     
     if (!title || !amount || amount <= 0) {
         showToast('Пожалуйста, заполните название и корректную сумму', 'error');
         return;
     }
     
     const newIncome = {
         id: Date.now(),
         name: title,
         amount: amount,
@@ -563,51 +585,51 @@ function renderDailyExpenses() {
                     <strong>${formatDate(new Date(date))}</strong>
                     <span class="day-total">${formatCurrency(dayTotal)}</span>
                 </div>
                 ${expenses.map(expense => `
                     <div class="list-item">
                         <div class="item-info">
                             <div class="item-name">${getCategoryIcon(expense.category)} ${escapeHtml(expense.description)}</div>
                             <div class="item-amount">${formatCurrency(expense.amount)}</div>
                             <div class="item-category">${getCategoryName(expense.category)}</div>
                         </div>
                         <div class="item-actions">
                             <button class="action-btn" onclick="editExpense(${expense.id})">Изменить</button>
                             <button class="action-btn danger" onclick="removeDailyExpense(${expense.id})">Удалить</button>
                         </div>
                     </div>
                 `).join('')}
             </div>
         `;
     }).join('');
 }
 
 // Smart категоризация
 function smartCategorize(description) {
     const desc = description.toLowerCase();
     
-    for (const category of appData.categories) {
+    for (const category of EXPENSE_CATEGORIES) {
         for (const keyword of category.keywords) {
             if (desc.includes(keyword.toLowerCase())) {
                 return category.id;
             }
         }
     }
     
     return 'other';
 }
 
 // Планирование
 function setQuickPeriod(type) {
     const today = new Date();
     let startDate, endDate;
     
     switch(type) {
         case 'current':
             startDate = new Date(today.getFullYear(), today.getMonth(), 1);
             endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
             break;
         case 'next':
             startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
             endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
             break;
         case 'three':
@@ -672,50 +694,54 @@ function updateCalendarHeatmap() {
                  data-amount="${amount}"
                  title="${formatDate(currentDate)}: ${formatCurrency(amount)}"
                  onclick="showDayDetails('${dateStr}')">
                 ${currentDate.getDate()}
             </div>
         `;
     }
     
     container.innerHTML = html;
 }
 
 // Графики и аналитика
 function initializeCharts() {
     initTrendsChart();
     initCategoriesChart();
 }
 
 function updateCharts() {
     updateTrendsChart();
     updateCategoriesChart();
 }
 
 function initTrendsChart() {
     const ctx = document.getElementById('trendsChart');
     if (!ctx) return;
+    if (typeof Chart === 'undefined') {
+        showToast('Графики недоступны: Chart.js не загружен.', 'warning');
+        return;
+    }
     
     // Подготавливаем данные для трендов
     const currentMonthData = [];
     const previousMonthData = [];
     const labels = [];
     
     // Данные текущего месяца
     for (let i = 1; i <= 31; i++) {
         const dateStr = `2025-10-${i.toString().padStart(2, '0')}`;
         const dayExpenses = appData.currentPeriod.dailyExpenses
             .filter(exp => exp.date === dateStr)
             .reduce((sum, exp) => sum + exp.amount, 0);
         
         currentMonthData.push(dayExpenses);
         labels.push(i);
     }
     
     // Данные предыдущего месяца
     const prevMonth = appData.historicalData[0]?.dailySpending || {};
     for (let i = 1; i <= 30; i++) {
         const dateStr = `2025-09-${i.toString().padStart(2, '0')}`;
         previousMonthData.push(prevMonth[dateStr] || 0);
     }
     
     window.trendsChart = new Chart(ctx, {
@@ -748,50 +774,54 @@ function initTrendsChart() {
                 title: {
                     display: true,
                     text: 'Сравнение трендов расходов'
                 },
                 legend: {
                     position: 'top'
                 }
             },
             scales: {
                 y: {
                     beginAtZero: true,
                     ticks: {
                         callback: function(value) {
                             return formatCurrency(value);
                         }
                     }
                 }
             }
         }
     });
 }
 
 function initCategoriesChart() {
     const ctx = document.getElementById('categoriesChart');
     if (!ctx) return;
+    if (typeof Chart === 'undefined') {
+        showToast('Графики недоступны: Chart.js не загружен.', 'warning');
+        return;
+    }
     
     // Подготавливаем данные по категориям
     const categoryTotals = {};
     appData.currentPeriod.dailyExpenses.forEach(expense => {
         if (!categoryTotals[expense.category]) categoryTotals[expense.category] = 0;
         categoryTotals[expense.category] += expense.amount;
     });
     
     // Добавляем обязательные расходы
     appData.currentPeriod.fixedExpenses.forEach(expense => {
         const category = expense.category || 'other';
         if (!categoryTotals[category]) categoryTotals[category] = 0;
         categoryTotals[category] += expense.amount;
     });
     
     const labels = [];
     const data = [];
     const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];
     
     Object.entries(categoryTotals).forEach(([category, amount]) => {
         labels.push(getCategoryName(category));
         data.push(amount);
     });
     
     window.categoriesChart = new Chart(ctx, {
@@ -956,56 +986,56 @@ function formatCurrency(amount) {
         minimumFractionDigits: 0,
         maximumFractionDigits: 0
     }).format(amount || 0);
 }
 
 function formatDate(date) {
     return new Intl.DateTimeFormat('ru-RU', {
         day: 'numeric',
         month: 'short',
         weekday: 'short'
     }).format(date);
 }
 
 function escapeHtml(text) {
     const map = {
         '&': '&amp;',
         '<': '&lt;',
         '>': '&gt;',
         '"': '&quot;',
         "'": '&#039;'
     };
     return text.replace(/[&<>"']/g, function(m) { return map[m]; });
 }
 
 function getCategoryName(categoryId) {
-    const category = appData.categories.find(cat => cat.id === categoryId);
+    const category = CATEGORY_CONFIG.find(cat => cat.id === categoryId);
     return category ? category.name : 'Прочее';
 }
 
 function getCategoryIcon(categoryId) {
-    const category = appData.categories.find(cat => cat.id === categoryId);
+    const category = CATEGORY_CONFIG.find(cat => cat.id === categoryId);
     return category ? category.icon : '📋';
 }
 
 function getRandomIcon() {
     const icons = ['💰', '🏠', '🛒', '🚗', '📱', '⚡', '🎯', '📊'];
     return icons[Math.floor(Math.random() * icons.length)];
 }
 
 function getRandomColor() {
     const colors = ['#FF6B35', '#4ECDC4', '#45B7D1', '#F39C12', '#E74C3C', '#9B59B6', '#27AE60', '#95A5A6'];
     return colors[Math.floor(Math.random() * colors.length)];
 }
 
 function showDayDetails(dateStr) {
     const expenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === dateStr);
     const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
     
     const formattedDate = formatDate(new Date(dateStr));
     const message = total > 0 ? 
         `${formattedDate}: ${formatCurrency(total)} (${expenses.length} трат)` : 
         `${formattedDate}: Трат не было`;
     
     showToast(message, 'info');
 }
 
@@ -1049,26 +1079,26 @@ function showToast(message, type = 'success') {
     }, 4000);
 }
 
 // Обработчики событий
 document.addEventListener('change', function(e) {
     if (e.target.id === 'savingsPercentage' || e.target.id === 'startDate' || e.target.id === 'endDate') {
         updateCalculations();
     }
 });
 
 document.addEventListener('keydown', function(e) {
     if (e.key === 'Escape') {
         closeModal();
     }
 });
 
 // Обработка Enter в формах
 document.addEventListener('keypress', function(e) {
     if (e.key === 'Enter') {
         const target = e.target;
         if (target.id === 'incomeAmount') addIncome();
         else if (target.id === 'expenseAmount') addFixedExpense();
         else if (target.id === 'dailyDescription') addDailyExpense();
         else if (target.id === 'editDescription') saveExpenseEdit();
     }
-});
\ No newline at end of file
+});
 
EOF
)
