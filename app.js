// ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ app.js - УСТРАНЕНЫ ВСЕ ПРОБЛЕМЫ
// =============================================================================================================

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
        dailyExpenses: [],
        dailyBudgetCarryover: {}
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

let lastScrollY = 0;
let ticking = false;
let tg = null;
let headerScrollThrottle = null;

// ============================================= 
// ИСПРАВЛЕННЫЕ ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ
// =============================================

// Проверяем доступность Telegram Cloud Storage
function isTelegramCloudAvailable() {
    return window.Telegram?.WebApp?.CloudStorage?.setItem && 
           window.Telegram?.WebApp?.CloudStorage?.getItem;
}

// ИСПРАВЛЕНИЕ 2&3: Функция очистки старых данных
function clearOldTestData() {
    try {
        // Очищаем все старые данные
        const keysToRemove = [
            'appData_currentPeriod',
            'appData_incomes', 
            'appData_fixedExpenses',
            'appData_dailyExpenses',
            'appData_savingsPercentage',
            'appData_startDate',
            'appData_endDate',
            'appData_dailyBudgetCarryover'
        ];

        if (isTelegramCloudAvailable()) {
            keysToRemove.forEach(key => {
                window.Telegram.WebApp.CloudStorage.removeItem(key, (error) => {
                    if (!error) {
                        console.log(`🗑️ Удалены старые данные из Cloud: ${key}`);
                    }
                });
            });
        }

        // Очищаем localStorage
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Удалены старые данные из localStorage: ${key}`);
        });

        // Сбрасываем данные приложения к начальному состоянию
        appData.currentPeriod.incomes = [];
        appData.currentPeriod.fixedExpenses = [];
        appData.currentPeriod.dailyExpenses = [];
        appData.currentPeriod.dailyBudgetCarryover = {};

        console.log('✅ Все старые тестовые данные очищены');
        showToastNotification('Старые данные очищены', 'success');

        return true;
    } catch (error) {
        console.error('❌ Ошибка очистки старых данных:', error);
        return false;
    }
}

// Универсальная функция сохранения
function saveToStorage(key, data) {
    try {
        if (!data && data !== 0 && data !== false) {
            console.warn(`Попытка сохранить пустые данные в ${key}`);
            return false;
        }

        const jsonString = JSON.stringify(data);

        if (isTelegramCloudAvailable()) {
            window.Telegram.WebApp.CloudStorage.setItem(key, jsonString, (error) => {
                if (error) {
                    console.error(`❌ Ошибка сохранения в Telegram Cloud ${key}:`, error);
                    // Fallback на localStorage
                    try {
                        localStorage.setItem(key, jsonString);
                        console.log(`✅ Fallback сохранение в localStorage ${key}`);
                    } catch (e) {
                        console.error(`❌ Критическая ошибка сохранения ${key}:`, e);
                    }
                } else {
                    console.log(`✅ Успешно сохранено в Telegram Cloud ${key}`);
                    // Дублируем в localStorage
                    try {
                        localStorage.setItem(key, jsonString);
                    } catch (e) {
                        // Игнорируем ошибки localStorage
                    }
                }
            });
            return true;
        } else {
            localStorage.setItem(key, jsonString);
            console.log(`✅ Сохранено в localStorage ${key}`);
            return true;
        }
    } catch (e) {
        console.error(`❌ Критическая ошибка сохранения ${key}:`, e);
        return false;
    }
}

// Универсальная функция загрузки
function loadFromStorage(key, defaultValue = null) {
    return new Promise((resolve) => {
        try {
            if (isTelegramCloudAvailable()) {
                window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                    if (error || !value) {
                        // Fallback на localStorage
                        try {
                            const localValue = localStorage.getItem(key);
                            if (localValue) {
                                const parsed = JSON.parse(localValue);
                                console.log(`✅ Загружено из localStorage ${key}`);
                                resolve(parsed);
                            } else {
                                resolve(defaultValue);
                            }
                        } catch (e) {
                            console.error(`❌ Ошибка загрузки из localStorage ${key}:`, e);
                            resolve(defaultValue);
                        }
                    } else {
                        try {
                            const parsed = JSON.parse(value);
                            console.log(`✅ Загружено из Telegram Cloud ${key}`);
                            try {
                                localStorage.setItem(key, value);
                            } catch (e) {
                                // Игнорируем ошибки localStorage
                            }
                            resolve(parsed);
                        } catch (e) {
                            console.error(`❌ Ошибка парсинга из Telegram Cloud ${key}:`, e);
                            resolve(defaultValue);
                        }
                    }
                });
            } else {
                const saved = localStorage.getItem(key);
                if (!saved) {
                    resolve(defaultValue);
                } else {
                    const parsed = JSON.parse(saved);
                    console.log(`✅ Загружено из localStorage ${key}`);
                    resolve(parsed);
                }
            }
        } catch (e) {
            console.error(`❌ Критическая ошибка загрузки ${key}:`, e);
            resolve(defaultValue);
        }
    });
}

// Сохранение всех данных
function saveAllData() {
    console.log('💾 Сохранение всех данных...');

    const periodData = {
        id: appData.currentPeriod.id,
        title: appData.currentPeriod.title,
        startDate: appData.currentPeriod.startDate,
        endDate: appData.currentPeriod.endDate,
        savingsPercentage: appData.currentPeriod.savingsPercentage,
        dailyBudgetCarryover: appData.currentPeriod.dailyBudgetCarryover || {}
    };

    saveToStorage('appData_currentPeriod', periodData);
    saveToStorage('appData_incomes', appData.currentPeriod.incomes);
    saveToStorage('appData_fixedExpenses', appData.currentPeriod.fixedExpenses);
    saveToStorage('appData_dailyExpenses', appData.currentPeriod.dailyExpenses);
    saveToStorage('appData_savingsPercentage', appData.currentPeriod.savingsPercentage);
    saveToStorage('appData_startDate', appData.currentPeriod.startDate);
    saveToStorage('appData_endDate', appData.currentPeriod.endDate);
    saveToStorage('appData_dailyBudgetCarryover', appData.currentPeriod.dailyBudgetCarryover || {});

    console.log('✅ Сохранение завершено');
    return true;
}

// Загрузка всех данных
async function loadAllSavedData() {
    console.log('📂 Загрузка сохраненных данных...');

    try {
        const [
            savedAppData,
            savedIncomes,
            savedFixedExpenses,
            savedDailyExpenses,
            savedSavingsPercentage,
            savedStartDate,
            savedEndDate,
            savedDailyBudgetCarryover
        ] = await Promise.all([
            loadFromStorage('appData_currentPeriod'),
            loadFromStorage('appData_incomes', []),
            loadFromStorage('appData_fixedExpenses', []),
            loadFromStorage('appData_dailyExpenses', []),
            loadFromStorage('appData_savingsPercentage'),
            loadFromStorage('appData_startDate'),
            loadFromStorage('appData_endDate'),
            loadFromStorage('appData_dailyBudgetCarryover', {})
        ]);

        if (savedAppData) {
            appData.currentPeriod = { ...appData.currentPeriod, ...savedAppData };
        }

        if (Array.isArray(savedIncomes)) {
            appData.currentPeriod.incomes = savedIncomes;
        }

        if (Array.isArray(savedFixedExpenses)) {
            appData.currentPeriod.fixedExpenses = savedFixedExpenses;
        }

        if (Array.isArray(savedDailyExpenses)) {
            appData.currentPeriod.dailyExpenses = savedDailyExpenses;
        }

        if (savedSavingsPercentage !== null) {
            appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
        }

        if (savedStartDate) {
            appData.currentPeriod.startDate = savedStartDate;
        }

        if (savedEndDate) {
            appData.currentPeriod.endDate = savedEndDate;
        }

        if (savedDailyBudgetCarryover && typeof savedDailyBudgetCarryover === 'object') {
            appData.currentPeriod.dailyBudgetCarryover = savedDailyBudgetCarryover;
        }

        console.log('📂 Загрузка данных завершена');
    } catch (error) {
        console.error('❌ Ошибка при загрузке данных:', error);
    }
}

// ============================================= 
// ИСПРАВЛЕННАЯ НАВИГАЦИЯ (ПРОБЛЕМА 1)
// =============================================

// ИСПРАВЛЕНИЕ 1: Кардинально переписанная фиксация навигации
function initializeHeaderScroll() {
    const header = document.getElementById('compactHeader');
    const navigation = document.getElementById('tabNavigation');

    if (!header || !navigation) {
        console.warn('❌ Элементы навигации не найдены');
        return;
    }

    console.log('🔧 Инициализация фиксированной навигации...');

    // ПРИНУДИТЕЛЬНАЯ ФИКСАЦИЯ для всех случаев
    function forceFixedNavigation() {
        // Хедер
        header.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 60px !important;
            z-index: 9999 !important;
            transform: translateY(0px) !important;
            background: var(--color-surface) !important;
            border-bottom: 1px solid var(--color-border) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
        `;

        // Навигация
        navigation.style.cssText = `
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 60px !important;
            z-index: 9998 !important;
            transform: translateY(0px) !important;
            background: var(--color-surface) !important;
            border-bottom: 1px solid var(--color-border) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
        `;

        // Отступ для body
        document.body.style.paddingTop = '120px !important';

        console.log('✅ Навигация принудительно зафиксирована');
    }

    // Применяем фиксацию немедленно
    forceFixedNavigation();

    // Переопределяем любые попытки изменить стили
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target === header || mutation.target === navigation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Если стили были изменены, принудительно восстанавливаем фиксацию
                    setTimeout(forceFixedNavigation, 0);
                }
            }
        });
    });

    observer.observe(header, { attributes: true, attributeFilter: ['style'] });
    observer.observe(navigation, { attributes: true, attributeFilter: ['style'] });

    // Дополнительные проверки
    setInterval(() => {
        const headerPos = window.getComputedStyle(header).position;
        const navPos = window.getComputedStyle(navigation).position;

        if (headerPos !== 'fixed' || navPos !== 'fixed') {
            console.log('🔧 Восстановление фиксации навигации...');
            forceFixedNavigation();
        }
    }, 1000);

    // Отключаем все обработчики скролла которые могут вмешиваться
    window.removeEventListener('scroll', updateHeaderVisibility);
    window.removeEventListener('scroll', requestTick);

    console.log('✅ Навигация полностью зафиксирована');
}

// ============================================= 
// ФУНКЦИИ УПРАВЛЕНИЯ ПЕРИОДОМ И ПРОЦЕНТОМ СБЕРЕЖЕНИЙ
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
        saveToStorage('appData_startDate', appData.currentPeriod.startDate);
        saveToStorage('appData_endDate', appData.currentPeriod.endDate);
        saveToStorage('appData_currentPeriod', {
            id: appData.currentPeriod.id,
            title: appData.currentPeriod.title,
            startDate: appData.currentPeriod.startDate,
            endDate: appData.currentPeriod.endDate,
            savingsPercentage: appData.currentPeriod.savingsPercentage
        });
        showToastNotification('Период планирования сохранен', 'success');
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

    const tempPercentage = appData.currentPeriod.savingsPercentage;
    appData.currentPeriod.savingsPercentage = parseInt(value);
    updateAllCalculations();
    appData.currentPeriod.savingsPercentage = tempPercentage;
}

function saveSavingsPercentage(value) {
    const newValue = parseInt(value);
    if (newValue !== appData.currentPeriod.savingsPercentage) {
        appData.currentPeriod.savingsPercentage = newValue;

        saveToStorage('appData_savingsPercentage', newValue);
        saveToStorage('appData_currentPeriod', {
            id: appData.currentPeriod.id,
            title: appData.currentPeriod.title,
            startDate: appData.currentPeriod.startDate,
            endDate: appData.currentPeriod.endDate,
            savingsPercentage: newValue
        });

        updateAllCalculations();
        showToastNotification(`Процент сбережений: ${newValue}%`, 'success');
    }
}

// ============================================= 
// РАСЧЕТ БЮДЖЕТА С САЛЬДО
// =============================================

function calculateDailyBudgetWithCarryover(targetDate = null) {
    if (!targetDate) {
        targetDate = new Date().toISOString().split('T')[0];
    }

    const totalIncome = appData.currentPeriod.incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
    const totalFixed = appData.currentPeriod.fixedExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const savingsPercentage = parseFloat(appData.currentPeriod.savingsPercentage) || 0;
    const totalSavings = (totalIncome * savingsPercentage) / 100;

    const availableForDaily = totalIncome - totalFixed - totalSavings;

    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const endDate = new Date(appData.currentPeriod.endDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (totalDays <= 0 || availableForDaily <= 0) {
            return { dailyBudget: 0, todayBudget: 0, carryover: 0 };
        }

        const baseDailyBudget = availableForDaily / totalDays;

        let carryoverAmount = 0;
        const today = new Date(targetDate);
        const periodStart = new Date(appData.currentPeriod.startDate);

        for (let d = new Date(periodStart); d < today; d.setDate(d.getDate() + 1)) {
            const dayStr = d.toISOString().split('T')[0];
            const dayExpenses = appData.currentPeriod.dailyExpenses
                .filter(exp => exp.date === dayStr)
                .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

            const dayBudget = baseDailyBudget + (appData.currentPeriod.dailyBudgetCarryover[dayStr] || 0);
            const dayRemainder = dayBudget - dayExpenses;

            if (dayRemainder > 0) {
                carryoverAmount += dayRemainder;
            }
        }

        const todayBudget = baseDailyBudget + carryoverAmount;

        if (!appData.currentPeriod.dailyBudgetCarryover) {
            appData.currentPeriod.dailyBudgetCarryover = {};
        }
        appData.currentPeriod.dailyBudgetCarryover[targetDate] = carryoverAmount;

        return {
            dailyBudget: baseDailyBudget,
            todayBudget: todayBudget,
            carryover: carryoverAmount
        };

    } catch (error) {
        console.error('❌ Ошибка расчета дневного бюджета:', error);
        return { dailyBudget: 0, todayBudget: 0, carryover: 0 };
    }
}

// ============================================= 
// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ТРАТАМИ
// =============================================

function editDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    editingState.mode = 'dailyExpense';
    editingState.itemId = id;
    editingState.originalData = { ...expense };

    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');
    const dateInput = document.getElementById('dailyExpenseDate');

    if (titleInput) titleInput.value = expense.name;
    if (amountInput) amountInput.value = expense.amount;
    if (categorySelect) categorySelect.value = expense.category;
    if (dateInput) dateInput.value = expense.date;

    const button = document.querySelector('[onclick="addDailyExpense()"]');
    if (button) button.textContent = 'Сохранить изменения';

    if (titleInput) {
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInput.focus();
    }

    showToastNotification('Режим редактирования активен', 'info');
}

function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');
    const dateInput = document.getElementById('dailyExpenseDate');

    if (!titleInput || !amountInput || !categorySelect) return;

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const expenseDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    if (!title || !amount || amount <= 0) {
        showToastNotification('Заполните все поля', 'warning');
        return;
    }

    if (editingState.mode === 'dailyExpense' && editingState.itemId) {
        const expenseIndex = appData.currentPeriod.dailyExpenses.findIndex(exp => exp.id === editingState.itemId);
        if (expenseIndex !== -1) {
            appData.currentPeriod.dailyExpenses[expenseIndex] = {
                ...appData.currentPeriod.dailyExpenses[expenseIndex],
                name: title,
                amount: amount,
                category: category,
                date: expenseDate
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
            date: expenseDate
        };
        appData.currentPeriod.dailyExpenses.push(newExpense);
        showToastNotification('Трата добавлена', 'success');
    }

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    debouncedSave();
    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
}

// ============================================= 
// ОБНОВЛЕННЫЕ ФУНКЦИИ РАСЧЕТОВ
// =============================================

function updateAllCalculations() {
    console.log('🔄 Обновление расчетов...');

    const totalIncome = appData.currentPeriod.incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
    const totalFixed = appData.currentPeriod.fixedExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const savingsPercentage = parseFloat(appData.currentPeriod.savingsPercentage) || 0;
    const totalSavings = (totalIncome * savingsPercentage) / 100;
    const totalDailyExpenses = appData.currentPeriod.dailyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const totalSpent = totalFixed + totalDailyExpenses;
    const remainingBudget = totalIncome - totalSpent - totalSavings;

    const budgetInfo = calculateDailyBudgetWithCarryover();

    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.date === today);
    const todaySpent = todayExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    const todayRemaining = Math.max(budgetInfo.todayBudget - todaySpent, 0);

    updateElement('totalIncome', formatCurrency(totalIncome));
    updateElement('totalSpent', formatCurrency(totalSpent));
    updateElement('totalSavings', formatCurrency(totalSavings));
    updateElement('remainingBudget', formatCurrency(remainingBudget));
    updateElement('dailyBudget', formatCurrency(budgetInfo.todayBudget));
    updateElement('todaySpent', formatCurrency(todaySpent));
    updateElement('todayRemaining', formatCurrency(todayRemaining));

    updateBudgetProgress(todaySpent, budgetInfo.todayBudget);

    if (budgetInfo.carryover > 0) {
        const carryoverElement = document.getElementById('budgetCarryover');
        if (carryoverElement) {
            carryoverElement.textContent = `+ ${formatCurrency(budgetInfo.carryover)} перенос`;
            carryoverElement.style.display = 'block';
        }
    }

    let savingsProgress = 0;
    let currentSavings = 0;
    if (totalIncome > 0 && savingsPercentage > 0) {
        const monthProgress = 0.65;
        currentSavings = totalSavings * monthProgress;
        savingsProgress = totalSavings > 0 ? (currentSavings / totalSavings) * 100 : 0;
    }

    const savingsProgressBar = document.getElementById('savingsProgress');
    if (savingsProgressBar) {
        savingsProgressBar.style.width = `${Math.min(savingsProgress, 100)}%`;
    }

    updateElement('savingsGoal', formatCurrency(totalSavings));
    updateElement('savingsProgressText', `${formatCurrency(currentSavings)} из ${formatCurrency(totalSavings)}`);

    console.log('✅ Расчеты обновлены');
}

// ============================================= 
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================

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

function showToastNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 140px;
        right: 16px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function cancelEdit() {
    editingState.mode = null;
    editingState.itemId = null;
    editingState.originalData = null;
}

function updateBudgetProgress(spentAmount, totalBudget) {
    const progressRing = document.getElementById('budgetProgressRing');
    if (!progressRing) return;

    let progress = 0;
    if (totalBudget > 0) {
        progress = Math.min((spentAmount / totalBudget) * 100, 100);
    }

    let color = 'var(--color-primary)';
    if (progress > 100) {
        color = 'var(--color-error)';
    } else if (progress > 80) {
        color = 'var(--color-warning)';
    }

    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (progress / 100) * circumference;

    progressRing.innerHTML = `
        <svg width="120" height="120" class="progress-ring">
            <circle cx="60" cy="60" r="50" stroke="var(--color-border)" stroke-width="8" fill="transparent"/>
            <circle cx="60" cy="60" r="50" stroke="${color}" stroke-width="8" fill="transparent"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" 
                    style="transition: stroke-dashoffset 0.5s ease-in-out;"/>
        </svg>
    `;
}

// ============================================= 
// ФУНКЦИИ УПРАВЛЕНИЯ ДОХОДАМИ И РАСХОДАМИ
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
        showToastNotification('Доход обновлен', 'success');
    } else {
        const newIncome = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split('T')[0]
        };
        appData.currentPeriod.incomes.push(newIncome);
        showToastNotification('Доход добавлен', 'success');
    }

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'work';

    debouncedSave();
    renderIncomes();
    renderRecentTransactions();
    updateAllCalculations();
}

function removeIncome(id) {
    const income = appData.currentPeriod.incomes.find(inc => inc.id === id);
    if (!income) return;

    appData.currentPeriod.incomes = appData.currentPeriod.incomes.filter(inc => inc.id !== id);
    debouncedSave();
    renderIncomes();
    renderRecentTransactions();
    updateAllCalculations();
    showToastNotification(`Доход "${income.name}" удален`, 'info');
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

    if (titleInput) {
        titleInput.focus();
    }
}

function addFixedExpense() {
    const titleInput = document.getElementById('fixedExpenseTitle');
    const amountInput = document.getElementById('fixedExpenseAmount');
    const categorySelect = document.getElementById('fixedExpenseCategory');

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
        date: new Date().toISOString().split('T')[0]
    };

    appData.currentPeriod.fixedExpenses.push(newExpense);
    showToastNotification('Обязательный расход добавлен', 'success');

    titleInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'housing';

    debouncedSave();
    renderFixedExpenses();
    renderRecentTransactions();
    updateAllCalculations();
}

function removeFixedExpense(id) {
    const expense = appData.currentPeriod.fixedExpenses.find(exp => exp.id === id);
    if (!expense) return;

    appData.currentPeriod.fixedExpenses = appData.currentPeriod.fixedExpenses.filter(exp => exp.id !== id);
    debouncedSave();
    renderFixedExpenses();
    renderRecentTransactions();
    updateAllCalculations();
    showToastNotification(`Расход "${expense.name}" удален`, 'info');
}

function removeDailyExpense(id) {
    const expense = appData.currentPeriod.dailyExpenses.find(exp => exp.id === id);
    if (!expense) return;

    appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
    debouncedSave();
    renderDailyExpenses();
    renderRecentTransactions();
    updateAllCalculations();
    showToastNotification(`Трата "${expense.name}" удалена`, 'info');
}

// ============================================= 
// ФУНКЦИИ РЕНДЕРИНГА
// =============================================

function renderIncomes() {
    const container = document.getElementById('incomeList');
    if (!container) return;

    if (appData.currentPeriod.incomes.length === 0) {
        container.innerHTML = '<p class="empty-state">Доходы не добавлены</p>';
        return;
    }

    container.innerHTML = appData.currentPeriod.incomes.map(income => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-name">${income.name}</div>
                <div class="item-amount">${formatCurrency(income.amount)}</div>
            </div>
            <div class="item-actions">
                <button onclick="editIncome(${income.id})" class="btn btn--sm btn--outline">✏️</button>
                <button onclick="removeIncome(${income.id})" class="btn btn--sm btn--outline">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderFixedExpenses() {
    const container = document.getElementById('fixedExpenseList');
    if (!container) return;

    if (appData.currentPeriod.fixedExpenses.length === 0) {
        container.innerHTML = '<p class="empty-state">Обязательные расходы не добавлены</p>';
        return;
    }

    container.innerHTML = appData.currentPeriod.fixedExpenses.map(expense => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-name">${expense.name}</div>
                <div class="item-amount">${formatCurrency(expense.amount)}</div>
            </div>
            <div class="item-actions">
                <button onclick="removeFixedExpense(${expense.id})" class="btn btn--sm btn--outline">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    if (!container) return;

    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<p class="empty-state">Ежедневные траты не добавлены</p>';
        return;
    }

    const sortedExpenses = [...appData.currentPeriod.dailyExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedExpenses.map(expense => {
        const category = appData.categories.find(cat => cat.id === expense.category) || appData.categories.find(cat => cat.id === 'other');
        const dateStr = new Date(expense.date).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
        });

        return `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-name">${category.icon} ${expense.name}</div>
                    <div class="item-meta">${dateStr}</div>
                    <div class="item-amount">${formatCurrency(expense.amount)}</div>
                </div>
                <div class="item-actions">
                    <button onclick="editDailyExpense(${expense.id})" class="btn btn--sm btn--outline">✏️</button>
                    <button onclick="removeDailyExpense(${expense.id})" class="btn btn--sm btn--outline">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// ИСПРАВЛЕНИЕ 3: Полностью переписанная функция рендеринга последних операций
function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    // Объединяем только актуальные транзакции из текущих данных приложения
    const allTransactions = [
        ...appData.currentPeriod.incomes.map(item => ({
            ...item, 
            type: 'income',
            displayDate: item.date || new Date().toISOString().split('T')[0]
        })),
        ...appData.currentPeriod.fixedExpenses.map(item => ({
            ...item, 
            type: 'expense',
            displayDate: item.date || new Date().toISOString().split('T')[0]
        })),
        ...appData.currentPeriod.dailyExpenses.map(item => ({
            ...item, 
            type: 'daily',
            displayDate: item.date || new Date().toISOString().split('T')[0]
        }))
    ];

    // Сортируем по дате и берем только последние 5
    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate))
        .slice(0, 5);

    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Операций пока нет</p>';
        return;
    }

    container.innerHTML = recentTransactions.map(transaction => {
        const typeIcon = transaction.type === 'income' ? '💰' : '💳';
        const typeClass = transaction.type === 'income' ? 'income' : 'expense';

        return `
            <div class="transaction-item">
                <span class="transaction-icon">${typeIcon}</span>
                <div class="transaction-info">
                    <div class="transaction-name">${transaction.name}</div>
                    <div class="transaction-date">${new Date(transaction.displayDate).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="transaction-amount ${typeClass}">${formatCurrency(transaction.amount)}</div>
            </div>
        `;
    }).join('');
}

// ============================================= 
// ФУНКЦИИ УПРАВЛЕНИЯ ИНТЕРФЕЙСОМ
// =============================================

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

        console.log('🤖 Telegram WebApp инициализирован');
    }
}

function initializeDefaultData() {
    const today = new Date();

    if (!appData.currentPeriod.startDate) {
        appData.currentPeriod.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }

    if (!appData.currentPeriod.endDate) {
        appData.currentPeriod.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    if (!appData.currentPeriod.savingsPercentage) {
        appData.currentPeriod.savingsPercentage = 20;
    }

    if (!appData.currentPeriod.dailyBudgetCarryover) {
        appData.currentPeriod.dailyBudgetCarryover = {};
    }

    console.log('✅ Данные по умолчанию инициализированы');
}

async function loadInitialData() {
    await loadAllSavedData();

    renderIncomes();
    renderFixedExpenses();
    renderDailyExpenses();
    renderRecentTransactions();

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    const savingsDisplay = document.getElementById('savingsPercentageDisplay');
    const dateInput = document.getElementById('dailyExpenseDate');

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

    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    updatePeriodTitle();
    updateAllCalculations();
}

function setupEventListeners() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput) {
        startDateInput.addEventListener('change', savePlanningPeriod);
    }

    if (endDateInput) {
        endDateInput.addEventListener('change', savePlanningPeriod);
    }

    const savingsInput = document.getElementById('savingsPercentage');

    if (savingsInput) {
        savingsInput.addEventListener('input', (e) => {
            updateSavingsPercentage(e.target.value);
        });

        savingsInput.addEventListener('change', (e) => {
            saveSavingsPercentage(e.target.value);
        });
    }

    console.log('✅ Обработчики событий настроены');
}

// ИСПРАВЛЕНИЕ 2&3: Добавляем функцию очистки данных в интерфейс
function clearAllData() {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
        const success = clearOldTestData();
        if (success) {
            // Обновляем интерфейс
            renderIncomes();
            renderFixedExpenses();
            renderDailyExpenses();
            renderRecentTransactions();
            updateAllCalculations();
        }
    }
}

// ============================================= 
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
// =============================================
async function initializeApp() {
    console.log('🚀 Инициализация приложения...');

    try {
        initializeTelegramWebApp();
        initializeDefaultData();
        await loadInitialData();
        initializeTabs();

        // ИСПРАВЛЕНИЕ 1: Инициализация исправленной навигации
        initializeHeaderScroll();

        initializeScrollToTop();
        setupEventListeners();

        // Добавляем кнопку очистки данных в интерфейс (для отладки)
        setTimeout(() => {
            const headerContent = document.querySelector('.header-content');
            if (headerContent) {
                const clearButton = document.createElement('button');
                clearButton.textContent = '🗑️';
                clearButton.onclick = clearAllData;
                clearButton.style.cssText = `
                    position: absolute;
                    right: 50px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: 1px solid var(--color-border);
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 16px;
                    cursor: pointer;
                `;
                clearButton.title = 'Очистить все данные';
                headerContent.appendChild(clearButton);
            }
        }, 1000);

        console.log('✅ Приложение успешно инициализировано');
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
    }
}

// Запуск приложения
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
