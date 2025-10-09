// УЛУЧШЕННЫЙ JAVASCRIPT ДЛЯ ФИНАНСОВОГО ПРИЛОЖЕНИЯ

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
        {id: "food", name: "Еда", icon: "🍽️", color: "#FF6B35", keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин", "макдональдс", "пицца", "кофе"]},
        {id: "transport", name: "Транспорт", icon: "🚗", color: "#4ECDC4", keywords: ["такси", "автобус", "метро", "бензин", "парковка", "uber", "яндекс.такси"]},
        {id: "entertainment", name: "Развлечения", icon: "🎬", color: "#45B7D1", keywords: ["кино", "концерт", "игры", "развлечения", "театр", "клуб"]},
        {id: "shopping", name: "Покупки", icon: "🛍️", color: "#F39C12", keywords: ["одежда", "обувь", "техника", "покупки", "магазин", "wildberries", "ozon"]},
        {id: "housing", name: "Жилье", icon: "🏠", color: "#E74C3C", keywords: ["квартира", "аренда", "коммунальные", "дом", "жкх"]},
        {id: "utilities", name: "Коммунальные", icon: "📡", color: "#9B59B6", keywords: ["интернет", "телефон", "электричество", "газ", "вода"]},
        {id: "health", name: "Здоровье", icon: "⚕️", color: "#27AE60", keywords: ["врач", "лекарства", "аптека", "больница", "медицина"]},
        {id: "other", name: "Прочее", icon: "📋", color: "#95A5A6", keywords: []}
    ]
};

// Переменная для отслеживания редактирования
let editingState = {
    mode: null,
    itemId: null,
    originalData: null
};

// Состояние для скрытия шапки при прокрутке
let lastScrollY = window.scrollY;
let ticking = false;

// Telegram WebApp integration
let tg = null;

// =============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeTelegramWebApp();
    initializeTabs();
    initializeHeaderScroll();
    initializeScrollToTop();
    loadAllSavedData();
    initializeDefaultData();
    loadInitialData();
    updateAllCalculations();
    initializeCalendarHeatmap();
    initializeCurrentDate();
    animateNumbersOnLoad();
});

// =============================================
// TELEGRAM WEBAPP ИНТЕГРАЦИЯ
// =============================================

function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Применяем тему Telegram
        document.body.classList.add('tg-viewport');
        
        // Настраиваем цвета под тему Telegram
        if (tg.themeParams) {
            const root = document.documentElement;
            if (tg.themeParams.bg_color) {
                root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
            }
            if (tg.themeParams.text_color) {
                root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
            }
        }
        
        console.log('Telegram WebApp инициализирован');
    }
}

// =============================================
// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ КАТЕГОРИЙ
// =============================================

function suggestCategory(description) {
    const words = description.toLowerCase().split(' ');
    
    for (const category of appData.categories) {
        for (const keyword of category.keywords) {
            if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
                return category.id;
            }
        }
    }
    
    return 'other';
}

// =============================================
// АНИМАЦИИ И ВИЗУАЛЬНЫЕ ЭФФЕКТЫ
// =============================================

function animateNumber(element, finalNumber, duration = 1000) {
    if (!element) return;
    
    let startNumber = 0;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function для плавности
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = startNumber + (finalNumber - startNumber) * easeOutQuart;
        
        element.textContent = formatCurrency(Math.floor(currentNumber));
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = formatCurrency(finalNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function animateNumbersOnLoad() {
    setTimeout(() => {
        const elements = [
            {id: 'totalIncome', delay: 0},
            {id: 'totalSpent', delay: 200},
            {id: 'totalSavings', delay: 400},
            {id: 'remainingBudget', delay: 600},
            {id: 'dailyBudget', delay: 800}
        ];
        
        elements.forEach(item => {
            setTimeout(() => {
                const element = document.getElementById(item.id);
                if (element) {
                    const value = parseFloat(element.textContent.replace(/[^\d]/g, '')) || 0;
                    element.textContent = '0 ₽';
                    animateNumber(element, value, 800);
                }
            }, item.delay);
        });
    }, 500);
}

// =============================================
// УЛУЧШЕННЫЕ БЫСТРЫЕ ФОРМЫ
// =============================================

function showQuickExpense() {
    const overlay = document.getElementById('quickExpenseOverlay');
    if (overlay) {
        overlay.classList.add('active');
        
        // Автофокус на первое поле с задержкой для анимации
        setTimeout(() => {
            const titleInput = document.getElementById('quickExpenseTitle');
            if (titleInput) titleInput.focus();
        }, 300);
    }
}

function showQuickIncome() {
    const overlay = document.getElementById('quickIncomeOverlay');
    if (overlay) {
        overlay.classList.add('active');
        
        setTimeout(() => {
            const titleInput = document.getElementById('quickIncomeTitle');
            if (titleInput) titleInput.focus();
        }, 300);
    }
}

function hideQuickForm(type) {
    const overlayId = type === 'expense' ? 'quickExpenseOverlay' : 'quickIncomeOverlay';
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.classList.remove('active');
        
        // Очистка полей
        setTimeout(() => {
            const prefix = type === 'expense' ? 'quickExpense' : 'quickIncome';
            const titleInput = document.getElementById(`${prefix}Title`);
            const amountInput = document.getElementById(`${prefix}Amount`);
            const categorySelect = document.getElementById(`${prefix}Category`);
            
            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            if (categorySelect) categorySelect.selectedIndex = 0;
        }, 300);
    }
}

function addQuickExpense() {
    const titleInput = document.getElementById('quickExpenseTitle');
    const amountInput = document.getElementById('quickExpenseAmount');
    const categorySelect = document.getElementById('quickExpenseCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    // Автоматическое определение категории если не выбрана
    const suggestedCategory = title ? suggestCategory(title) : category;
    
    if (!title || !amount || amount <= 0) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    const newExpense = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        description: title,
        category: suggestedCategory,
        predicted: false
    };
    
    appData.currentPeriod.dailyExpenses.push(newExpense);
    saveAllData();
    
    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
    
    hideQuickForm('expense');
    showNotification('Трата добавлена!', 'success');
}

function addQuickIncome() {
    const titleInput = document.getElementById('quickIncomeTitle');
    const amountInput = document.getElementById('quickIncomeAmount');
    const categorySelect = document.getElementById('quickIncomeCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    if (!title || !amount || amount <= 0) {
        showNotification('Заполните все поля', 'warning');
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
    saveAllData();
    
    renderIncomes();
    renderRecentTransactions();
    updateAllCalculations();
    
    hideQuickForm('income');
    showNotification('Доход добавлен!', 'success');
}

// =============================================
// УВЕДОМЛЕНИЯ И ОБРАТНАЯ СВЯЗЬ
// =============================================

function showNotification(message, type = 'info') {
    // Простые уведомления без лишних библиотек
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        background: var(--color-surface);
        color: var(--color-text);
        padding: 12px 20px;
        border-radius: 12px;
        border: 1px solid var(--tg-border);
        box-shadow: var(--shadow-lg);
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Цвета в зависимости от типа
    if (type === 'success') {
        notification.style.borderColor = 'var(--color-income)';
        notification.style.background = 'var(--color-income-bg)';
    } else if (type === 'warning') {
        notification.style.borderColor = 'var(--color-warning)';
        notification.style.background = 'var(--color-warning-bg)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--color-expense)';
        notification.style.background = 'var(--color-expense-bg)';
    }
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// =============================================
// ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ВКЛАДКАМИ
// =============================================

function switchTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Убираем активные классы
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Активируем нужную вкладку
    const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetButton) targetButton.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
    
    // Прокручиваем наверх при смене вкладки
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// РЕНДЕР ПОСЛЕДНИХ ОПЕРАЦИЙ
// =============================================

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    // Объединяем все операции
    const allTransactions = [];
    
    // Добавляем доходы
    appData.currentPeriod.incomes.forEach(income => {
        allTransactions.push({
            type: 'income',
            id: income.id,
            date: income.date,
            name: income.name,
            amount: income.amount,
            category: income.category,
            icon: '💰'
        });
    });
    
    // Добавляем ежедневные траты
    appData.currentPeriod.dailyExpenses.forEach(expense => {
        allTransactions.push({
            type: 'expense',
            id: expense.id,
            date: expense.date,
            name: expense.description,
            amount: expense.amount,
            category: expense.category,
            icon: getCategoryIcon(expense.category)
        });
    });
    
    // Сортируем по дате (новые сначала)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Берем последние 5
    const recentTransactions = allTransactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<div class="empty-state">Операций пока нет</div>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="recent-item ${transaction.type}">
            <div class="item-info">
                <div class="item-name">${transaction.icon} ${transaction.name}</div>
                <div class="item-meta">${getCategoryName(transaction.category)} • ${formatDate(transaction.date)}</div>
            </div>
            <div class="item-amount" style="color: var(--color-${transaction.type === 'income' ? 'income' : 'expense'})">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

// =============================================
// ОБНОВЛЕНИЕ ДАТЫ И ВРЕМЕНИ
// =============================================

function initializeCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = `Сегодня, ${now.toLocaleDateString('ru-RU', options)}`;
    }
}

// =============================================
// УЛУЧШЕННЫЙ ПРОГРЕСС ДНЕВНОГО БЮДЖЕТА
// =============================================

function updateBudgetProgress(spentAmount, totalBudget) {
    const progressRing = document.getElementById('budgetProgressRing');
    if (progressRing && totalBudget > 0) {
        const progress = Math.min((spentAmount / totalBudget) * 100, 100);
        progressRing.style.setProperty('--progress', progress);
        
        // Меняем цвет в зависимости от прогресса
        let color = 'var(--color-primary)';
        if (progress > 100) {
            color = 'var(--color-expense)';
        } else if (progress > 80) {
            color = 'var(--color-warning)';
        } else if (progress > 60) {
            color = 'var(--color-warning)';
        }
        
        progressRing.style.background = `conic-gradient(${color} calc(${progress} * 3.6deg), rgba(255, 255, 255, 0.1) 0)`;
    }
}

// =============================================
// DEBOUNCED АВТОСОХРАНЕНИЕ
// =============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced версия сохранения
const debouncedSave = debounce(saveAllData, 500);

// =============================================
// ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ДАННЫХ ПО УМОЛЧАНИЮ
// =============================================

function initializeDefaultData() {
    const today = new Date();
    
    if (!appData.currentPeriod.startDate || isNaN(new Date(appData.currentPeriod.startDate).getTime())) {
        appData.currentPeriod.startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0];
        console.log('Установлена начальная дата по умолчанию:', appData.currentPeriod.startDate);
    }
    
    if (!appData.currentPeriod.endDate || isNaN(new Date(appData.currentPeriod.endDate).getTime())) {
        appData.currentPeriod.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString().split('T')[0];
        console.log('Установлена конечная дата по умолчанию:', appData.currentPeriod.endDate);
    }
    
    if (isNaN(appData.currentPeriod.savingsPercentage) || appData.currentPeriod.savingsPercentage < 0) {
        appData.currentPeriod.savingsPercentage = 20;
    }
    
    if (!Array.isArray(appData.currentPeriod.incomes)) {
        appData.currentPeriod.incomes = [];
    }
    
    if (!Array.isArray(appData.currentPeriod.fixedExpenses)) {
        appData.currentPeriod.fixedExpenses = [];
    }
    
    if (!Array.isArray(appData.currentPeriod.dailyExpenses)) {
        appData.currentPeriod.dailyExpenses = [];
    }
    
    console.log('Данные по умолчанию инициализированы');
}

// =============================================
// СИСТЕМА АВТОСОХРАНЕНИЯ
// =============================================

function loadAllSavedData() {
    console.log('Загрузка сохраненных данных...');
    
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
    
    const savedIncomes = localStorage.getItem('appData_incomes');
    if (savedIncomes) {
        try {
            appData.currentPeriod.incomes = JSON.parse(savedIncomes);
            console.log('Загружены доходы:', appData.currentPeriod.incomes.length);
        } catch (e) {
            console.error('Ошибка загрузки доходов:', e);
        }
    }
    
    const savedFixedExpenses = localStorage.getItem('appData_fixedExpenses');
    if (savedFixedExpenses) {
        try {
            appData.currentPeriod.fixedExpenses = JSON.parse(savedFixedExpenses);
            console.log('Загружены обязательные расходы:', appData.currentPeriod.fixedExpenses.length);
        } catch (e) {
            console.error('Ошибка загрузки обязательных расходов:', e);
        }
    }
    
    const savedDailyExpenses = localStorage.getItem('appData_dailyExpenses');
    if (savedDailyExpenses) {
        try {
            appData.currentPeriod.dailyExpenses = JSON.parse(savedDailyExpenses);
            console.log('Загружены ежедневные траты:', appData.currentPeriod.dailyExpenses.length);
        } catch (e) {
            console.error('Ошибка загрузки ежедневных трат:', e);
        }
    }
    
    const savedSavingsPercentage = localStorage.getItem('appData_savingsPercentage');
    if (savedSavingsPercentage) {
        appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
        console.log('Загружен процент сбережений:', appData.currentPeriod.savingsPercentage);
    }
    
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

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Сохранено в ${key}:`, data);
    } catch (e) {
        console.error(`Ошибка сохранения ${key}:`, e);
    }
}

function saveAllData() {
    const periodData = {
        id: appData.currentPeriod.id,
        title: appData.currentPeriod.title,
        startDate: appData.currentPeriod.startDate,
        endDate: appData.currentPeriod.endDate,
        savingsPercentage: appData.currentPeriod.savingsPercentage
    };
    saveToStorage('appData_currentPeriod', periodData);
    
    saveToStorage('appData_incomes', appData.currentPeriod.incomes);
    saveToStorage('appData_fixedExpenses', appData.currentPeriod.fixedExpenses);
    saveToStorage('appData_dailyExpenses', appData.currentPeriod.dailyExpenses);
    saveToStorage('appData_savingsPercentage', appData.currentPeriod.savingsPercentage);
    saveToStorage('appData_startDate', appData.currentPeriod.startDate);
    saveToStorage('appData_endDate', appData.currentPeriod.endDate);
}

// =============================================
// СКРЫТИЕ ШАПКИ ПРИ ПРОКРУТКЕ
// =============================================

function initializeHeaderScroll() {
    const header = document.getElementById('compactHeader');
    const navigation = document.getElementById('tabNavigation');
    
    function updateHeaderVisibility() {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            if (header) header.style.transform = 'translateY(-100%)';
            if (navigation) navigation.style.transform = 'translateY(-100%)';
        } else {
            if (header) header.style.transform = 'translateY(0)';
            if (navigation) navigation.style.transform = 'translateY(0)';
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

    window.addEventListener('scroll', requestTick, { passive: true });
    document.addEventListener('touchmove', requestTick, { passive: true });
}

function initializeScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    
    function toggleScrollButton() {
        if (scrollBtn) {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }
    }
    
    window.addEventListener('scroll', toggleScrollButton, { passive: true });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// =============================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ
// =============================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });
}

function scrollTabs(direction) {
    const container = document.getElementById('tabsContainer');
    if (container) {
        const scrollAmount = 200;
        
        if (direction === -1) {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
}

// =============================================
// ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ
// =============================================

function loadInitialData() {
    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
    renderArchive();
    renderRecentTransactions();

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    const savingsDisplay = document.getElementById('savingsPercentageDisplay');

    if (startDateInput) startDateInput.value = appData.currentPeriod.startDate;
    if (endDateInput) endDateInput.value = appData.currentPeriod.endDate;
    if (savingsInput) savingsInput.value = appData.currentPeriod.savingsPercentage;
    if (savingsDisplay) savingsDisplay.textContent = appData.currentPeriod.savingsPercentage;
}

// =============================================
// УЛУЧШЕННАЯ ФУНКЦИЯ РАСЧЕТОВ
// =============================================

function updateAllCalculations() {
    console.log('Начинаем расчеты...');
    
    const totalIncome = appData.currentPeriod.incomes.reduce((sum, income) => {
        const amount = parseFloat(income.amount) || 0;
        return sum + amount;
    }, 0);
    
    const totalFixed = appData.currentPeriod.fixedExpenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount) || 0;
        return sum + amount;
    }, 0);
    
    const savingsPercentage = parseFloat(appData.currentPeriod.savingsPercentage) || 0;
    const totalSavings = (totalIncome * savingsPercentage) / 100;
    
    const totalDailyExpenses = appData.currentPeriod.dailyExpenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount) || 0;
        return sum + amount;
    }, 0);
    
    const totalSpent = totalFixed + totalDailyExpenses;
    const remainingBudget = totalIncome - totalSpent - totalSavings;

    // Расчет дневного бюджета
    let dailyBudget = 0;
    
    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const endDate = new Date(appData.currentPeriod.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('Некорректные даты периода, используем значения по умолчанию');
            const today = new Date();
            startDate.setTime(new Date(today.getFullYear(), today.getMonth(), 1).getTime());
            endDate.setTime(new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime());
        }
        
        const timeDiff = endDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        
        console.log('Расчет дней:', { 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString(), 
            totalDays, 
            remainingBudget 
        });
        
        if (totalDays > 0 && remainingBudget >= 0) {
            dailyBudget = remainingBudget / totalDays;
        } else {
            dailyBudget = 0;
        }
        
    } catch (error) {
        console.error('Ошибка при расчете дневного бюджета:', error);
        dailyBudget = 0;
    }

    // Траты сегодня
    let todaySpent = 0;
    let todayRemaining = dailyBudget;
    let todayProgress = 0;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
        todaySpent = todayExpenses.reduce((sum, expense) => {
            const amount = parseFloat(expense.amount) || 0;
            return sum + amount;
        }, 0);
        
        todayRemaining = Math.max(dailyBudget - todaySpent, 0);
        
        if (dailyBudget > 0) {
            todayProgress = Math.min((todaySpent / dailyBudget) * 100, 100);
        } else {
            todayProgress = todaySpent > 0 ? 100 : 0;
        }
        
    } catch (error) {
        console.error('Ошибка при расчете сегодняшних трат:', error);
    }

    console.log('Финальные расчеты:', {
        totalIncome,
        totalSpent,
        remainingBudget,
        dailyBudget,
        todaySpent,
        todayProgress
    });

    // Обновляем UI
    updateElement('totalIncome', formatCurrency(totalIncome));
    updateElement('totalSpent', formatCurrency(totalSpent));
    updateElement('totalSavings', formatCurrency(totalSavings));
    updateElement('remainingBudget', formatCurrency(remainingBudget));
    updateElement('dailyBudget', formatCurrency(dailyBudget));
    updateElement('todaySpent', formatCurrency(todaySpent));
    updateElement('todayRemaining', formatCurrency(todayRemaining));

    // Обновляем прогресс бюджета
    updateBudgetProgress(todaySpent, dailyBudget);

    // Обновляем прогресс сбережений
    let savingsProgress = 0;
    let currentSavings = 0;
    
    try {
        if (totalIncome > 0 && savingsPercentage > 0) {
            const monthProgress = 0.65;
            currentSavings = totalSavings * monthProgress;
            savingsProgress = totalSavings > 0 ? (currentSavings / totalSavings) * 100 : 0;
        }
    } catch (error) {
        console.error('Ошибка при расчете прогресса сбережений:', error);
    }
    
    const savingsProgressBar = document.getElementById('savingsProgress');
    if (savingsProgressBar) {
        const progressValue = isNaN(savingsProgress) ? 0 : Math.min(savingsProgress, 100);
        savingsProgressBar.style.width = `${progressValue}%`;
    }
    
    updateElement('savingsGoal', formatCurrency(totalSavings));
    updateElement('savingsProgressText', `${formatCurrency(currentSavings)} из ${formatCurrency(totalSavings)}`);
}

// =============================================
// УПРАВЛЕНИЕ ДОХОДАМИ (все остальные функции остаются без изменений)
// =============================================

function saveSavingsPercentage(value) {
    appData.currentPeriod.savingsPercentage = parseInt(value);
    debouncedSave();
    updateAllCalculations();
}

function savePlanningPeriod() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate && startDate.value) {
        appData.currentPeriod.startDate = startDate.value;
    }
    if (endDate && endDate.value) {
        appData.currentPeriod.endDate = endDate.value;
    }
    
    debouncedSave();
    updateAllCalculations();
}

function addIncome() {
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');

    if (!titleInput || !amountInput || !categorySelect) return;

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!title || !amount || amount <= 0) {
        showNotification('Заполните все поля', 'warning');
        return;
    }

    if (editingState.mode === 'income' && editingState.itemId) {
        const incomeIndex = appData.currentPeriod.incomes.findIndex(inc => inc.id === editingState.itemId);
        if (incomeIndex !== -1) {
            appData.currentPeriod.incomes[incomeIndex] = {
                ...appData.currentPeriod.incomes[incomeIndex],
                name: title,
                amount: amount,
                category: category
            };
        }
        
        cancelEdit();
        const button = document.querySelector('[onclick="addIncome()"]');
        if (button) button.textContent = 'Добавить доход';
        showNotification('Доход обновлен', 'success');
    } else {
        const newIncome = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split('T')[0]
        };

        appData.currentPeriod.incomes.push(newIncome);
        showNotification('Доход добавлен', 'success');
    }

    debouncedSave();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'work';

    renderIncomes();
    renderRecentTransactions();
    updateAllCalculations();
}

function editIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    editingState.mode = 'income';
    editingState.itemId = id;
    editingState.originalData = { ...income };

    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');

    if (titleInput) titleInput.value = income.name;
    if (amountInput) amountInput.value = income.amount;
    if (categorySelect) categorySelect.value = income.category;

    const button = document.querySelector('[onclick="addIncome()"]');
    if (button) button.textContent = 'Сохранить изменения';

    if (titleInput) {
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInput.focus();
    }
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    if (confirm(`Удалить доход "${income.name}"?`)) {
        appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
        
        debouncedSave();
        renderIncomes();
        renderRecentTransactions();
        updateAllCalculations();
        
        showNotification('Доход удален', 'success');
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
                <div class="item-name">💰 ${income.name}</div>
                <div class="item-amount" style="color: var(--color-income)">${formatCurrency(income.amount)}</div>
                <div class="item-category">${getCategoryName(income.category)} • ${formatDate(income.date)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editIncome(${income.id})" class="action-btn edit">Изменить</button>
                <button onclick="removeIncome(${income.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// =============================================
// УПРАВЛЕНИЕ ОБЯЗАТЕЛЬНЫМИ РАСХОДАМИ
// =============================================

function addFixedExpense() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    if (!titleInput || !amountInput || !categorySelect) return;

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!title || !amount || amount <= 0) {
        showNotification('Заполните все поля', 'warning');
        return;
    }

    if (editingState.mode === 'fixed' && editingState.itemId) {
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
        
        cancelEdit();
        const button = document.querySelector('[onclick="addFixedExpense()"]');
        if (button) button.textContent = 'Добавить расход';
        showNotification('Расход обновлен', 'success');
    } else {
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            icon: getCategoryIcon(category),
            color: getCategoryColor(category)
        };

        appData.currentPeriod.fixedExpenses.push(newExpense);
        showNotification('Расход добавлен', 'success');
    }

    debouncedSave();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'housing';

    renderFixedExpenses();
    updateAllCalculations();
}

function editFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    editingState.mode = 'fixed';
    editingState.itemId = id;
    editingState.originalData = { ...expense };

    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    if (titleInput) titleInput.value = expense.name;
    if (amountInput) amountInput.value = expense.amount;
    if (categorySelect) categorySelect.value = expense.category;

    const button = document.querySelector('[onclick="addFixedExpense()"]');
    if (button) button.textContent = 'Сохранить изменения';

    if (titleInput) {
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInput.focus();
    }
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    if (confirm(`Удалить расход "${expense.name}"?`)) {
        appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
        
        debouncedSave();
        renderFixedExpenses();
        updateAllCalculations();
        
        showNotification('Расход удален', 'success');
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
                <div class="item-amount" style="color: var(--color-expense)">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${getCategoryName(expense.category)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editFixedExpense(${expense.id})" class="action-btn edit">Изменить</button>
                <button onclick="removeFixedExpense(${expense.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// =============================================
// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ТРАТАМИ
// =============================================

function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');

    if (!titleInput || !amountInput || !categorySelect) return;

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    // Автоматическое определение категории
    const suggestedCategory = title ? suggestCategory(title) : category;

    if (!title || !amount || amount <= 0) {
        showNotification('Заполните все поля', 'warning');
        return;
    }

    if (editingState.mode === 'daily' && editingState.itemId) {
        const expenseIndex = appData.currentPeriod.dailyExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.dailyExpenses[expenseIndex] = {
                ...appData.currentPeriod.dailyExpenses[expenseIndex],
                description: title,
                amount: amount,
                category: suggestedCategory
            };
        }
        
        cancelEdit();
        const button = document.querySelector('[onclick="addDailyExpense()"]');
        if (button) button.textContent = 'Добавить трату';
        showNotification('Трата обновлена', 'success');
    } else {
        const newExpense = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            description: title,
            category: suggestedCategory,
            predicted: false
        };

        appData.currentPeriod.dailyExpenses.push(newExpense);
        showNotification('Трата добавлена', 'success');
    }

    debouncedSave();

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';

    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
}

function editDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    editingState.mode = 'daily';
    editingState.itemId = id;
    editingState.originalData = { ...expense };

    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');

    if (titleInput) titleInput.value = expense.description;
    if (amountInput) amountInput.value = expense.amount;
    if (categorySelect) categorySelect.value = expense.category;

    const button = document.querySelector('[onclick="addDailyExpense()"]');
    if (button) button.textContent = 'Сохранить изменения';

    if (titleInput) {
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInput.focus();
    }
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    if (confirm(`Удалить трату "${expense.description}"?`)) {
        appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
        
        debouncedSave();
        renderDailyExpenses();
        renderRecentTransactions();
        updateAllCalculations();
        
        showNotification('Трата удалена', 'success');
    }
}

function cancelEdit() {
    editingState.mode = null;
    editingState.itemId = null;
    editingState.originalData = null;
    
    const incomeBtn = document.querySelector('[onclick="addIncome()"]');
    const fixedBtn = document.querySelector('[onclick="addFixedExpense()"]');
    const dailyBtn = document.querySelector('[onclick="addDailyExpense()"]');
    
    if (incomeBtn) incomeBtn.textContent = 'Добавить доход';
    if (fixedBtn) fixedBtn.textContent = 'Добавить расход';
    if (dailyBtn) dailyBtn.textContent = 'Добавить трату';
    
    const forms = ['incomeTitle', 'incomeAmount', 'expenseTitle', 'expenseAmount', 'dailyExpenseTitle', 'dailyExpenseAmount'];
    forms.forEach(formId => {
        const element = document.getElementById(formId);
        if (element) element.value = '';
    });
    
    const categorySelects = ['incomeCategory', 'expenseCategory', 'dailyExpenseCategory'];
    categorySelects.forEach((selectId, index) => {
        const element = document.getElementById(selectId);
        if (element) {
            const defaultValues = ['work', 'housing', 'food'];
            element.value = defaultValues[index];
        }
    });
    
    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
}

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
                <div class="item-amount" style="color: var(--color-expense)">${formatCurrency(expense.amount)}</div>
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

// =============================================
// УПРАВЛЕНИЕ АРХИВОМ И ПЕРИОДАМИ
// =============================================

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
    console.log('Loading period:', period);
}

function updateSavingsPercentage(value) {
    const display = document.getElementById('savingsPercentageDisplay');
    if (display) {
        display.textContent = value;
    }
    appData.currentPeriod.savingsPercentage = parseInt(value);
    updateAllCalculations();
}

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
        
        const startDate = new Date(startInput.value);
        const month = startDate.toLocaleString('ru-RU', { month: 'long' });
        const year = startDate.getFullYear();
        appData.currentPeriod.title = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        
        const periodBtn = document.querySelector('.current-period');
        if (periodBtn) {
            periodBtn.textContent = appData.currentPeriod.title;
        }
        
        debouncedSave();
        updateAllCalculations();
        closePeriodModal();
    }
}

// =============================================
// КАЛЕНДАРЬ АКТИВНОСТИ
// =============================================

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

// =============================================
// РЕЗЕРВНОЕ КОПИРОВАНИЕ И ЭКСПОРТ
// =============================================

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
    
    showNotification('Данные экспортированы', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.currentPeriod) {
                appData.currentPeriod = importedData.currentPeriod;
                debouncedSave();
                
                loadInitialData();
                updateAllCalculations();
                
                showNotification('Данные успешно импортированы', 'success');
                console.log('Данные успешно импортированы');
            }
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            showNotification('Ошибка импорта данных', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие необратимо!')) {
        localStorage.clear();
        
        appData.currentPeriod.incomes = [];
        appData.currentPeriod.fixedExpenses = [];
        appData.currentPeriod.dailyExpenses = [];
        appData.currentPeriod.savingsPercentage = 20;
        
        loadInitialData();
        updateAllCalculations();
        
        showNotification('Все данные очищены', 'success');
        console.log('Все данные очищены');
    }
}

// =============================================
// АВТОСОХРАНЕНИЕ
// =============================================

window.addEventListener('beforeunload', function(e) {
    saveAllData();
    console.log('Данные сохранены при закрытии страницы');
});

setInterval(function() {
    saveAllData();
    console.log('Автоматическое резервное сохранение выполнено');
}, 60000);

// =============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================

function updateElement(id, value) {
    try {
        const element = document.getElementById(id);
        if (element) {
            const displayValue = String(value).includes('NaN') ? '0 ₽' : value;
            element.textContent = displayValue;
            console.log(`Обновлен элемент ${id}:`, displayValue);
        } else {
            console.warn(`Элемент с ID "${id}" не найден`);
        }
    } catch (error) {
        console.error(`Ошибка обновления элемента ${id}:`, error);
    }
}

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return '0 ₽';
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return '0 ₽';
    }
    
    try {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount);
    } catch (error) {
        console.error('Ошибка форматирования валюты:', error);
        return `${Math.round(numAmount)} ₽`;
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Неверная дата';
        }
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    } catch (error) {
        console.error('Ошибка форматирования даты:', error);
        return 'Неверная дата';
    }
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

// =============================================
// КЛАВИАТУРНЫЕ SHORTCUTS
// =============================================

document.addEventListener('keydown', function(e) {
    // Ctrl+Enter - добавить быструю трату
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        showQuickExpense();
    }
    
    // Escape - скрыть формы или отменить редактирование
    if (e.key === 'Escape') {
        hideQuickForm('expense');
        hideQuickForm('income');
        cancelEdit();
    }
    
    // Ctrl+N - новая трата
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showQuickExpense();
    }
});

console.log('Приложение полностью загружено и готово к работе! 🚀');
