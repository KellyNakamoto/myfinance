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
        ]
    },
    historicalData: [
        {
            id: "2025_09",
            title: "Сентябрь 2025",
            totalIncome: 125000,
            totalExpenses: 52000,
            savings: 25000,
            categorySpending: {
                food: 18500, transport: 8200, entertainment: 5500,
                shopping: 7800, housing: 25000, utilities: 3500, other: 2500
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
        categories: savedData.categories || appData.categories,
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

        const savedData = JSON.parse(storedValue);
        mergeAppData(savedData);
        return true;
    } catch (error) {
        console.error('Ошибка загрузки из облачного хранилища Telegram', error);
        showToast('Не удалось загрузить данные из облака Telegram.', 'warning');
        return false;
    }
}

function loadAppDataFromLocalStorage() {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        if (!savedRaw) return false;

        const savedData = JSON.parse(savedRaw);
        mergeAppData(savedData);
        return true;
    } catch (error) {
        console.error('Ошибка загрузки сохраненных данных', error);
        showToast('Не удалось загрузить сохраненные данные. Используются стандартные значения.', 'warning');
        return false;
    }
}

function saveAppData() {
    saveAppDataToLocalStorage();
    saveAppDataToCloudStorage().catch(error => {
        console.error('Ошибка сохранения в облачное хранилище Telegram', error);
        if (!cloudSaveErrorShown) {
            showToast('Не удалось сохранить данные в облаке Telegram. Проверьте подключение к интернету.', 'error');
            cloudSaveErrorShown = true;
        }
    });
}

function saveAppDataToLocalStorage() {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения данных', error);
        showToast('Не удалось сохранить данные. Проверьте доступное место на устройстве.', 'error');
        return false;
    }
}

function saveAppDataToCloudStorage() {
    const cloudStorage = getTelegramCloudStorage();
    if (!cloudStorage || typeof cloudStorage.setItem !== 'function') {
        return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
        cloudStorage.setItem(STORAGE_KEY, JSON.stringify(appData), error => {
            if (error) {
                reject(error);
            } else {
                cloudSaveErrorShown = false;
                resolve(true);
            }
        });
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    const webApp = getTelegramWebApp();
    if (webApp && typeof webApp.ready === 'function') {
        webApp.ready();
        if (typeof webApp.expand === 'function') {
            webApp.expand();
        }
    }

    await loadAppDataFromStorage();
    initializeTabs();
    loadInitialData();
    updateAllCalculations();
    initializeCharts();
    initializeCalendarHeatmap();
    showToast('Приложение загружено. Добро пожаловать!', 'success');
    saveAppData();
});

// Управление вкладками
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

// Загрузка начальных данных
function loadInitialData() {
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
    const dailyBudget = totalDays > 0 ? (remainingBudget / totalDays) : 0;
    
    // Траты сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
    const todaySpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const todayRemaining = dailyBudget - todaySpent;
    const todayProgress = dailyBudget > 0 ? Math.min((todaySpent / dailyBudget) * 100, 100) : 0;
    
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
    const savingsProgress = totalSavings > 0 ? (currentSavings / totalSavings) * 100 : 0;
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
    saveAppData();
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;
    
    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    renderIncomes();
    updateAllCalculations();
    showToast(`Доход "${income.name}" удален`, 'success');
    saveAppData();
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<div class="empty-state">Добавьте ваши доходы</div>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-name">${escapeHtml(income.name)}</div>
                <div class="item-amount">${formatCurrency(income.amount)}</div>
                <div class="item-category">Категория: ${getCategoryName(income.category)}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn danger" onclick="removeIncome(${income.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Управление расходами
function addFixedExpense() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    if (!title || !amount || amount <= 0) {
        showToast('Пожалуйста, заполните название и корректную сумму', 'error');
        return;
    }
    
    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        icon: getRandomIcon(),
        color: getRandomColor()
    };
    
    appData.currentPeriod.fixedExpenses.push(newExpense);
    
    titleInput.value = '';
    amountInput.value = '';
    
    renderFixedExpenses();
    updateAllCalculations();
    showToast(`Расход "${title}" добавлен`, 'success');
    saveAppData();
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    renderFixedExpenses();
    updateAllCalculations();
    showToast(`Расход "${expense.name}" удален`, 'success');
    saveAppData();
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Добавьте ваши обязательные расходы</div>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-name">${expense.icon || '💰'} ${escapeHtml(expense.name)}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn danger" onclick="removeFixedExpense(${expense.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Управление ежедневными тратами
function addDailyExpense() {
    const amountInput = document.getElementById('dailyAmount');
    const descriptionInput = document.getElementById('dailyDescription');
    const categorySelect = document.getElementById('dailyCategory');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const category = categorySelect.value;
    
    if (!amount || amount <= 0) {
        showToast('Пожалуйста, введите корректную сумму', 'error');
        return;
    }
    
    // Smart-категоризация
    const smartCategory = description ? smartCategorize(description) : category;
    
    const newExpense = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        description: description || 'Трата без описания',
        category: smartCategory,
        predicted: false
    };
    
    appData.currentPeriod.dailyExpenses.push(newExpense);
    
    amountInput.value = '';
    descriptionInput.value = '';
    categorySelect.value = 'other';
    
    renderDailyExpenses();
    updateAllCalculations();
    updateCalendarHeatmap();
    showToast(`Трата ${formatCurrency(amount)} добавлена в категорию "${getCategoryName(smartCategory)}"`, 'success');
    saveAppData();
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    renderDailyExpenses();
    updateAllCalculations();
    updateCalendarHeatmap();
    showToast(`Трата ${formatCurrency(expense.amount)} удалена`, 'success');
    saveAppData();
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Добавьте ваши ежедневные траты</div>';
        return;
    }
    
    // Группируем по датам
    const groupedExpenses = appData.currentPeriod.dailyExpenses.reduce((acc, expense) => {
        if (!acc[expense.date]) acc[expense.date] = [];
        acc[expense.date].push(expense);
        return acc;
    }, {});
    
    const sortedDates = Object.keys(groupedExpenses).sort().reverse();
    
    container.innerHTML = sortedDates.map(date => {
        const expenses = groupedExpenses[date];
        const dayTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return `
            <div class="day-expenses">
                <div class="day-header">
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
    
    for (const category of appData.categories) {
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
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
            break;
        default:
            return;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    document.getElementById('startDate').value = startDateStr;
    document.getElementById('endDate').value = endDateStr;
    
    appData.currentPeriod.startDate = startDateStr;
    appData.currentPeriod.endDate = endDateStr;

    updateAllCalculations();
    updateCalendarHeatmap();
    saveAppData();
    showToast(`Период установлен: ${type === 'current' ? 'Этот месяц' : type === 'next' ? 'Следующий месяц' : '3 месяца'}`, 'success');
}

// Календарь Heatmap
function initializeCalendarHeatmap() {
    updateCalendarHeatmap();
}

function updateCalendarHeatmap() {
    const container = document.getElementById('calendarHeatmap');
    if (!container) return;
    
    const startDate = new Date(appData.currentPeriod.startDate);
    const endDate = new Date(appData.currentPeriod.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Группируем расходы по датам
    const dailyTotals = {};
    appData.currentPeriod.dailyExpenses.forEach(expense => {
        if (!dailyTotals[expense.date]) dailyTotals[expense.date] = 0;
        dailyTotals[expense.date] += expense.amount;
    });
    
    // Находим максимальную трату для нормализации
    const maxAmount = Math.max(...Object.values(dailyTotals), 0);
    
    let html = '';
    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const amount = dailyTotals[dateStr] || 0;
        const level = maxAmount > 0 ? Math.floor((amount / maxAmount) * 4) : 0;
        
        html += `
            <div class="calendar-day" 
                 data-level="${level}" 
                 data-date="${dateStr}" 
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
    if (typeof Chart === 'undefined') {
        showToast('Графики недоступны: Chart.js не загружен.', 'warning');
        return;
    }
    
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
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Октябрь 2025',
                    data: currentMonthData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Сентябрь 2025',
                    data: previousMonthData,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
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
    if (typeof Chart === 'undefined') {
        showToast('Графики недоступны: Chart.js не загружен.', 'warning');
        return;
    }
    
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
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Распределение расходов по категориям'
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateTrendsChart() {
    if (window.trendsChart) {
        window.trendsChart.update();
    }
}

function updateCategoriesChart() {
    if (window.categoriesChart) {
        window.categoriesChart.destroy();
        initCategoriesChart();
    }
}

// Архив
function renderArchive() {
    const container = document.getElementById('archiveList');
    if (!container) return;
    
    if (appData.historicalData.length === 0) {
        container.innerHTML = '<div class="empty-state">Архив пуст</div>';
        return;
    }
    
    container.innerHTML = appData.historicalData.map(period => `
        <div class="archive-item">
            <div class="item-info">
                <div class="item-name">${period.title}</div>
                <div class="item-details">
                    Доходы: ${formatCurrency(period.totalIncome)} | 
                    Расходы: ${formatCurrency(period.totalExpenses)} |
                    Сбережения: ${formatCurrency(period.savings || 0)}
                </div>
            </div>
            <div class="item-actions">
                <button class="action-btn" onclick="viewPeriodDetails('${period.id}')">Подробнее</button>
            </div>
        </div>
    `).join('');
}

// Модальные окна
function editExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    document.getElementById('editExpenseId').value = expense.id;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editCategory').value = expense.category;
    const editDateInput = document.getElementById('editDate');
    if (editDateInput) {
        editDateInput.value = expense.date;
    }

    document.getElementById('expenseModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('expenseModal').classList.add('hidden');
}

function saveExpenseEdit() {
    const id = parseInt(document.getElementById('editExpenseId').value);
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDescription').value.trim();
    const category = document.getElementById('editCategory').value;
    const dateInput = document.getElementById('editDate');
    const date = dateInput ? dateInput.value : '';

    if (!amount || amount <= 0) {
        showToast('Пожалуйста, введите корректную сумму', 'error');
        return;
    }

    if (!date) {
        showToast('Пожалуйста, выберите дату траты', 'error');
        return;
    }

    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (expense) {
        expense.amount = amount;
        expense.description = description || 'Трата без описания';
        expense.category = category;
        expense.date = date;

        renderDailyExpenses();
        updateAllCalculations();
        updateCalendarHeatmap();
        closeModal();
        showToast('Трата обновлена', 'success');
        saveAppData();
    }
}

// Обновление настроек
function updateCalculations() {
    const savingsPercentage = parseInt(document.getElementById('savingsPercentage').value);
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    appData.currentPeriod.savingsPercentage = savingsPercentage;
    appData.currentPeriod.startDate = startDate;
    appData.currentPeriod.endDate = endDate;

    updateAllCalculations();
    updateCalendarHeatmap();
    saveAppData();
}

// Утилиты
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
    const category = appData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Прочее';
}

function getCategoryIcon(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
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

function viewPeriodDetails(periodId) {
    showToast('Функция просмотра деталей периода в разработке', 'info');
}

// Toast уведомления
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.success}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }
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
});
