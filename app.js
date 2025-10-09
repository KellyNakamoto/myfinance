// Глобальные переменные и данные приложения
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

// Состояние для скрытия шапки при прокрутке
let lastScrollY = window.scrollY;
let ticking = false;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeHeaderScroll();
    initializeScrollToTop();
    loadSavedData();
    loadInitialData();
    updateAllCalculations();
    initializeCharts();
    initializeCalendarHeatmap();
    // Убираем показ toast при загрузке
    // showToast('Приложение загружено. Добро пожаловать!', 'success');
});

// Инициализация скрытия шапки при прокрутке
function initializeHeaderScroll() {
    const header = document.getElementById('compactHeader');
    
    function updateHeaderVisibility() {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Прокрутка вниз - скрываем шапку
            header.style.transform = 'translateY(-100%)';
        } else {
            // Прокрутка вверх - показываем шапку
            header.style.transform = 'translateY(0)';
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

    window.addEventListener('scroll', requestTick);
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
    
    window.addEventListener('scroll', toggleScrollButton);
}

// Функция прокрутки наверх
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Загрузка сохраненных данных
function loadSavedData() {
    // Загружаем процент сбережений
    const savedSavingsPercentage = localStorage.getItem('savingsPercentage');
    if (savedSavingsPercentage) {
        appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
        const slider = document.getElementById('savingsPercentage');
        const display = document.getElementById('savingsPercentageDisplay');
        if (slider) slider.value = savedSavingsPercentage;
        if (display) display.textContent = savedSavingsPercentage;
    }
    
    // Загружаем даты планирования
    const savedStartDate = localStorage.getItem('planningStartDate');
    const savedEndDate = localStorage.getItem('planningEndDate');
    if (savedStartDate) {
        appData.currentPeriod.startDate = savedStartDate;
        const startInput = document.getElementById('startDate');
        if (startInput) startInput.value = savedStartDate;
    }
    if (savedEndDate) {
        appData.currentPeriod.endDate = savedEndDate;
        const endInput = document.getElementById('endDate');
        if (endInput) endInput.value = savedEndDate;
    }
}

// Автосохранение процента сбережений
function saveSavingsPercentage(value) {
    localStorage.setItem('savingsPercentage', value);
    appData.currentPeriod.savingsPercentage = parseInt(value);
    updateAllCalculations();
}

// Автосохранение периода планирования
function savePlanningPeriod() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate) {
        localStorage.setItem('planningStartDate', startDate);
        appData.currentPeriod.startDate = startDate;
    }
    if (endDate) {
        localStorage.setItem('planningEndDate', endDate);
        appData.currentPeriod.endDate = endDate;
    }
    
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
    const currentSavings = totalIncome * 0.65 * appData.currentPeriod.savingsPercentage / 100; // Текущие сбережения (65% месяца прошло)
    const savingsProgress = (currentSavings / totalSavings) * 100;
    const savingsProgressBar = document.getElementById('savingsProgress');
    if (savingsProgressBar) {
        savingsProgressBar.style.width = `${Math.min(savingsProgress, 100)}%`;
    }
    
    updateElement('savingsGoal', formatCurrency(totalSavings));
    updateElement('savingsProgressText', `${formatCurrency(currentSavings)} из ${formatCurrency(totalSavings)}`);
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
        // Убираем toast уведомления
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
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    renderIncomes();
    updateAllCalculations();
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;

    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<div class="empty-state">Пока нет доходов</div>';
        return;
    }

    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-name">${income.name}</div>
                <div class="item-amount">${formatCurrency(income.amount)}</div>
                <div class="item-category">${getCategoryName(income.category)} • ${formatDate(income.date)}</div>
            </div>
            <div class="item-actions">
                <button onclick="removeIncome(${income.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Управление обязательными расходами
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

    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category)
    };

    appData.currentPeriod.fixedExpenses.push(newExpense);

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'housing';

    renderFixedExpenses();
    updateAllCalculations();
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    renderFixedExpenses();
    updateAllCalculations();
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpensesList');
    if (!container) return;

    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Пока нет обязательных расходов</div>';
        return;
    }

    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-name">${expense.icon} ${expense.name}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${getCategoryName(expense.category)}</div>
            </div>
            <div class="item-actions">
                <button onclick="removeFixedExpense(${expense.id})" class="action-btn danger">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Управление ежедневными тратами
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

    const newExpense = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        description: title,
        category: category,
        predicted: false
    };

    appData.currentPeriod.dailyExpenses.push(newExpense);

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';

    renderDailyExpenses();
    updateAllCalculations();
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    renderDailyExpenses();
    updateAllCalculations();
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    const allContainer = document.getElementById('allDailyExpenses');
    
    const sortedExpenses = appData.currentPeriod.dailyExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const recentExpenses = sortedExpenses.slice(0, 5);

    const expenseHTML = (expenses) => expenses.map(expense => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-name">${getCategoryIcon(expense.category)} ${expense.description}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${getCategoryName(expense.category)} • ${formatDate(expense.date)}</div>
            </div>
            <div class="item-actions">
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
        allContainer.innerHTML = sortedExpenses.length === 0 
            ? '<div class="empty-state">Пока нет ежедневных трат</div>'
            : expenseHTML(sortedExpenses);
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

// Управление периодом
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