// Глобальные переменные и данные приложения
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
    historicalData: [
        {
            id: "2025_09",
            title: "Сентябрь 2025",
            totalIncome: 125000,
            totalExpenses: 52000,
            savings: 25000,
            categorySpending: {
                food: 18500,
                transport: 8200,
                entertainment: 5500,
                shopping: 7800,
                housing: 25000,
                utilities: 3500,
                other: 2500
            },
            dailySpending: {
                "2025-09-01": 1100,
                "2025-09-02": 2200,
                "2025-09-03": 800,
                "2025-09-04": 1500,
                "2025-09-05": 3200,
                "2025-09-06": 900,
                "2025-09-07": 1300,
                "2025-09-08": 1800,
                "2025-09-09": 2100,
                "2025-09-10": 1600,
                "2025-09-11": 2500,
                "2025-09-12": 1200,
                "2025-09-13": 1400,
                "2025-09-14": 1900,
                "2025-09-15": 4500,
                "2025-09-16": 1100,
                "2025-09-17": 1700,
                "2025-09-18": 2000,
                "2025-09-19": 1300,
                "2025-09-20": 2800,
                "2025-09-21": 1500,
                "2025-09-22": 1600,
                "2025-09-23": 2200,
                "2025-09-24": 1800,
                "2025-09-25": 2400,
                "2025-09-26": 1900,
                "2025-09-27": 1700,
                "2025-09-28": 2100,
                "2025-09-29": 1500,
                "2025-09-30": 1800
            }
        },
        {
            id: "2025_08",
            title: "Август 2025",
            totalIncome: 120000,
            totalExpenses: 48000,
            categorySpending: {
                food: 16800,
                transport: 7500,
                entertainment: 8200,
                shopping: 6500,
                housing: 25000,
                utilities: 3200,
                other: 2000
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

// Переменная для отслеживания редактирования
let editingState = {
    mode: null, // 'income', 'fixed', 'daily'
    itemId: null,
    originalData: null
};

// Состояние для скрытия шапки при прокрутке
let lastScrollY = window.scrollY;
let ticking = false;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeHeaderScroll();
    initializeScrollToTop();
    loadAllSavedData(); // Загружаем ВСЕ сохраненные данные
    loadInitialData();
    updateAllCalculations();
    initializeCharts();
    initializeCalendarHeatmap();
});

// ПОЛНАЯ СИСТЕМА АВТОСОХРАНЕНИЯ
// ===============================

// Загрузка всех сохраненных данных при старте
function loadAllSavedData() {
    console.log('Загрузка сохраненных данных...');
    
    // Загружаем основные данные текущего периода
    const savedAppData = localStorage.getItem('appData_currentPeriod');
    if (savedAppData) {
        try {
            const parsedData = JSON.parse(savedAppData);
            appData.currentPeriod = { ...appData.currentPeriod, ...parsedData };
            console.log('Загружены данные текущего периода:', appData.currentPeriod);
        } catch (e) {
            console.error('Ошибка загрузки основных данных:', e);
        }
    }
    
    // Загружаем доходы
    const savedIncomes = localStorage.getItem('appData_incomes');
    if (savedIncomes) {
        try {
            appData.currentPeriod.incomes = JSON.parse(savedIncomes);
            console.log('Загружены доходы:', appData.currentPeriod.incomes.length);
        } catch (e) {
            console.error('Ошибка загрузки доходов:', e);
        }
    }
    
    // Загружаем обязательные расходы
    const savedFixedExpenses = localStorage.getItem('appData_fixedExpenses');
    if (savedFixedExpenses) {
        try {
            appData.currentPeriod.fixedExpenses = JSON.parse(savedFixedExpenses);
            console.log('Загружены обязательные расходы:', appData.currentPeriod.fixedExpenses.length);
        } catch (e) {
            console.error('Ошибка загрузки обязательных расходов:', e);
        }
    }
    
    // Загружаем ежедневные траты
    const savedDailyExpenses = localStorage.getItem('appData_dailyExpenses');
    if (savedDailyExpenses) {
        try {
            appData.currentPeriod.dailyExpenses = JSON.parse(savedDailyExpenses);
            console.log('Загружены ежедневные траты:', appData.currentPeriod.dailyExpenses.length);
        } catch (e) {
            console.error('Ошибка загрузки ежедневных трат:', e);
        }
    }
    
    // Загружаем процент сбережений
    const savedSavingsPercentage = localStorage.getItem('appData_savingsPercentage');
    if (savedSavingsPercentage) {
        appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
        console.log('Загружен процент сбережений:', appData.currentPeriod.savingsPercentage);
    }
    
    // Загружаем даты планирования
    const savedStartDate = localStorage.getItem('appData_startDate');
    const savedEndDate = localStorage.getItem('appData_endDate');
    if (savedStartDate) {
        appData.currentPeriod.startDate = savedStartDate;
        console.log('Загружена начальная дата:', savedStartDate);
    }
    if (savedEndDate) {
        appData.currentPeriod.endDate = savedEndDate;
        console.log('Загружена конечная дата:', savedEndDate);
    }
}

// Универсальная функция сохранения данных
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Сохранено в ${key}:`, data);
    } catch (e) {
        console.error(`Ошибка сохранения ${key}:`, e);
    }
}

// Автосохранение всех данных
function saveAllData() {
    // Сохраняем основные данные периода
    const periodData = {
        id: appData.currentPeriod.id,
        title: appData.currentPeriod.title,
        startDate: appData.currentPeriod.startDate,
        endDate: appData.currentPeriod.endDate,
        savingsPercentage: appData.currentPeriod.savingsPercentage
    };
    saveToStorage('appData_currentPeriod', periodData);
    
    // Сохраняем отдельные массивы данных
    saveToStorage('appData_incomes', appData.currentPeriod.incomes);
    saveToStorage('appData_fixedExpenses', appData.currentPeriod.fixedExpenses);
    saveToStorage('appData_dailyExpenses', appData.currentPeriod.dailyExpenses);
    saveToStorage('appData_savingsPercentage', appData.currentPeriod.savingsPercentage);
    saveToStorage('appData_startDate', appData.currentPeriod.startDate);
    saveToStorage('appData_endDate', appData.currentPeriod.endDate);
}

// Инициализация скрытия шапки при прокрутке (исправлена для Telegram WebApp)
function initializeHeaderScroll() {
    const header = document.getElementById('compactHeader');
    const navigation = document.getElementById('tabNavigation');
    
    function updateHeaderVisibility() {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Прокрутка вниз - скрываем шапку и навигацию
            header.style.transform = 'translateY(-100%)';
            navigation.style.transform = 'translateY(-100%)';
        } else {
            // Прокрутка вверх - показываем шапку и навигацию
            header.style.transform = 'translateY(0)';
            navigation.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeaderVisibility);
            ticking = true;
        }
    }

    // Используем более надежное событие для Telegram WebApp
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Дополнительная проверка для мобильных браузеров
    document.addEventListener('touchmove', requestTick, { passive: true });
}

// Инициализация кнопки "Вверх"
function initializeScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    
    function toggleScrollButton() {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleScrollButton, { passive: true });
}

// Функция прокрутки наверх
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Автосохранение процента сбережений с немедленным сохранением
function saveSavingsPercentage(value) {
    appData.currentPeriod.savingsPercentage = parseInt(value);
    saveAllData(); // Сохраняем все данные
    updateAllCalculations();
}

// Автосохранение периода планирования с немедленным сохранением
function savePlanningPeriod() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate) {
        appData.currentPeriod.startDate = startDate;
    }
    if (endDate) {
        appData.currentPeriod.endDate = endDate;
    }
    
    saveAllData(); // Сохраняем все данные
    updateAllCalculations();
}

// Навигация по вкладкам со стрелками
function scrollTabs(direction) {
    const container = document.getElementById('tabsContainer');
    const scrollAmount = 200;
    
    if (direction === -1) {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Управление вкладками (убрана обработка вкладки "daily")
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
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

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

    // Устанавливаем значения форм из загруженных данных
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    const savingsDisplay = document.getElementById('savingsPercentageDisplay');

    if (startDateInput) startDateInput.value = appData.currentPeriod.startDate;
    if (endDateInput) endDateInput.value = appData.currentPeriod.endDate;
    if (savingsInput) savingsInput.value = appData.currentPeriod.savingsPercentage;
    if (savingsDisplay) savingsDisplay.textContent = appData.currentPeriod.savingsPercentage;
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
    const dailyBudget = Math.max(remainingBudget / totalDays, 0);

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
    
    updateElement('savingsGoal', formatCurrency(totalSavings));
    updateElement('savingsProgressText', `${formatCurrency(currentSavings)} из ${formatCurrency(totalSavings)}`);
}

// УПРАВЛЕНИЕ ДОХОДАМИ С АВТОСОХРАНЕНИЕМ И РЕДАКТИРОВАНИЕМ
function addIncome() {
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!title || !amount || amount <= 0) {
        return;
    }

    if (editingState.mode === 'income' && editingState.itemId) {
        // Редактируем существующий доход
        const incomeIndex = appData.currentPeriod.incomes.findIndex(inc => inc.id === editingState.itemId);
        if (incomeIndex !== -1) {
            appData.currentPeriod.incomes[incomeIndex] = {
                ...appData.currentPeriod.incomes[incomeIndex],
                name: title,
                amount: amount,
                category: category
            };
        }
        
        // Сбрасываем состояние редактирования
        cancelEdit();
        
        // Меняем текст кнопки обратно
        const button = document.querySelector('[onclick="addIncome()"]');
        if (button) button.textContent = 'Добавить доход';
    } else {
        // Создаем новый доход
        const newIncome = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split('T')[0]
        };

        appData.currentPeriod.incomes.push(newIncome);
    }

    // Автосохранение
    saveAllData();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'work';

    renderIncomes();
    updateAllCalculations();
}

function editIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    // Устанавливаем состояние редактирования
    editingState.mode = 'income';
    editingState.itemId = id;
    editingState.originalData = { ...income };

    // Заполняем форму данными для редактирования
    document.getElementById('incomeTitle').value = income.name;
    document.getElementById('incomeAmount').value = income.amount;
    document.getElementById('incomeCategory').value = income.category;

    // Меняем текст кнопки
    const button = document.querySelector('[onclick="addIncome()"]');
    if (button) button.textContent = 'Сохранить изменения';

    // Скроллим к форме
    document.getElementById('incomeTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('incomeTitle').focus();
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    if (confirm(`Удалить доход "${income.name}"?`)) {
        appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
        
        // Автосохранение
        saveAllData();
        
        renderIncomes();
        updateAllCalculations();
    }
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;

    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<div class="empty-state">Пока нет доходов</div>';
        return;
    }

    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="list-item ${editingState.mode === 'income' && editingState.itemId === income.id ? 'editing' : ''}">
            <div class="item-info">
                <div class="item-name">${income.name}</div>
                <div class="item-amount">${formatCurrency(income.amount)}</div>
                <div class="item-category">${getCategoryName(income.category)} • ${formatDate(income.date)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editIncome(${income.id})" class="action-btn edit">Изменить</button>
                <button onclick="removeIncome(${income.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// УПРАВЛЕНИЕ ОБЯЗАТЕЛЬНЫМИ РАСХОДАМИ С АВТОСОХРАНЕНИЕМ И РЕДАКТИРОВАНИЕМ
function addFixedExpense() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!title || !amount || amount <= 0) {
        return;
    }

    if (editingState.mode === 'fixed' && editingState.itemId) {
        // Редактируем существующий расход
        const expenseIndex = appData.currentPeriod.fixedExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.fixedExpenses[expenseIndex] = {
                ...appData.currentPeriod.fixedExpenses[expenseIndex],
                name: title,
                amount: amount,
                category: category,
                icon: getCategoryIcon(category),
                color: getCategoryColor(category)
            };
        }
        
        // Сбрасываем состояние редактирования
        cancelEdit();
        
        // Меняем текст кнопки обратно
        const button = document.querySelector('[onclick="addFixedExpense()"]');
        if (button) button.textContent = 'Добавить расход';
    } else {
        // Создаем новый расход
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            icon: getCategoryIcon(category),
            color: getCategoryColor(category)
        };

        appData.currentPeriod.fixedExpenses.push(newExpense);
    }

    // Автосохранение
    saveAllData();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'housing';

    renderFixedExpenses();
    updateAllCalculations();
}

function editFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    // Устанавливаем состояние редактирования
    editingState.mode = 'fixed';
    editingState.itemId = id;
    editingState.originalData = { ...expense };

    // Заполняем форму данными для редактирования
    document.getElementById('expenseTitle').value = expense.name;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;

    // Меняем текст кнопки
    const button = document.querySelector('[onclick="addFixedExpense()"]');
    if (button) button.textContent = 'Сохранить изменения';

    // Скроллим к форме
    document.getElementById('expenseTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('expenseTitle').focus();
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    if (confirm(`Удалить расход "${expense.name}"?`)) {
        appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
        
        // Автосохранение
        saveAllData();
        
        renderFixedExpenses();
        updateAllCalculations();
    }
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpensesList');
    if (!container) return;

    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Пока нет обязательных расходов</div>';
        return;
    }

    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="list-item ${editingState.mode === 'fixed' && editingState.itemId === expense.id ? 'editing' : ''}">
            <div class="item-info">
                <div class="item-name">${expense.icon} ${expense.name}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${getCategoryName(expense.category)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editFixedExpense(${expense.id})" class="action-btn edit">Изменить</button>
                <button onclick="removeFixedExpense(${expense.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ТРАТАМИ С АВТОСОХРАНЕНИЕМ И РЕДАКТИРОВАНИЕМ
function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!title || !amount || amount <= 0) {
        return;
    }

    if (editingState.mode === 'daily' && editingState.itemId) {
        // Редактируем существующую трату
        const expenseIndex = appData.currentPeriod.dailyExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.dailyExpenses[expenseIndex] = {
                ...appData.currentPeriod.dailyExpenses[expenseIndex],
                description: title,
                amount: amount,
                category: category
            };
        }
        
        // Сбрасываем состояние редактирования
        cancelEdit();
        
        // Меняем текст кнопки обратно
        const button = document.querySelector('[onclick="addDailyExpense()"]');
        if (button) button.textContent = 'Добавить трату';
    } else {
        // Создаем новую трату
        const newExpense = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            description: title,
            category: category,
            predicted: false
        };

        appData.currentPeriod.dailyExpenses.push(newExpense);
    }

    // Автосохранение
    saveAllData();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';

    renderDailyExpenses();
    updateAllCalculations();
}

function editDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    // Устанавливаем состояние редактирования
    editingState.mode = 'daily';
    editingState.itemId = id;
    editingState.originalData = { ...expense };

    // Заполняем форму данными для редактирования
    document.getElementById('dailyExpenseTitle').value = expense.description;
    document.getElementById('dailyExpenseAmount').value = expense.amount;
    document.getElementById('dailyExpenseCategory').value = expense.category;

    // Меняем текст кнопки
    const button = document.querySelector('[onclick="addDailyExpense()"]');
    if (button) button.textContent = 'Сохранить изменения';

    // Скроллим к форме
    document.getElementById('dailyExpenseTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('dailyExpenseTitle').focus();
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    if (confirm(`Удалить трату "${expense.description}"?`)) {
        appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
        
        // Автосохранение
        saveAllData();
        
        renderDailyExpenses();
        updateAllCalculations();
    }
}

// Функция отмены редактирования
function cancelEdit() {
    editingState.mode = null;
    editingState.itemId = null;
    editingState.originalData = null;
    
    // Сбрасываем тексты кнопок
    const incomeBtn = document.querySelector('[onclick="addIncome()"]');
    const fixedBtn = document.querySelector('[onclick="addFixedExpense()"]');
    const dailyBtn = document.querySelector('[onclick="addDailyExpense()"]');
    
    if (incomeBtn) incomeBtn.textContent = 'Добавить доход';
    if (fixedBtn) fixedBtn.textContent = 'Добавить расход';
    if (dailyBtn) dailyBtn.textContent = 'Добавить трату';
    
    // Очищаем формы
    const forms = ['incomeTitle', 'incomeAmount', 'expenseTitle', 'expenseAmount', 'dailyExpenseTitle', 'dailyExpenseAmount'];
    forms.forEach(formId => {
        const element = document.getElementById(formId);
        if (element) element.value = '';
    });
    
    // Сбрасываем выбор категорий
    const categorySelects = ['incomeCategory', 'expenseCategory', 'dailyExpenseCategory'];
    categorySelects.forEach((selectId, index) => {
        const element = document.getElementById(selectId);
        if (element) {
            const defaultValues = ['work', 'housing', 'food'];
            element.value = defaultValues[index];
        }
    });
    
    // Перерисовываем списки для снятия подсветки редактирования
    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
}

// Исправленная функция рендера ежедневных трат (объединяем обе секции)
function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    const allContainer = document.getElementById('allDailyExpenses');
    
    const sortedExpenses = appData.currentPeriod.dailyExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const recentExpenses = sortedExpenses.slice(0, 5);

    const expenseHTML = (expenses) => expenses.map(expense => `
        <div class="list-item ${editingState.mode === 'daily' && editingState.itemId === expense.id ? 'editing' : ''}">
            <div class="item-info">
                <div class="item-name">${getCategoryIcon(expense.category)} ${expense.description}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${getCategoryName(expense.category)} • ${formatDate(expense.date)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editDailyExpense(${expense.id})" class="action-btn edit">Изменить</button>
                <button onclick="removeDailyExpense(${expense.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');

    if (container) {
        container.innerHTML = recentExpenses.length === 0 
            ? '<div class="empty-state">Пока нет ежедневных трат</div>'
            : expenseHTML(recentExpenses);
    }

    // Показываем все траты в allDailyExpenses
    if (allContainer) {
        if (sortedExpenses.length > 5) {
            allContainer.innerHTML = `
                <div style="margin-top: 24px;">
                    <h4 style="margin-bottom: 16px; color: var(--color-text-secondary);">Все траты</h4>
                    ${expenseHTML(sortedExpenses.slice(5))}
                </div>
            `;
        } else {
            allContainer.innerHTML = '';
        }
    }
}

// Управление архивом
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
                <div class="item-name">📅 ${period.title}</div>
                <div class="item-category">
                    Доходы: ${formatCurrency(period.totalIncome)} • 
                    Расходы: ${formatCurrency(period.totalExpenses)} • 
                    Сбережения: ${formatCurrency(period.savings || 0)}
                </div>
            </div>
            <div class="item-actions">
                <button onclick="loadPeriod('${period.id}')" class="action-btn">Загрузить</button>
            </div>
        </div>
    `).join('');
}

function loadPeriod(periodId) {
    const period = appData.historicalData.find(p => p.id === periodId);
    if (!period) return;

    // Здесь можно реализовать загрузку исторического периода
    console.log('Loading period:', period);
}

// Обновление процента сбережений
function updateSavingsPercentage(value) {
    const display = document.getElementById('savingsPercentageDisplay');
    if (display) {
        display.textContent = value;
    }
    appData.currentPeriod.savingsPercentage = parseInt(value);
    updateAllCalculations();
}

// УПРАВЛЕНИЕ ПЕРИОДОМ С АВТОСОХРАНЕНИЕМ
function changePeriod() {
    const modal = document.getElementById('periodModal');
    const startInput = document.getElementById('modalStartDate');
    const endInput = document.getElementById('modalEndDate');
    
    if (startInput) startInput.value = appData.currentPeriod.startDate;
    if (endInput) endInput.value = appData.currentPeriod.endDate;
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closePeriodModal() {
    const modal = document.getElementById('periodModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function savePeriodChange() {
    const startInput = document.getElementById('modalStartDate');
    const endInput = document.getElementById('modalEndDate');
    
    if (startInput && endInput) {
        appData.currentPeriod.startDate = startInput.value;
        appData.currentPeriod.endDate = endInput.value;
        
        // Обновляем заголовок периода
        const startDate = new Date(startInput.value);
        const month = startDate.toLocaleString('ru-RU', { month: 'long' });
        const year = startDate.getFullYear();
        appData.currentPeriod.title = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        
        // Обновляем кнопку периода
        const periodBtn = document.querySelector('.current-period');
        if (periodBtn) {
            periodBtn.textContent = appData.currentPeriod.title;
        }
        
        // Автосохранение
        saveAllData();
        
        updateAllCalculations();
        closePeriodModal();
    }
}

// Инициализация диаграмм
function initializeCharts() {
    // Здесь может быть инициализация Chart.js или других библиотек
    // Пока просто заглушка
}

function updateCharts() {
    // Обновление диаграмм при переключении на вкладку аналитики
}

// Календарь активности
function initializeCalendarHeatmap() {
    const container = document.getElementById('calendarHeatmap');
    if (!container) return;

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    let html = '';
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayExpenses = appData.currentPeriod.dailyExpenses
            .filter(expense => expense.date === dateStr)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        // Определяем уровень активности (0-4)
        let level = 0;
        if (dayExpenses > 0) {
            if (dayExpenses < 500) level = 1;
            else if (dayExpenses < 1500) level = 2;
            else if (dayExpenses < 3000) level = 3;
            else level = 4;
        }
        
        html += `
            <div class="calendar-day" 
                 data-level="${level}" 
                 title="${currentDate.getDate()} ${currentDate.toLocaleString('ru-RU', { month: 'long' })}: ${formatCurrency(dayExpenses)}">
                ${currentDate.getDate()}
            </div>
        `;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }

    container.innerHTML = html;
}

// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ АВТОСОХРАНЕНИЯ
// Экспорт данных (для резервного копирования)
function exportData() {
    const dataToExport = {
        currentPeriod: appData.currentPeriod,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `personal-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Импорт данных (для восстановления)
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.currentPeriod) {
                appData.currentPeriod = importedData.currentPeriod;
                saveAllData(); // Сохраняем импортированные данные
                
                // Обновляем интерфейс
                loadInitialData();
                updateAllCalculations();
                
                console.log('Данные успешно импортированы');
            }
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
        }
    };
    reader.readAsText(file);
}

// Очистка всех данных (с подтверждением)
function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие необратимо!')) {
        localStorage.clear();
        
        // Сбрасываем к начальным значениям
        appData.currentPeriod.incomes = [];
        appData.currentPeriod.fixedExpenses = [];
        appData.currentPeriod.dailyExpenses = [];
        appData.currentPeriod.savingsPercentage = 20;
        
        // Обновляем интерфейс
        loadInitialData();
        updateAllCalculations();
        
        console.log('Все данные очищены');
    }
}

// Автосохранение при закрытии страницы
window.addEventListener('beforeunload', function(e) {
    saveAllData();
    console.log('Данные сохранены при закрытии страницы');
});

// Автосохранение каждую минуту (резервное сохранение)
setInterval(function() {
    saveAllData();
    console.log('Автоматическое резервное сохранение выполнено');
}, 60000); // 60 секунд

// Вспомогательные функции
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
    }).format(amount).replace('₽', '₽');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
}

function getCategoryName(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Прочее';
}

function getCategoryIcon(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📋';
}

function getCategoryColor(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#95A5A6';
}

// Функции уведомлений отключены
function showToast(message, type = 'info') {
    // Все уведомления отключены согласно требованиям
    return;
}