// ==========================================
// TELEGRAM MINI APP INTEGRATION
// ==========================================
let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

document.documentElement.setAttribute('data-theme', tg.colorScheme);

tg.onEvent('themeChanged', function() {
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
});

// ==========================================
// ДАННЫЕ ПО УМОЛЧАНИЮ
// ==========================================
let appData = {
    currentPeriod: {
        id: "2025_10",
        title: "Октябрь 2025",
        startDate: "2025-10-01",
        endDate: "2025-10-31",
        incomes: [],
        fixedExpenses: [],
        savingsPercentage: 20,
        dailyExpenses: []
    },
    historicalData: [],
    categories: [
        {id: "food", name: "Еда", icon: "🍽️", color: "#FF6B35"},
        {id: "transport", name: "Транспорт", icon: "🚗", color: "#4ECDC4"},
        {id: "entertainment", name: "Развлечения", icon: "🎬", color: "#45B7D1"},
        {id: "shopping", name: "Покупки", icon: "🛍️", color: "#F39C12"},
        {id: "housing", name: "Жилье", icon: "🏠", color: "#E74C3C"},
        {id: "utilities", name: "Коммунальные", icon: "📡", color: "#9B59B6"},
        {id: "health", name: "Здоровье", icon: "⚕️", color: "#27AE60"},
        {id: "other", name: "Прочее", icon: "📋", color: "#95A5A6"}
    ]
};

// ==========================================
// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация приложения');
    
    // Загружаем данные
    loadData();
    
    // Инициализируем интерфейс
    initializeTabs();
    loadInitialData();
    updateAllCalculations();
     
});

// ==========================================
// СОХРАНЕНИЕ/ЗАГРУЗКА ДАННЫХ
// ==========================================
function saveData() {
    try {
        localStorage.setItem('financeAppData', JSON.stringify(appData));
        console.log('✅ Данные сохранены в localStorage');
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('financeAppData');
        if (saved) {
            appData = JSON.parse(saved);
            console.log('✅ Данные загружены из localStorage');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

// ==========================================
// ВКЛАДКИ
// ==========================================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ==========================================
// ЗАГРУЗКА ДАННЫХ В ИНТЕРФЕЙС
// ==========================================
function loadInitialData() {
    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
    renderArchive();
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    
    if (startDateInput) startDateInput.value = appData.currentPeriod.startDate;
    if (endDateInput) endDateInput.value = appData.currentPeriod.endDate;
    if (savingsInput) savingsInput.value = appData.currentPeriod.savingsPercentage;
    // Автосохранение процента сбережений
    if (savingsInput) {
        savingsInput.addEventListener('input', function() {
            const newValue = parseFloat(savingsInput.value);
            if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
                appData.currentPeriod.savingsPercentage = newValue;
                saveData();
                updateAllCalculations();
            }
        });
    }
    
    // Автосохранение дат периода
    if (startDateInput) {
        startDateInput.addEventListener('change', function() {
            appData.currentPeriod.startDate = startDateInput.value;
            saveData();
            updateAllCalculations();
        });
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', function() {
            appData.currentPeriod.endDate = endDateInput.value;
            saveData();
            updateAllCalculations();
        });
    }
}

// ==========================================
// РАСЧЕТЫ
// ==========================================
function updateAllCalculations() {
    const totalIncome = appData.currentPeriod.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalFixed = appData.currentPeriod.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSavings = totalIncome * appData.currentPeriod.savingsPercentage / 100;
    const totalDailyExpenses = appData.currentPeriod.dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSpent = totalFixed + totalDailyExpenses;
    const remainingBudget = totalIncome - totalSpent - totalSavings;
    
    const startDate = new Date(appData.currentPeriod.startDate);
    const endDate = new Date(appData.currentPeriod.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = remainingBudget / totalDays;
    
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
    const todaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const todayRemaining = dailyBudget - todaySpent;
    const todayProgress = Math.min((todaySpent / dailyBudget) * 100, 100);
    
    updateElement('totalIncome', formatCurrency(totalIncome));
    updateElement('totalSpent', formatCurrency(totalSpent));
    updateElement('totalSavings', formatCurrency(totalSavings));
    updateElement('remainingBudget', formatCurrency(remainingBudget));
    updateElement('dailyBudget', formatCurrency(dailyBudget));
    updateElement('todaySpent', formatCurrency(todaySpent));
    updateElement('todayRemaining', formatCurrency(todayRemaining));
    
    const todayProgressBar = document.getElementById('todayProgress');
    if (todayProgressBar) {
        todayProgressBar.style.width = `${todayProgress}%`;
    }
}

// ==========================================
// ДОХОДЫ
// ==========================================
function addIncome() {
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    if (!title || !amount || amount <= 0) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    appData.currentPeriod.incomes.push({
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        date: new Date().toISOString().split('T')[0]
    });
    
    titleInput.value = '';
    amountInput.value = '';
    
    saveData();
    renderIncomes();
    updateAllCalculations();
    showToast(`Доход "${title}" добавлен`, 'success');
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;
    
    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    
    saveData();
    renderIncomes();
    updateAllCalculations();
    showToast(`Доход "${income.name}" удален`, 'success');
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Нет доходов</p>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-weight: bold;">${income.name}</div>
                <div style="font-size: 12px; color: #999;">${income.category}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold;">${formatCurrency(income.amount)}</span>
                <button onclick="removeIncome(${income.id})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// ПОСТОЯННЫЕ РАСХОДЫ
// ==========================================
function addFixedExpense() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!title || !amount || amount <= 0) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    appData.currentPeriod.fixedExpenses.push({
        id: Date.now(),
        name: title,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    });
    
    titleInput.value = '';
    amountInput.value = '';
    
    saveData();
    renderFixedExpenses();
    updateAllCalculations();
    showToast(`Расход "${title}" добавлен`, 'success');
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    
    saveData();
    renderFixedExpenses();
    updateAllCalculations();
    showToast(`Расход "${expense.name}" удален`, 'success');
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Нет постоянных расходов</p>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: bold;">${expense.name}</div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold;">${formatCurrency(expense.amount)}</span>
                <button onclick="removeFixedExpense(${expense.id})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// ЕЖЕДНЕВНЫЕ РАСХОДЫ
// ==========================================
function addDailyExpense() {
    const amountInput = document.getElementById('dailyAmount');
    const descriptionInput = document.getElementById('dailyDescription');
    const categorySelect = document.getElementById('dailyCategory');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const category = categorySelect.value;
    
    if (!amount || amount <= 0) {
        showToast('Введите сумму', 'error');
        return;
    }
    
    appData.currentPeriod.dailyExpenses.push({
        id: Date.now(),
        amount: amount,
        description: description || 'Без описания',
        category: category,
        date: new Date().toISOString().split('T')[0]
    });
    
    amountInput.value = '';
    descriptionInput.value = '';
    
    saveData();
    renderDailyExpenses();
    updateAllCalculations();
    showToast(`Расход ${formatCurrency(amount)} добавлен`, 'success');
}

function removeDailyExpense(id) {
    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    
    saveData();
    renderDailyExpenses();
    updateAllCalculations();
    showToast('Расход удален', 'success');
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Нет ежедневных расходов</p>';
        return;
    }
    
    const sorted = [...appData.currentPeriod.dailyExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sorted.map(expense => {
        const category = appData.categories.find(cat => cat.id === expense.category);
        const icon = category ? category.icon : '📋';
        
        return `
            <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">${icon}</span>
                    <div>
                        <div style="font-weight: bold;">${expense.description}</div>
                        <div style="font-size: 12px; color: #999;">${formatDate(expense.date)}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold;">${formatCurrency(expense.amount)}</span>
                    <button onclick="removeDailyExpense(${expense.id})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// АРХИВ
// ==========================================
function renderArchive() {
    const container = document.getElementById('archiveList');
    if (!container) return;
    
    if (appData.historicalData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Нет архивных периодов</p>';
        return;
    }
    
    container.innerHTML = appData.historicalData.map(period => `
        <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 15px;">
            <h3>${period.title}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                <div>
                    <div style="font-size: 12px; color: #999;">Доход:</div>
                    <div style="font-weight: bold;">${formatCurrency(period.totalIncome)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #999;">Расход:</div>
                    <div style="font-weight: bold;">${formatCurrency(period.totalExpenses)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #999;">Сбережения:</div>
                    <div style="font-weight: bold;">${formatCurrency(period.savings)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function showToast(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    
    if (tg.showPopup) {
        tg.showPopup({
            title: type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️',
            message: message
        });
    }
}

// Заглушки для графиков
function initializeCharts() {}
function initializeCalendarHeatmap() {}
