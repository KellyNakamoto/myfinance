// ==========================================
// TELEGRAM MINI APP INTEGRATION
// ==========================================
// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Развернуть на весь экран
tg.ready(); // Сообщить что приложение готово

// Применяем цветовую схему Telegram
document.documentElement.setAttribute('data-theme', tg.colorScheme);

// Отслеживаем изменение темы в Telegram
tg.onEvent('themeChanged', function() {
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
});

// ==========================================
// СОХРАНЕНИЕ ДАННЫХ В TELEGRAM CLOUD STORAGE
// ==========================================

// Функция для сохранения данных в облако Telegram
async function saveToTelegramCloud(data) {
    try {
        const dataString = JSON.stringify(data);
        await tg.CloudStorage.setItem('financeAppData', dataString);
        console.log('Данные сохранены в Telegram Cloud');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения в Telegram Cloud:', error);
        // Fallback на localStorage если CloudStorage недоступен
        localStorage.setItem('financeAppData', dataString);
        return false;
    }
}

// Функция для загрузки данных из облака Telegram
async function loadFromTelegramCloud() {
    try {
        const dataString = await new Promise((resolve, reject) => {
            tg.CloudStorage.getItem('financeAppData', (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        
        if (dataString) {
            console.log('Данные загружены из Telegram Cloud');
            return JSON.parse(dataString);
        }
        return null;
    } catch (error) {
        console.error('Ошибка загрузки из Telegram Cloud:', error);
        // Fallback на localStorage
        const localData = localStorage.getItem('financeAppData');
        return localData ? JSON.parse(localData) : null;
    }
}

// Автосохранение при любых изменениях данных
let saveTimeout;
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveToTelegramCloud(appData);
    }, 1000); // Сохраняем через 1 секунду после последнего изменения
}

// Отслеживание изменений массивов для автосохранения
function makeArrayObservable(arr) {
    const methods = ['push', 'pop', 'shift', 'unshift', 'splice'];
    methods.forEach(method => {
        const original = arr[method];
        arr[method] = function(...args) {
            const result = original.apply(this, args);
            autoSave();
            return result;
        };
    });
    return arr;
}

// ==========================================
// СТРУКТУРА ДАННЫХ ПО УМОЛЧАНИЮ
// ==========================================

function getDefaultAppData() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    return {
        currentPeriod: {
            id: `${year}_${month}`,
            title: `${monthNames[now.getMonth()]} ${year}`,
            startDate: `${year}-${month}-01`,
            endDate: `${year}-${month}-${new Date(year, now.getMonth() + 1, 0).getDate()}`,
            incomes: [],
            fixedExpenses: [],
            savingsPercentage: 20,
            dailyExpenses: []
        },
        historicalData: [],
        categories: [
            {id: "food", name: "Еда", icon: "🍽️", color: "#FF6B35", keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин"]},
            {id: "transport", name: "Транспорт", icon: "🚗", color: "#4ECDC4", keywords: ["такси", "автобус", "метро", "бензин", "парковка"]},
            {id: "entertainment", name: "Развлечения", icon: "🎬", color: "#45B7D1", keywords: ["кино", "концерт", "игры", "развлечения"]},
            {id: "shopping", name: "Покупки", icon: "🛍️", color: "#F39C12", keywords: ["одежда", "обувь", "техника", "покупки"]},
            {id: "housing", name: "Жилье", icon: "🏠", color: "#E74C3C", keywords: ["квартира", "аренда", "коммунальные"]},
            {id: "utilities", name: "Коммунальные", icon: "📡", color: "#9B59B6", keywords: ["интернет", "телефон", "электричество"]},
            {id: "health", name: "Здоровье", icon: "⚕️", color: "#27AE60", keywords: ["врач", "лекарства", "аптека"]},
            {id: "other", name: "Прочее", icon: "📋", color: "#95A5A6", keywords: []}
        ],
        predictions: {
            endOfMonthSpending: 0,
            confidenceLevel: 0,
            recommendedDailyBudget: 0,
            trendDirection: "stable",
            anomalies: []
        },
        patterns: {
            weekdayVsWeekend: {weekday: 0, weekend: 0},
            regularExpenses: [],
            seasonalTrends: {
                highest_month: "",
                lowest_month: ""
            }
        }
    };
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ==========================================

let appData = null;

// Асинхронная инициализация с загрузкой данных
(async function initializeApp() {
    try {
        // Загружаем данные из Telegram Cloud Storage
        const savedData = await loadFromTelegramCloud();
        
        if (savedData) {
            console.log('Восстановлены сохраненные данные');
            appData = savedData;
        } else {
            console.log('Создаем новые данные по умолчанию');
            appData = getDefaultAppData();
            // Сохраняем начальные данные
            await saveToTelegramCloud(appData);
        }
        
        // Применяем отслеживание изменений к массивам
        if (appData && appData.currentPeriod) {
            appData.currentPeriod.incomes = makeArrayObservable(appData.currentPeriod.incomes || []);
            appData.currentPeriod.fixedExpenses = makeArrayObservable(appData.currentPeriod.fixedExpenses || []);
            appData.currentPeriod.dailyExpenses = makeArrayObservable(appData.currentPeriod.dailyExpenses || []);
        }
        
        if (appData.historicalData) {
            appData.historicalData = makeArrayObservable(appData.historicalData);
        }
        
        // Запускаем приложение после загрузки данных
        document.addEventListener('DOMContentLoaded', function() {
            initializeTabs();
            loadInitialData();
            updateAllCalculations();
            initializeCharts();
            initializeCalendarHeatmap();
            showToast('Приложение загружено. Добро пожаловать!', 'success');
        });
        
        // Если DOM уже загружен
        if (document.readyState === 'loading') {
            // DOMContentLoaded сработает позже
        } else {
            // DOM уже загружен, запускаем сразу
            initializeTabs();
            loadInitialData();
            updateAllCalculations();
            initializeCharts();
            initializeCalendarHeatmap();
            showToast('Приложение загружено. Добро пожаловать!', 'success');
        }
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        appData = getDefaultAppData();
        showToast('Ошибка загрузки данных. Созданы данные по умолчанию.', 'warning');
    }
})();

// ==========================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ
// ==========================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
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

// ==========================================
// ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ
// ==========================================

function loadInitialData() {
    if (!appData) return;
    
    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
    renderArchive();
    
    // Устанавливаем значения форм
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    
    if (startDateInput) startDateInput.value = appData.currentPeriod.startDate;
    if (endDateInput) endDateInput.value = appData.currentPeriod.endDate;
    if (savingsInput) savingsInput.value = appData.currentPeriod.savingsPercentage;
}

// ==========================================
// ОБНОВЛЕНИЕ РАСЧЕТОВ
// ==========================================

function updateAllCalculations() {
    if (!appData || !appData.currentPeriod) return;
    
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
    const dailyBudget = remainingBudget / totalDays;
    
    // Траты сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
    const todaySpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const todayRemaining = dailyBudget - todaySpent;
    const todayProgress = Math.min((todaySpent / dailyBudget) * 100, 100);
    
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
    const currentSavings = totalIncome * 0.65 * appData.currentPeriod.savingsPercentage / 100;
    const savingsProgress = (currentSavings / totalSavings) * 100;
    const savingsProgressBar = document.getElementById('savingsProgress');
    if (savingsProgressBar) {
        savingsProgressBar.style.width = `${Math.min(savingsProgress, 100)}%`;
    }
}

// ==========================================
// УПРАВЛЕНИЕ ДОХОДАМИ
// ==========================================

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
        category: category,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.currentPeriod.incomes.push(newIncome);
    
    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'work';
    
    renderIncomes();
    updateAllCalculations();
    showToast(`Доход "${title}" добавлен`, 'success');
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;
    
    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    
    renderIncomes();
    updateAllCalculations();
    autoSave();
    showToast(`Доход "${income.name}" удален`, 'success');
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<p class="empty-state">Нет доходов за текущий период</p>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="income-item">
            <div class="income-info">
                <span class="income-name">${income.name}</span>
                <span class="income-category">${income.category}</span>
            </div>
            <div class="income-actions">
                <span class="income-amount">${formatCurrency(income.amount)}</span>
                <button onclick="removeIncome(${income.id})" class="btn-delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// УПРАВЛЕНИЕ ПОСТОЯННЫМИ РАСХОДАМИ
// ==========================================

function addFixedExpense() {
    const titleInput = document.getElementById('fixedExpenseTitle');
    const amountInput = document.getElementById('fixedExpenseAmount');
    const categorySelect = document.getElementById('fixedExpenseCategory');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    if (!title || !amount || amount <= 0) {
        showToast('Пожалуйста, заполните название и корректную сумму', 'error');
        return;
    }
    
    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.currentPeriod.fixedExpenses.push(newExpense);
    
    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'housing';
    
    renderFixedExpenses();
    updateAllCalculations();
    showToast(`Постоянный расход "${title}" добавлен`, 'success');
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    
    renderFixedExpenses();
    updateAllCalculations();
    autoSave();
    showToast(`Постоянный расход "${expense.name}" удален`, 'success');
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpenseList');
    if (!container) return;
    
    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<p class="empty-state">Нет постоянных расходов за текущий период</p>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <span class="expense-name">${expense.name}</span>
                <span class="expense-category">${expense.category}</span>
            </div>
            <div class="expense-actions">
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                <button onclick="removeFixedExpense(${expense.id})" class="btn-delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ РАСХОДАМИ
// ==========================================

function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');
    const dateInput = document.getElementById('dailyExpenseDate');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    
    if (!title || !amount || amount <= 0) {
        showToast('Пожалуйста, заполните название и корректную сумму', 'error');
        return;
    }
    
    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        date: date
    };
    
    appData.currentPeriod.dailyExpenses.push(newExpense);
    
    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';
    dateInput.value = '';
    
    renderDailyExpenses();
    updateAllCalculations();
    showToast(`Расход "${title}" добавлен`, 'success');
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    
    renderDailyExpenses();
    updateAllCalculations();
    autoSave();
    showToast(`Расход "${expense.name}" удален`, 'success');
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpenseList');
    if (!container) return;
    
    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<p class="empty-state">Нет ежедневных расходов за текущий период</p>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
    const sortedExpenses = [...appData.currentPeriod.dailyExpenses].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    container.innerHTML = sortedExpenses.map(expense => {
        const categoryInfo = appData.categories.find(cat => cat.id === expense.category);
        const icon = categoryInfo ? categoryInfo.icon : '📋';
        
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <span class="expense-icon">${icon}</span>
                    <div>
                        <span class="expense-name">${expense.name}</span>
                        <span class="expense-date">${formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                    <button onclick="removeDailyExpense(${expense.id})" class="btn-delete">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// АРХИВ ПЕРИОДОВ
// ==========================================

function archiveCurrentPeriod() {
    if (!appData.currentPeriod) return;
    
    if (appData.currentPeriod.incomes.length === 0 && 
        appData.currentPeriod.fixedExpenses.length === 0 && 
        appData.currentPeriod.dailyExpenses.length === 0) {
        showToast('Нельзя архивировать пустой период', 'warning');
        return;
    }
    
    // Вычисляем итоговые значения
    const totalIncome = appData.currentPeriod.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = appData.currentPeriod.fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0) +
                          appData.currentPeriod.dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savings = totalIncome * appData.currentPeriod.savingsPercentage / 100;
    
    // Группируем расходы по категориям
    const categorySpending = {};
    appData.currentPeriod.dailyExpenses.forEach(exp => {
        if (!categorySpending[exp.category]) {
            categorySpending[exp.category] = 0;
        }
        categorySpending[exp.category] += exp.amount;
    });
    
    // Создаем запись в архиве
    const archivedPeriod = {
        id: appData.currentPeriod.id,
        title: appData.currentPeriod.title,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        savings: savings,
        categorySpending: categorySpending,
        startDate: appData.currentPeriod.startDate,
        endDate: appData.currentPeriod.endDate
    };
    
    appData.historicalData.unshift(archivedPeriod);
    
    // Создаем новый период
    appData.currentPeriod = getDefaultAppData().currentPeriod;
    appData.currentPeriod.incomes = makeArrayObservable([]);
    appData.currentPeriod.fixedExpenses = makeArrayObservable([]);
    appData.currentPeriod.dailyExpenses = makeArrayObservable([]);
    
    autoSave();
    loadInitialData();
    updateAllCalculations();
    renderArchive();
    
    showToast('Период архивирован, создан новый период', 'success');
}

function renderArchive() {
    const container = document.getElementById('archiveList');
    if (!container) return;
    
    if (!appData.historicalData || appData.historicalData.length === 0) {
        container.innerHTML = '<p class="empty-state">Нет архивных периодов</p>';
        return;
    }
    
    container.innerHTML = appData.historicalData.map(period => `
        <div class="archive-item">
            <h3>${period.title}</h3>
            <div class="archive-stats">
                <div class="stat">
                    <span class="stat-label">Доход:</span>
                    <span class="stat-value">${formatCurrency(period.totalIncome)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Расход:</span>
                    <span class="stat-value">${formatCurrency(period.totalExpenses)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Сбережения:</span>
                    <span class="stat-value">${formatCurrency(period.savings)}</span>
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
    if (element) {
        element.textContent = value;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
}

function showToast(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Показываем нотификацию через Telegram
    if (tg.showPopup) {
        tg.showPopup({
            title: type === 'success' ? '✅ Успех' : type === 'error' ? '❌ Ошибка' : 'ℹ️ Информация',
            message: message
        });
    }
    
    // Альтернативно: создаем свой toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ==========================================
// ОБНОВЛЕНИЕ ПРОЦЕНТА СБЕРЕЖЕНИЙ
// ==========================================

function updateSavingsPercentage() {
    const input = document.getElementById('savingsPercentage');
    if (!input) return;
    
    const value = parseInt(input.value);
    if (value >= 0 && value <= 100) {
        appData.currentPeriod.savingsPercentage = value;
        updateAllCalculations();
        autoSave();
        showToast(`Процент сбережений изменен на ${value}%`, 'success');
    }
}

// Заглушки для функций, которые определены в других частях приложения
function initializeCharts() {
    console.log('Инициализация графиков...');
}

function updateCharts() {
    console.log('Обновление графиков...');
}

function initializeCalendarHeatmap() {
    console.log('Инициализация календарной тепловой карты...');
}
