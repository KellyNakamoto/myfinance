 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index f1a117f476595beaba8601b6bb77e23b1ffbacd3..eda604cd139dd433a7e501438c1025eaf952ce56 100644
--- a/app.js
+++ b/app.js
@@ -293,78 +293,78 @@ function loadInitialData() {
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
@@ -672,50 +672,54 @@ function updateCalendarHeatmap() {
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
@@ -748,50 +752,54 @@ function initTrendsChart() {
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
@@ -1049,26 +1057,26 @@ function showToast(message, type = 'success') {
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
