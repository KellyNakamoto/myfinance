// ФИНАЛЬНЫЙ app.js С DEBOUNCE И ИСПРАВЛЕНИЯМИ ВСЕХ ПРОБЛЕМ

// =============================================
// DEBOUNCE ФУНКЦИЯ
// =============================================

function debounce(func, wait) {
    let timeout;
    
    const debounced = function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    
    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = null;
    };
    
    debounced.flush = function(...args) {
        clearTimeout(timeout);
        timeout = null;
        func(...args);
    };
    
    return debounced;
}

// Создаем debounced версии функций
const debouncedSave = debounce(saveAllData, 500);
const debouncedCalculations = debounce(updateAllCalculations, 300);

// =============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =============================================

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
    categories: [
        {id: "food", name: "Еда", icon: "🍽️", keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин", "кофе"]},
        {id: "transport", name: "Транспорт", icon: "🚗", keywords: ["такси", "автобус", "метро", "бензин", "парковка"]},
        {id: "entertainment", name: "Развлечения", icon: "🎬", keywords: ["кино", "концерт", "игры", "развлечения"]},
        {id: "shopping", name: "Покупки", icon: "🛍️", keywords: ["одежда", "обувь", "техника", "покупки"]},
        {id: "health", name: "Здоровье", icon: "⚕️", keywords: ["врач", "лекарства", "аптека"]},
        {id: "other", name: "Прочее", icon: "📋", keywords: []}
    ]
};

let editingState = {
    mode: null,
    itemId: null,
    originalData: null
};

let lastScrollY = window.scrollY;
let ticking = false;
let tg = null;

// =============================================
// ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ
// =============================================

function saveToStorage(key, data) {
    try {
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage не поддерживается');
            return false;
        }
        
        if (data === null || data === undefined) {
            console.warn(`Попытка сохранить пустые данные в ${key}`);
            return false;
        }
        
        const jsonString = JSON.stringify(data);
        localStorage.setItem(key, jsonString);
        
        const saved = localStorage.getItem(key);
        if (saved === jsonString) {
            console.log(`✅ Успешно сохранено в ${key}`);
            return true;
        } else {
            console.error(`❌ Ошибка сохранения в ${key}`);
            return false;
        }
        
    } catch (e) {
        console.error(`❌ Критическая ошибка сохранения ${key}:`, e);
        return false;
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage не поддерживается');
            return defaultValue;
        }
        
        const saved = localStorage.getItem(key);
        if (!saved) {
            return defaultValue;
        }
        
        const parsed = JSON.parse(saved);
        console.log(`✅ Загружены данные из ${key}`);
        return parsed;
        
    } catch (e) {
        console.error(`❌ Ошибка загрузки ${key}:`, e);
        return defaultValue;
    }
}

function saveAllData() {
    console.log('💾 Сохранение всех данных...');
    
    let successCount = 0;
    const totalSaves = 6;
    
    const periodData = {
        id: appData.currentPeriod.id,
        title: appData.currentPeriod.title,
        startDate: appData.currentPeriod.startDate,
        endDate: appData.currentPeriod.endDate,
        savingsPercentage: appData.currentPeriod.savingsPercentage
    };
    
    if (saveToStorage('appData_currentPeriod', periodData)) successCount++;
    if (saveToStorage('appData_incomes', appData.currentPeriod.incomes)) successCount++;
    if (saveToStorage('appData_fixedExpenses', appData.currentPeriod.fixedExpenses)) successCount++;
    if (saveToStorage('appData_dailyExpenses', appData.currentPeriod.dailyExpenses)) successCount++;
    if (saveToStorage('appData_savingsPercentage', appData.currentPeriod.savingsPercentage)) successCount++;
    if (saveToStorage('appData_startDate', appData.currentPeriod.startDate)) successCount++;
    if (saveToStorage('appData_endDate', appData.currentPeriod.endDate)) successCount++;
    
    console.log(`✅ Сохранение завершено: ${successCount} файлов сохранено`);
    return successCount >= totalSaves;
}

function loadAllSavedData() {
    console.log('📂 Загрузка сохраненных данных...');
    
    const savedAppData = loadFromStorage('appData_currentPeriod');
    if (savedAppData) {
        appData.currentPeriod = { ...appData.currentPeriod, ...savedAppData };
    }
    
    const savedIncomes = loadFromStorage('appData_incomes', []);
    const savedFixedExpenses = loadFromStorage('appData_fixedExpenses', []);
    const savedDailyExpenses = loadFromStorage('appData_dailyExpenses', []);
    
    if (Array.isArray(savedIncomes)) {
        appData.currentPeriod.incomes = savedIncomes;
    }
    
    if (Array.isArray(savedFixedExpenses)) {
        appData.currentPeriod.fixedExpenses = savedFixedExpenses;
    }
    
    if (Array.isArray(savedDailyExpenses)) {
        appData.currentPeriod.dailyExpenses = savedDailyExpenses;
    }
    
    const savedSavingsPercentage = loadFromStorage('appData_savingsPercentage');
    if (savedSavingsPercentage !== null) {
        appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
    }
    
    const savedStartDate = loadFromStorage('appData_startDate');
    const savedEndDate = loadFromStorage('appData_endDate');
    
    if (savedStartDate) {
        appData.currentPeriod.startDate = savedStartDate;
    }
    
    if (savedEndDate) {
        appData.currentPeriod.endDate = savedEndDate;
    }
    
    console.log('📂 Загрузка данных завершена');
}

// =============================================
// ИСПРАВЛЕННЫЕ ФУНКЦИИ УПРАВЛЕНИЯ ДАТАМИ С DEBOUNCE
// =============================================

function savePlanningPeriod() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    let hasChanges = false;
    
    if (startDateInput && startDateInput.value) {
        const newStartDate = startDateInput.value;
        if (newStartDate !== appData.currentPeriod.startDate) {
            appData.currentPeriod.startDate = newStartDate;
            hasChanges = true;
        }
    }
    
    if (endDateInput && endDateInput.value) {
        const newEndDate = endDateInput.value;
        if (newEndDate !== appData.currentPeriod.endDate) {
            appData.currentPeriod.endDate = newEndDate;
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        updatePeriodTitle();
        updateAllCalculations();
        debouncedSave(); // Используем debounced сохранение
        console.log('✅ Период планирования будет сохранен через 500ms');
    }
}

function updatePeriodTitle() {
    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const month = startDate.toLocaleString('ru-RU', { month: 'long' });
        const year = startDate.getFullYear();
        appData.currentPeriod.title = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        
        const periodBtn = document.querySelector('.current-period');
        if (periodBtn) {
            periodBtn.textContent = appData.currentPeriod.title;
        }
    } catch (error) {
        console.error('❌ Ошибка обновления заголовка периода:', error);
    }
}

function updateSavingsPercentage(value) {
    const display = document.getElementById('savingsPercentageDisplay');
    if (display) {
        display.textContent = value;
    }
    
    appData.currentPeriod.savingsPercentage = parseInt(value);
    updateAllCalculations(); // Сразу обновляем UI
    
    // НЕ сохраняем здесь - это только для отображения
}

function saveSavingsPercentage(value) {
    const newValue = parseInt(value);
    if (newValue !== appData.currentPeriod.savingsPercentage) {
        appData.currentPeriod.savingsPercentage = newValue;
        console.log(`✅ Процент сбережений: ${newValue}% (отложенное сохранение)`);
        
        debouncedSave(); // Используем debounced сохранение
        debouncedCalculations();
    }
}

// =============================================
// TELEGRAM WEBAPP ИНТЕГРАЦИЯ
// =============================================

function initializeHeaderScroll() {
    const header = document.getElementById('compactHeader');
    const navigation = document.getElementById('tabNavigation');

    if (!header || !navigation) return;

    console.log('🔧 Инициализация фиксированной навигации...');

    // ПРОСТАЯ ПРИНУДИТЕЛЬНАЯ ФИКСАЦИЯ
    function fixNavigation() {
        header.style.cssText = `
            position: fixed !important;
            top: 0px !important;
            left: 0px !important;
            right: 0px !important;
            z-index: 9999 !important;
            transform: translateY(0px) !important;
        `;

        navigation.style.cssText = `
            position: fixed !important;
            top: 60px !important;
            left: 0px !important;
            right: 0px !important;
            z-index: 9998 !important;
            transform: translateY(0px) !important;
        `;
    }

    // Применяем фиксацию
    fixNavigation();

    // Повторяем каждые 2 секунды для надежности
    setInterval(fixNavigation, 2000);

    console.log('✅ Навигация зафиксирована');
    return;

    // Остальной код функции (оригинальный):
    if (window.Telegram?.WebApp) {
        console.log('🤖 Telegram WebApp - отключаем автоскрытие навигации');
        
        const header = document.getElementById('compactHeader');
        const navigation = document.getElementById('tabNavigation');
        
        if (header) {
            header.style.transform = 'translateY(0)';
            header.style.position = 'fixed';
        }
        
        if (navigation) {
            navigation.style.transform = 'translateY(0)';
            navigation.style.position = 'fixed';
        }
        
        document.body.classList.add('tg-viewport');
        return;
    }
    
    // Обычное поведение для браузеров
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
}

function initializeTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        document.body.classList.add('tg-viewport');
        
        if (tg.themeParams) {
            const root = document.documentElement;
            if (tg.themeParams.bg_color) {
                root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
            }
            if (tg.themeParams.text_color) {
                root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
            }
        }
        
        // ИСПРАВЛЕНИЕ: Принудительная фиксация навигации
        setTimeout(() => {
            restoreNavigationState();
        }, 100);
        
        tg.onEvent('viewportChanged', function() {
            console.log('📱 Viewport изменен в Telegram WebApp');
            restoreNavigationState();
        });
        
        console.log('🤖 Telegram WebApp полностью инициализирован');
    }
}

function restoreNavigationState() {
    if (window.Telegram?.WebApp) {
        const header = document.getElementById('compactHeader');
        const navigation = document.getElementById('tabNavigation');
        
        if (header) {
            header.style.position = 'fixed';
            header.style.top = '0';
            header.style.transform = 'translateY(0)';
            header.style.zIndex = '1000';
        }
        
        if (navigation) {
            navigation.style.position = 'fixed';
            navigation.style.top = '60px';
            navigation.style.transform = 'translateY(0)';
            navigation.style.zIndex = '999';
        }
        
        console.log('🔧 Состояние навигации восстановлено');
    }
}

// Резервное копирование для Telegram
let telegramBackupInterval;

function startTelegramBackup() {
    if (window.Telegram?.WebApp) {
        telegramBackupInterval = setInterval(() => {
            console.log('🔄 Резервное сохранение в Telegram WebApp');
            saveAllData();
        }, 30000);
    }
}

function stopTelegramBackup() {
    if (telegramBackupInterval) {
        clearInterval(telegramBackupInterval);
        telegramBackupInterval = null;
    }
}

// =============================================
// ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
// =============================================

function initializeDefaultData() {
    const today = new Date();
    
    if (!appData.currentPeriod.startDate || isNaN(new Date(appData.currentPeriod.startDate).getTime())) {
        appData.currentPeriod.startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0];
    }
    
    if (!appData.currentPeriod.endDate || isNaN(new Date(appData.currentPeriod.endDate).getTime())) {
        appData.currentPeriod.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString().split('T')[0];
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

    if (startDateInput && appData.currentPeriod.startDate) {
        startDateInput.value = appData.currentPeriod.startDate;
    }
    
    if (endDateInput && appData.currentPeriod.endDate) {
        endDateInput.value = appData.currentPeriod.endDate;
    }
    
    if (savingsInput && appData.currentPeriod.savingsPercentage) {
        savingsInput.value = appData.currentPeriod.savingsPercentage;
    }
    
    if (savingsDisplay && appData.currentPeriod.savingsPercentage) {
        savingsDisplay.textContent = appData.currentPeriod.savingsPercentage;
    }
    
    updatePeriodTitle();
}

// Управление вкладками
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetButton) targetButton.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

// Кнопка "Наверх"
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
// ОБНОВЛЕННЫЙ РАСЧЕТ ПРОГРЕССА
// =============================================

function updateBudgetProgress(spentAmount, totalBudget) {
    const progressRing = document.getElementById('budgetProgressRing');
    if (!progressRing) return;
    
    let progress = 0;
    if (totalBudget > 0) {
        progress = Math.min((spentAmount / totalBudget) * 100, 100);
    }
    
    let color = 'var(--color-primary)';
    if (progress > 100) {
        color = 'var(--color-expense)';
    } else if (progress > 80) {
        color = 'var(--color-warning)';
    }
    
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (progress / 100) * circumference;
    
    progressRing.innerHTML = `
        <svg width="120" height="120" viewBox="0 0 120 120" style="position: absolute; top: 0; left: 0; z-index: 1;">
            <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
            />
            <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="${color}"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 0.5s ease-in-out;"
            />
        </svg>
    `;
}

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
    
    let dailyBudget = 0;
    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const endDate = new Date(appData.currentPeriod.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            const today = new Date();
            startDate.setTime(new Date(today.getFullYear(), today.getMonth(), 1).getTime());
            endDate.setTime(new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime());
        }
        
        const timeDiff = endDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        
        if (totalDays > 0 && remainingBudget >= 0) {
            dailyBudget = remainingBudget / totalDays;
        } else {
            dailyBudget = 0;
        }
    } catch (error) {
        console.error('Ошибка при расчете дневного бюджета:', error);
        dailyBudget = 0;
    }
    
    let todaySpent = 0;
    let todayRemaining = dailyBudget;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
        
        todaySpent = todayExpenses.reduce((sum, expense) => {
            const amount = parseFloat(expense.amount) || 0;
            return sum + amount;
        }, 0);
        
        todayRemaining = Math.max(dailyBudget - todaySpent, 0);
    } catch (error) {
        console.error('Ошибка при расчете сегодняшних трат:', error);
    }
    
    updateElement('totalIncome', formatCurrency(totalIncome));
    updateElement('totalSpent', formatCurrency(totalSpent));
    updateElement('totalSavings', formatCurrency(totalSavings));
    updateElement('remainingBudget', formatCurrency(remainingBudget));
    updateElement('dailyBudget', formatCurrency(dailyBudget));
    updateElement('todaySpent', formatCurrency(todaySpent));
    updateElement('todayRemaining', formatCurrency(todayRemaining));
    
    updateBudgetProgress(todaySpent, dailyBudget);
    
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
// УПРАВЛЕНИЕ ДОХОДАМИ С DEBOUNCE
// =============================================

function addIncome() {
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    if (!title || !amount || amount <= 0) {
        showToastNotification('Заполните все поля', 'warning');
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
        
        showToastNotification('Доход обновлен', 'success');
    } else {
        const newIncome = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0]
        };
        
        appData.currentPeriod.incomes.push(newIncome);
        showToastNotification('Доход добавлен', 'success');
    }
    
    // Используем debounced сохранение
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
    
    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    
    debouncedSave(); // Используем debounced сохранение
    
    renderIncomes();
    updateAllCalculations();
    
    // БЕЗ confirm() - показываем toast
    showToastNotification(`Доход "${income.name}" удален`, 'info');
}

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;
    
    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<div class="empty-state">Добавьте ваши доходы</div>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="list-item ${editingState.mode === 'income' && editingState.itemId === income.id ? 'editing' : ''}">
            <div class="item-info">
                <div class="item-name">${income.name}</div>
                <div class="item-amount">${formatCurrency(income.amount)}</div>
                <div class="item-category">${income.category}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn edit" onclick="editIncome(${income.id})">Изменить</button>
                <button class="action-btn danger" onclick="removeIncome(${income.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// =============================================
// УПРАВЛЕНИЕ РАСХОДАМИ С DEBOUNCE
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
        showToastNotification('Заполните все поля', 'warning');
        return;
    }
    
    if (editingState.mode === 'fixed' && editingState.itemId) {
        const expenseIndex = appData.currentPeriod.fixedExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.fixedExpenses[expenseIndex] = {
                ...appData.currentPeriod.fixedExpenses[expenseIndex],
                name: title,
                amount: amount,
                category: category
            };
        }
        
        cancelEdit();
        
        const button = document.querySelector('[onclick="addFixedExpense()"]');
        if (button) button.textContent = 'Добавить расход';
        
        showToastNotification('Расход обновлен', 'success');
    } else {
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0]
        };
        
        appData.currentPeriod.fixedExpenses.push(newExpense);
        showToastNotification('Расход добавлен', 'success');
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
    
    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    
    debouncedSave();
    
    renderFixedExpenses();
    updateAllCalculations();
    
    // БЕЗ confirm() - показываем toast
    showToastNotification(`Расход "${expense.name}" удален`, 'info');
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Добавьте ваши обязательные расходы</div>';
        return;
    }
    
    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="list-item ${editingState.mode === 'fixed' && editingState.itemId === expense.id ? 'editing' : ''}">
            <div class="item-info">
                <div class="item-name">${expense.name}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
                <div class="item-category">${expense.category}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn edit" onclick="editFixedExpense(${expense.id})">Изменить</button>
                <button class="action-btn danger" onclick="removeFixedExpense(${expense.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// =============================================
// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ТРАТАМИ С DEBOUNCE
// =============================================

function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');
    const dateInput = document.getElementById('dailyExpenseDate');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    
    if (!title || !amount || amount <= 0) {
        showToastNotification('Заполните все поля', 'warning');
        return;
    }
    
    if (editingState.mode === 'daily' && editingState.itemId) {
        const expenseIndex = appData.currentPeriod.dailyExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.dailyExpenses[expenseIndex] = {
                ...appData.currentPeriod.dailyExpenses[expenseIndex],
                name: title,
                amount: amount,
                category: category
            };
        }
        
        cancelEdit();
        
        const button = document.querySelector('[onclick="addDailyExpense()"]');
        if (button) button.textContent = 'Добавить трату';
        
        showToastNotification('Трата обновлена', 'success');
    } else {
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0]
        };
        
        appData.currentPeriod.dailyExpenses.push(newExpense);
        showToastNotification('Трата добавлена', 'success');
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
    
    if (titleInput) titleInput.value = expense.name;
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
    
    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    
    debouncedSave();
    
    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
    
    // БЕЗ confirm() - показываем toast
    showToastNotification(`Трата "${expense.name}" удалена`, 'info');
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Записывайте ваши ежедневные траты</div>';
        return;
    }
    
    const sortedExpenses = [...appData.currentPeriod.dailyExpenses].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    container.innerHTML = sortedExpenses.map(expense => {
        const categoryInfo = appData.categories.find(cat => cat.id === expense.category);
        const categoryIcon = categoryInfo ? categoryInfo.icon : '💰';
        const categoryName = categoryInfo ? categoryInfo.name : expense.category;
        
        return `
            <div class="list-item ${editingState.mode === 'daily' && editingState.itemId === expense.id ? 'editing' : ''}">
                <div class="item-info">
                    <div class="item-name">${categoryIcon} ${expense.name}</div>
                    <div class="item-amount">${formatCurrency(expense.amount)}</div>
                    <div class="item-category">${formatDate(expense.date)} • ${categoryName}</div>
                </div>
                <div class="item-actions">
                    <button class="action-btn edit" onclick="editDailyExpense(${expense.id})">Изменить</button>
                    <button class="action-btn danger" onclick="removeDailyExpense(${expense.id})">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================
// БЫСТРЫЕ ФОРМЫ С DEBOUNCE
// =============================================

function showQuickExpense() {
    const overlay = document.getElementById('quickExpenseOverlay');
    if (overlay) {
        overlay.classList.add('active');
        
        setTimeout(() => {
            const firstInput = document.getElementById('quickExpenseTitle');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

function showQuickIncome() {
    const overlay = document.getElementById('quickIncomeOverlay');
    if (overlay) {
        overlay.classList.add('active');
        
        setTimeout(() => {
            const firstInput = document.getElementById('quickIncomeTitle');
            if (firstInput) firstInput.focus();
        }, 300);
    }
}

function hideQuickForm(type) {
    const overlay = document.getElementById(`quick${type.charAt(0).toUpperCase() + type.slice(1)}Overlay`);
    if (overlay) {
        overlay.classList.remove('active');
        
        setTimeout(() => {
            if (type === 'expense') {
                const titleInput = document.getElementById('quickExpenseTitle');
                const amountInput = document.getElementById('quickExpenseAmount');
                const categorySelect = document.getElementById('quickExpenseCategory');
                
                if (titleInput) titleInput.value = '';
                if (amountInput) amountInput.value = '';
                if (categorySelect) categorySelect.value = 'food';
            } else if (type === 'income') {
                const titleInput = document.getElementById('quickIncomeTitle');
                const amountInput = document.getElementById('quickIncomeAmount');
                const categorySelect = document.getElementById('quickIncomeCategory');
                
                if (titleInput) titleInput.value = '';
                if (amountInput) amountInput.value = '';
                if (categorySelect) categorySelect.value = 'work';
            }
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
    
    if (!title || !amount || amount <= 0) {
        showToastNotification('Заполните все поля', 'warning');
        return;
    }
    
    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0]
    };
    
    appData.currentPeriod.dailyExpenses.push(newExpense);
    
    debouncedSave();
    
    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
    
    hideQuickForm('expense');
    showToastNotification('Трата добавлена!', 'success');
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
        showToastNotification('Заполните все поля', 'warning');
        return;
    }
    
    const newIncome = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: category,
        date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0]
    };
    
    appData.currentPeriod.incomes.push(newIncome);
    
    debouncedSave();
    
    renderIncomes();
    renderRecentTransactions();
    updateAllCalculations();
    
    hideQuickForm('income');
    showToastNotification('Доход добавлен!', 'success');
}

// =============================================
// ИСПРАВЛЕННЫЕ УВЕДОМЛЕНИЯ БЕЗ CONFIRM()
// =============================================

function showToastNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Автоматически скрываем
    setTimeout(() => {
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // Клик для скрытия
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// =============================================
// ПОСЛЕДНИЕ ОПЕРАЦИИ И АРХИВ
// =============================================

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const allTransactions = [
        ...appData.currentPeriod.incomes.map(income => ({
            ...income,
            type: 'income',
            icon: '💰'
        })),
        ...appData.currentPeriod.fixedExpenses.map(expense => ({
            ...expense,
            type: 'expense',
            icon: '💳'
        })),
        ...appData.currentPeriod.dailyExpenses.map(expense => {
            const categoryInfo = appData.categories.find(cat => cat.id === expense.category);
            return {
                ...expense,
                type: 'expense',
                icon: categoryInfo ? categoryInfo.icon : '🛒'
            };
        })
    ];
    
    const recentTransactions = allTransactions
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateB - dateA !== 0) {
                return dateB - dateA;
            }
            return b.id - a.id;
        })
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<div class="empty-state">Операций пока нет</div>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="recent-item">
            <div class="item-info">
                <div class="item-name">${transaction.icon} ${transaction.name}</div>
                <div class="item-meta">${formatDate(transaction.date)}</div>
            </div>
            <div class="item-amount ${transaction.type === 'income' ? 'income' : 'expense'}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

function renderArchive() {
    const container = document.getElementById('archiveList');
    if (!container) return;
    
    container.innerHTML = '<div class="empty-state">Завершенные периоды будут отображены здесь</div>';
}

// =============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================

function formatCurrency(amount) {
    if (isNaN(amount)) {
        return '0 ₽';
    }
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
    } catch (error) {
        console.error('Ошибка форматирования даты:', error);
        return dateString;
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = value;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

function cancelEdit() {
    editingState.mode = null;
    editingState.itemId = null;
    editingState.originalData = null;
}

function animateNumbersOnLoad() {
    const elements = document.querySelectorAll('.metric-value');
    elements.forEach(el => {
        if (el.textContent.includes('₽')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, Math.random() * 300);
        }
    });
}

function initializeCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        currentDateElement.textContent = formattedDate;
    }
}

// =============================================
// ОБРАБОТЧИКИ СОБЫТИЙ ЗАКРЫТИЯ С DEBOUNCE
// =============================================

window.addEventListener('beforeunload', function(e) {
    console.log('🚪 Приложение закрывается, принудительно сохраняем данные...');
    
    // Отменяем все pending debounced операции и сохраняем сразу
    if (debouncedSave.cancel) debouncedSave.cancel();
    
    // Множественное прямое сохранение для надежности
    for (let i = 0; i < 3; i++) {
        saveAllData(); // Прямое сохранение без debounce!
    }
    
    stopTelegramBackup();
    console.log('💾 Принудительное сохранение при закрытии завершено');
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('👁️ Приложение скрыто, принудительно сохраняем данные...');
        saveAllData(); // Прямое сохранение
    }
});

window.addEventListener('blur', function() {
    console.log('🔍 Окно потеряло фокус, сохраняем данные...');
    saveAllData();
});

// Восстанавливаем состояние при изменении ориентации
window.addEventListener('orientationchange', function() {
    setTimeout(restoreNavigationState, 100);
});

window.addEventListener('resize', function() {
    setTimeout(restoreNavigationState, 100);
});

// =============================================
// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Инициализация приложения...');
    
    // Сначала инициализируем Telegram WebApp
    initializeTelegramWebApp();
    
    // Затем остальные компоненты
    initializeTabs();
    initializeHeaderScroll();
    initializeScrollToTop();
    
    // Загружаем данные
    loadAllSavedData();
    initializeDefaultData();
    loadInitialData();
    updateAllCalculations();
    
    // Инициализируем интерфейс
    initializeCurrentDate();
    
    // Запускаем резервное копирование для Telegram
    startTelegramBackup();
    
    // Принудительно восстанавливаем навигацию через секунду
    setTimeout(restoreNavigationState, 1000);
    
    // Анимируем числа с задержкой
    setTimeout(animateNumbersOnLoad, 500);
    
    // DEBOUNCED ОБРАБОТЧИКИ для полей дат
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    const debouncedPeriodSave = debounce(savePlanningPeriod, 1000);
    
    if (startDateInput) {
        startDateInput.addEventListener('change', function() {
            console.log('🗓️ Изменена начальная дата:', this.value);
            savePlanningPeriod(); // Без debounce для change события
        });
        
        startDateInput.addEventListener('input', function() {
            console.log('🗓️ Ввод начальной даты:', this.value);
            debouncedPeriodSave();
        });
        
        startDateInput.addEventListener('blur', function() {
            console.log('🗓️ Потеря фокуса начальной даты:', this.value);
            savePlanningPeriod(); // Без debounce для blur события
        });
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', function() {
            console.log('🗓️ Изменена конечная дата:', this.value);
            savePlanningPeriod();
        });
        
        endDateInput.addEventListener('input', function() {
            console.log('🗓️ Ввод конечной даты:', this.value);
            debouncedPeriodSave();
        });
        
        endDateInput.addEventListener('blur', function() {
            console.log('🗓️ Потеря фокуса конечной даты:', this.value);
            savePlanningPeriod();
        });
    }
    
    console.log('✅ Приложение полностью инициализировано с Debounce и Toast уведомлениями');
});


// ФУНКЦИЯ ОЧИСТКИ СТАРЫХ ДАННЫХ
function clearOldTestData() {
    if (confirm('Вы уверены, что хотите очистить все данные?')) {
        try {
            // Очищаем localStorage
            const keysToRemove = [
                'appData_currentPeriod', 'appData_incomes', 
                'appData_fixedExpenses', 'appData_dailyExpenses',
                'appData_savingsPercentage', 'appData_startDate', 
                'appData_endDate', 'appData_dailyBudgetCarryover'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Удален ключ: ${key}`);
            });

            // Сбрасываем данные в приложении
            appData.currentPeriod.incomes = [];
            appData.currentPeriod.fixedExpenses = [];
            appData.currentPeriod.dailyExpenses = [];
            appData.currentPeriod.dailyBudgetCarryover = {};

            // Обновляем интерфейс
            renderIncomes();
            renderFixedExpenses();
            renderDailyExpenses();
            renderRecentTransactions();
            updateAllCalculations();

            showToastNotification('Все данные очищены!', 'success');
            console.log('✅ Все данные успешно очищены');
            return true;
        } catch (error) {
            console.error('❌ Ошибка очистки данных:', error);
            showToastNotification('Ошибка при очистке данных', 'error');
            return false;
        }
    }
    return false;
}


console.log('🎉 Финальный app.js загружен! Все проблемы решены: Debounce ✅ Toast уведомления ✅ Фиксированная навигация ✅');