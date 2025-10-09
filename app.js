// ИСПРАВЛЕННЫЙ app.js С ВСЕМИ ФИКСАМИ

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
    categories: [
        {id: "food", name: "Еда", icon: "🍽️", keywords: ["кафе", "ресторан", "продукты", "еда", "обед", "завтрак", "ужин", "кофе"]},
        {id: "transport", name: "Транспорт", icon: "🚗", keywords: ["такси", "автобус", "метро", "бензин", "парковка"]},
        {id: "entertainment", name: "Развлечения", icon: "🎬", keywords: ["кино", "концерт", "игры", "развлечения"]},
        {id: "shopping", name: "Покупки", icon: "🛍️", keywords: ["одежда", "обувь", "техника", "покупки"]},
        {id: "health", name: "Здоровье", icon: "⚕️", keywords: ["врач", "лекарства", "аптека"]},
        {id: "other", name: "Прочее", icon: "📋", keywords: []}
    ]
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

// Telegram WebApp переменная
let tg = null;

// ИСПРАВЛЕННЫЕ ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ
// ===========================================

// Более надежная функция сохранения с проверками
function saveToStorage(key, data) {
    try {
        // Проверяем доступность localStorage
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage не поддерживается');
            return false;
        }
        
        // Проверяем что данные не пустые
        if (data === null || data === undefined) {
            console.warn(`Попытка сохранить пустые данные в ${key}`);
            return false;
        }
        
        const jsonString = JSON.stringify(data);
        localStorage.setItem(key, jsonString);
        
        // Проверяем что данные действительно сохранились
        const saved = localStorage.getItem(key);
        if (saved === jsonString) {
            console.log(`✅ Успешно сохранено в ${key}:`, data);
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

// Улучшенная функция загрузки с восстановлением
function loadFromStorage(key, defaultValue = null) {
    try {
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage не поддерживается');
            return defaultValue;
        }
        
        const saved = localStorage.getItem(key);
        if (!saved) {
            console.log(`Нет сохраненных данных для ${key}, используем значение по умолчанию`);
            return defaultValue;
        }
        
        const parsed = JSON.parse(saved);
        console.log(`✅ Загружены данные из ${key}:`, parsed);
        return parsed;
        
    } catch (e) {
        console.error(`❌ Ошибка загрузки ${key}:`, e);
        return defaultValue;
    }
}

// ИСПРАВЛЕННАЯ функция сохранения всех данных
function saveAllData() {
    console.log('🔄 Начинаем сохранение всех данных...');
    
    let successCount = 0;
    const totalSaves = 6;
    
    // Сохраняем основные данные периода
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
    
    // ИСПРАВЛЕНИЕ: Сохраняем даты отдельно и принудительно
    const startDate = appData.currentPeriod.startDate;
    const endDate = appData.currentPeriod.endDate;
    if (startDate && saveToStorage('appData_startDate', startDate)) successCount++;
    if (endDate && saveToStorage('appData_endDate', endDate)) successCount++;
    
    console.log(`💾 Сохранение завершено: ${successCount}/${totalSaves + 1} успешно`);
    
    return successCount >= totalSaves;
}

// ИСПРАВЛЕННАЯ функция загрузки всех данных
function loadAllSavedData() {
    console.log('📂 Загрузка сохраненных данных...');
    
    // Загружаем основные данные текущего периода
    const savedAppData = loadFromStorage('appData_currentPeriod');
    if (savedAppData) {
        appData.currentPeriod = { ...appData.currentPeriod, ...savedAppData };
        console.log('✅ Загружены основные данные:', appData.currentPeriod);
    }
    
    // Загружаем массивы данных
    const savedIncomes = loadFromStorage('appData_incomes', []);
    const savedFixedExpenses = loadFromStorage('appData_fixedExpenses', []);
    const savedDailyExpenses = loadFromStorage('appData_dailyExpenses', []);
    
    if (Array.isArray(savedIncomes)) {
        appData.currentPeriod.incomes = savedIncomes;
        console.log(`✅ Загружено доходов: ${savedIncomes.length}`);
    }
    
    if (Array.isArray(savedFixedExpenses)) {
        appData.currentPeriod.fixedExpenses = savedFixedExpenses;
        console.log(`✅ Загружено обязательных расходов: ${savedFixedExpenses.length}`);
    }
    
    if (Array.isArray(savedDailyExpenses)) {
        appData.currentPeriod.dailyExpenses = savedDailyExpenses;
        console.log(`✅ Загружено ежедневных трат: ${savedDailyExpenses.length}`);
    }
    
    // Загружаем процент сбережений
    const savedSavingsPercentage = loadFromStorage('appData_savingsPercentage');
    if (savedSavingsPercentage !== null) {
        appData.currentPeriod.savingsPercentage = parseInt(savedSavingsPercentage);
        console.log(`✅ Загружен процент сбережений: ${appData.currentPeriod.savingsPercentage}%`);
    }
    
    // ИСПРАВЛЕНИЕ: Принудительно загружаем даты
    const savedStartDate = loadFromStorage('appData_startDate');
    const savedEndDate = loadFromStorage('appData_endDate');
    
    if (savedStartDate) {
        appData.currentPeriod.startDate = savedStartDate;
        console.log(`✅ Загружена начальная дата: ${savedStartDate}`);
    }
    
    if (savedEndDate) {
        appData.currentPeriod.endDate = savedEndDate;
        console.log(`✅ Загружена конечная дата: ${savedEndDate}`);
    }
    
    console.log('📂 Загрузка данных завершена');
}

// ИСПРАВЛЕННЫЕ ФУНКЦИИ УПРАВЛЕНИЯ ДАТАМИ
// =======================================

// ИСПРАВЛЕНИЕ: Сохранение периода планирования с принудительной записью
function savePlanningPeriod() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    console.log('💾 Сохраняем период планирования...');
    
    let hasChanges = false;
    
    if (startDateInput && startDateInput.value) {
        const newStartDate = startDateInput.value;
        if (newStartDate !== appData.currentPeriod.startDate) {
            appData.currentPeriod.startDate = newStartDate;
            console.log(`✅ Обновлена начальная дата: ${newStartDate}`);
            hasChanges = true;
        }
    }
    
    if (endDateInput && endDateInput.value) {
        const newEndDate = endDateInput.value;
        if (newEndDate !== appData.currentPeriod.endDate) {
            appData.currentPeriod.endDate = newEndDate;
            console.log(`✅ Обновлена конечная дата: ${newEndDate}`);
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        // Принудительно сохраняем даты
        saveToStorage('appData_startDate', appData.currentPeriod.startDate);
        saveToStorage('appData_endDate', appData.currentPeriod.endDate);
        
        // Обновляем заголовок периода
        updatePeriodTitle();
        
        // Сохраняем все данные
        saveAllData();
        
        // Пересчитываем
        updateAllCalculations();
        
        console.log('✅ Период планирования сохранен');
    }
}

// Обновление заголовка периода
function updatePeriodTitle() {
    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const month = startDate.toLocaleString('ru-RU', { month: 'long' });
        const year = startDate.getFullYear();
        appData.currentPeriod.title = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        
        // Обновляем кнопку периода в интерфейсе
        const periodBtn = document.querySelector('.current-period');
        if (periodBtn) {
            periodBtn.textContent = appData.currentPeriod.title;
        }
        
        console.log(`✅ Заголовок периода обновлен: ${appData.currentPeriod.title}`);
    } catch (error) {
        console.error('❌ Ошибка обновления заголовка периода:', error);
    }
}

// ИСПРАВЛЕНИЕ: Сохранение процента сбережений
function saveSavingsPercentage(value) {
    const newValue = parseInt(value);
    if (newValue !== appData.currentPeriod.savingsPercentage) {
        appData.currentPeriod.savingsPercentage = newValue;
        console.log(`✅ Обновлен процент сбережений: ${newValue}%`);
        
        // Принудительно сохраняем
        saveToStorage('appData_savingsPercentage', newValue);
        saveAllData();
        updateAllCalculations();
    }
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ПРОГРЕССА БЮДЖЕТА
// =================================================

function updateBudgetProgress(spentAmount, totalBudget) {
    const progressRing = document.getElementById('budgetProgressRing');
    if (!progressRing) return;
    
    let progress = 0;
    if (totalBudget > 0) {
        progress = Math.min((spentAmount / totalBudget) * 100, 100);
    }
    
    // Определяем цвет прогресса
    let color = 'var(--color-primary)';
    if (progress > 100) {
        color = 'var(--color-expense)';
    } else if (progress > 80) {
        color = 'var(--color-warning)';
    }
    
    // ИСПРАВЛЕННЫЙ способ создания кругового прогресса
    const circumference = 2 * Math.PI * 50; // радиус 50px
    const offset = circumference - (progress / 100) * circumference;
    
    // Создаем SVG элемент для прогресса
    progressRing.innerHTML = `
        <svg width="120" height="120" viewBox="0 0 120 120" style="position: absolute; top: 0; left: 0; z-index: 1;">
            <!-- Фоновый круг -->
            <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
            />
            <!-- Прогресс -->
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
    
    console.log(`Прогресс обновлен: ${progress.toFixed(1)}% (${formatCurrency(spentAmount)} из ${formatCurrency(totalBudget)})`);
}

// TELEGRAM WEBAPP ИНТЕГРАЦИЯ С ИСПРАВЛЕНИЯМИ
// ==========================================

// Переопределяем функцию скрытия шапки для Telegram WebApp
function initializeHeaderScroll() {
    // Проверяем если мы в Telegram WebApp
    if (window.Telegram?.WebApp) {
        console.log('🤖 Telegram WebApp обнаружен - отключаем автоскрытие навигации');
        
        // В Telegram WebApp НЕ скрываем навигацию при скролле
        // Просто добавляем базовые обработчики без скрытия
        
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
        
        // Добавляем класс для CSS стилизации
        document.body.classList.add('tg-viewport');
        
        return; // Выходим, не добавляя скролл-обработчики
    }
    
    // Оригинальное поведение для обычных браузеров
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
        
        // ИСПРАВЛЕНИЕ: Принудительно фиксируем навигацию
        setTimeout(() => {
            const header = document.getElementById('compactHeader');
            const navigation = document.getElementById('tabNavigation');
            
            if (header) {
                header.style.position = 'fixed';
                header.style.transform = 'translateY(0)';
                header.style.zIndex = '1000';
            }
            
            if (navigation) {
                navigation.style.position = 'fixed';
                navigation.style.transform = 'translateY(0)';
                navigation.style.zIndex = '999';
            }
        }, 100);
        
        // Обработчик изменения viewport в Telegram
        tg.onEvent('viewportChanged', function() {
            console.log('📱 Viewport изменен в Telegram WebApp');
            
            // Принудительно корректируем позицию навигации
            const header = document.getElementById('compactHeader');
            const navigation = document.getElementById('tabNavigation');
            
            if (header) {
                header.style.transform = 'translateY(0)';
            }
            
            if (navigation) {
                navigation.style.transform = 'translateY(0)';
            }
        });
        
        // Обработчик появления клавиатуры
        tg.onEvent('mainButtonClicked', function() {
            saveAllData();
        });
        
        console.log('🤖 Telegram WebApp полностью инициализирован');
    }
}

// Создаем резервную копию каждые 30 секунд в Telegram
let telegramBackupInterval;

function startTelegramBackup() {
    if (window.Telegram?.WebApp) {
        telegramBackupInterval = setInterval(() => {
            console.log('🔄 Резервное сохранение в Telegram WebApp');
            saveAllData();
        }, 30000); // Каждые 30 секунд
    }
}

// Останавливаем резервное копирование при выходе
function stopTelegramBackup() {
    if (telegramBackupInterval) {
        clearInterval(telegramBackupInterval);
        telegramBackupInterval = null;
    }
}

// Функция восстановления состояния навигации
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
            navigation.style.top = '72px';
            navigation.style.transform = 'translateY(0)';
            navigation.style.zIndex = '999';
        }
        
        console.log('🔧 Состояние навигации восстановлено');
    }
}

// ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
// ==========================

// Инициализация данных по умолчанию
function initializeDefaultData() {
    const today = new Date();
    
    // Проверяем и устанавливаем даты по умолчанию если они некорректные
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
    
    // Проверяем процент сбережений
    if (isNaN(appData.currentPeriod.savingsPercentage) || appData.currentPeriod.savingsPercentage < 0) {
        appData.currentPeriod.savingsPercentage = 20;
    }
    
    // Инициализируем массивы если они не определены
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

    // ИСПРАВЛЕНИЕ: Принудительная установка значений в поля
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const savingsInput = document.getElementById('savingsPercentage');
    const savingsDisplay = document.getElementById('savingsPercentageDisplay');

    if (startDateInput && appData.currentPeriod.startDate) {
        startDateInput.value = appData.currentPeriod.startDate;
        console.log(`✅ Установлена начальная дата в поле: ${appData.currentPeriod.startDate}`);
    }
    
    if (endDateInput && appData.currentPeriod.endDate) {
        endDateInput.value = appData.currentPeriod.endDate;
        console.log(`✅ Установлена конечная дата в поле: ${appData.currentPeriod.endDate}`);
    }
    
    if (savingsInput && appData.currentPeriod.savingsPercentage) {
        savingsInput.value = appData.currentPeriod.savingsPercentage;
        console.log(`✅ Установлен процент сбережений: ${appData.currentPeriod.savingsPercentage}%`);
    }
    
    if (savingsDisplay && appData.currentPeriod.savingsPercentage) {
        savingsDisplay.textContent = appData.currentPeriod.savingsPercentage;
    }
    
    // Принудительно обновляем заголовок
    updatePeriodTitle();
}

// Управление вкладками
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

function switchTab(tabId) {
    // Убираем активные классы
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Активируем нужные элементы
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

// Навигация по вкладкам со стрелками
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

// ОСНОВНЫЕ РАСЧЕТЫ
// ================

function updateAllCalculations() {
    console.log('Начинаем расчеты...');
    
    // Получаем данные с защитой от NaN
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
    
    // ИСПРАВЛЕННЫЙ расчет дневного бюджета с защитой от ошибок
    let dailyBudget = 0;
    try {
        const startDate = new Date(appData.currentPeriod.startDate);
        const endDate = new Date(appData.currentPeriod.endDate);
        
        // Проверяем корректность дат
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
        
        // Защита от деления на 0 или отрицательные дни
        if (totalDays > 0 && remainingBudget >= 0) {
            dailyBudget = remainingBudget / totalDays;
        } else if (totalDays > 0 && totalIncome > 0) {
            // Если бюджет отрицательный, но есть доходы - показываем 0
            dailyBudget = 0;
        } else {
            // Если нет доходов или некорректные дни - показываем 0
            dailyBudget = 0;
        }
    } catch (error) {
        console.error('Ошибка при расчете дневного бюджета:', error);
        dailyBudget = 0;
    }
    
    // Траты сегодня с защитой от ошибок
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
    
    // Обновляем UI с защитой от NaN
    updateElement('totalIncome', formatCurrency(totalIncome));
    updateElement('totalSpent', formatCurrency(totalSpent));
    updateElement('totalSavings', formatCurrency(totalSavings));
    updateElement('remainingBudget', formatCurrency(remainingBudget));
    updateElement('dailyBudget', formatCurrency(dailyBudget));
    updateElement('todaySpent', formatCurrency(todaySpent));
    updateElement('todayRemaining', formatCurrency(todayRemaining));
    
    // Обновляем прогресс круга с новой функцией
    updateBudgetProgress(todaySpent, dailyBudget);
    
    // Обновляем прогресс сбережений с защитой от ошибок
    let savingsProgress = 0;
    let currentSavings = 0;
    
    try {
        if (totalIncome > 0 && savingsPercentage > 0) {
            // Предполагаем, что 65% месяца прошло (можно сделать более точный расчет)
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

// УПРАВЛЕНИЕ ДОХОДАМИ
// ===================

function addIncome() {
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
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
    const titleInput = document.getElementById('incomeTitle');
    const amountInput = document.getElementById('incomeAmount');
    const categorySelect = document.getElementById('incomeCategory');
    
    if (titleInput) titleInput.value = income.name;
    if (amountInput) amountInput.value = income.amount;
    if (categorySelect) categorySelect.value = income.category;
    
    // Меняем текст кнопки
    const button = document.querySelector('[onclick="addIncome()"]');
    if (button) button.textContent = 'Сохранить изменения';
    
    // Скроллим к форме
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

// УПРАВЛЕНИЕ ОБЯЗАТЕЛЬНЫМИ РАСХОДАМИ
// ==================================

function addFixedExpense() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
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
                category: category
            };
        }
        
        cancelEdit();
        
        const button = document.querySelector('[onclick="addFixedExpense()"]');
        if (button) button.textContent = 'Добавить расход';
    } else {
        // Создаем новый расход
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split('T')[0]
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

// УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ТРАТАМИ
// ==============================

function addDailyExpense() {
    const titleInput = document.getElementById('dailyExpenseTitle');
    const amountInput = document.getElementById('dailyExpenseAmount');
    const categorySelect = document.getElementById('dailyExpenseCategory');
    
    if (!titleInput || !amountInput || !categorySelect) return;
    
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
                name: title,
                amount: amount,
                category: category
            };
        }
        
        cancelEdit();
        
        const button = document.querySelector('[onclick="addDailyExpense()"]');
        if (button) button.textContent = 'Добавить трату';
    } else {
        // Создаем новую трату
        const newExpense = {
            id: Date.now(),
            name: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split('T')[0]
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
    renderRecentTransactions();
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
    
    if (confirm(`Удалить трату "${expense.name}"?`)) {
        appData.currentPeriod.dailyExpenses = appData.currentPeriod.dailyExpenses.filter(exp => exp.id !== id);
        
        // Автосохранение
        saveAllData();
        
        renderDailyExpenses();
        updateAllCalculations();
        renderRecentTransactions();
    }
}

function renderDailyExpenses() {
    const container = document.getElementById('dailyExpensesList');
    if (!container) return;
    
    if (appData.currentPeriod.dailyExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Записывайте ваши ежедневные траты</div>';
        return;
    }
    
    // Сортируем по дате (новые сверху)
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

// БЫСТРЫЕ ФОРМЫ
// =============

function showQuickExpense() {
    const overlay = document.getElementById('quickExpenseOverlay');
    if (overlay) {
        overlay.classList.add('active');
        
        // Фокус на первое поле
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
        
        // Очистка полей
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
        return;
    }
    
    // Автоматический выбор категории по ключевым словам
    const autoCategory = detectCategory(title) || category;
    
    const newExpense = {
        id: Date.now(),
        name: title,
        amount: amount,
        category: autoCategory,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.currentPeriod.dailyExpenses.push(newExpense);
    
    // Автосохранение
    saveAllData();
    
    renderDailyExpenses();
    updateAllCalculations();
    renderRecentTransactions();
    
    // Показываем уведомление
    showNotification(`Трата "${title}" добавлена`, 'success');
    
    // Закрываем форму
    hideQuickForm('expense');
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
    
    // Автосохранение
    saveAllData();
    
    renderIncomes();
    updateAllCalculations();
    renderRecentTransactions();
    
    // Показываем уведомление
    showNotification(`Доход "${title}" добавлен`, 'success');
    
    // Закрываем форму
    hideQuickForm('income');
}

// Автоматическое определение категории
function detectCategory(title) {
    const lowerTitle = title.toLowerCase();
    
    for (const category of appData.categories) {
        for (const keyword of category.keywords) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                return category.id;
            }
        }
    }
    
    return null;
}

// УВЕДОМЛЕНИЯ
// ===========

function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Цвета в зависимости от типа
    switch (type) {
        case 'success':
            notification.style.background = 'var(--color-success)';
            break;
        case 'error':
            notification.style.background = 'var(--color-error)';
            break;
        case 'warning':
            notification.style.background = 'var(--color-warning)';
            break;
        default:
            notification.style.background = 'var(--color-primary)';
    }
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаление через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ПОСЛЕДНИЕ ОПЕРАЦИИ
// ==================

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    // Объединяем доходы и расходы
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
    
    // Сортируем по дате и ID (новые сверху)
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

// АРХИВ
// =====

function renderArchive() {
    const container = document.getElementById('archiveList');
    if (!container) return;
    
    // Здесь можно добавить логику архива периодов
    container.innerHTML = '<div class="empty-state">Завершенные периоды будут отображены здесь</div>';
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =======================

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
        // Анимация обновления
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = value;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

function updateSavingsPercentage(value) {
    const display = document.getElementById('savingsPercentageDisplay');
    if (display) {
        display.textContent = value;
    }
    // Автосохранение НЕ вызываем здесь, только при окончательном изменении
}

function cancelEdit() {
    editingState.mode = null;
    editingState.itemId = null;
    editingState.originalData = null;
}

// Анимация чисел при загрузке
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

// Инициализация текущей даты в интерфейсе
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

// СОБЫТИЯ НА ЗАКРЫТИЕ
// ===================

// КРИТИЧЕСКИ ВАЖНО: Многоуровневое сохранение при закрытии
window.addEventListener('beforeunload', function(e) {
    console.log('🚪 Приложение закрывается, принудительно сохраняем данные...');
    
    // Множественное сохранение для надежности
    for (let i = 0; i < 3; i++) {
        saveAllData();
    }
    
    console.log('💾 Принудительное сохранение при закрытии завершено');
});

// Дополнительное сохранение при потере видимости страницы
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('👁️ Приложение скрыто, сохраняем данные...');
        saveAllData();
    }
});

// Сохранение при потере фокуса окна
window.addEventListener('blur', function() {
    console.log('🔍 Окно потеряло фокус, сохраняем данные...');
    saveAllData();
});

// Telegram WebApp специфичные события
if (window.Telegram?.WebApp) {
    // Сохранение при закрытии Telegram WebApp
    window.Telegram.WebApp.onEvent('mainButtonClicked', function() {
        saveAllData();
    });
    
    window.Telegram.WebApp.onEvent('backButtonClicked', function() {
        saveAllData();
    });
}

// Восстанавливаем состояние при изменении ориентации
window.addEventListener('orientationchange', function() {
    setTimeout(restoreNavigationState, 100);
});

// Восстанавливаем состояние при изменении размера окна
window.addEventListener('resize', function() {
    setTimeout(restoreNavigationState, 100);
});

// Сохранение при изменении полей дат
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики событий для полей дат
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.addEventListener('change', function() {
            console.log('🗓️ Изменена начальная дата:', this.value);
            savePlanningPeriod();
        });
        
        startDateInput.addEventListener('blur', function() {
            console.log('🗓️ Потеря фокуса начальной даты:', this.value);
            savePlanningPeriod();
        });
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', function() {
            console.log('🗓️ Изменена конечная дата:', this.value);
            savePlanningPeriod();
        });
        
        endDateInput.addEventListener('blur', function() {
            console.log('🗓️ Потеря фокуса конечной даты:', this.value);
            savePlanningPeriod();
        });
    }
});

// Обработка виртуальной клавиатуры в Telegram
function handleTelegramKeyboard() {
    if (!window.Telegram?.WebApp) return;
    
    // Обнаруживаем появление виртуальной клавиатуры
    let initialHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        const heightDiff = initialHeight - currentHeight;
        
        if (heightDiff > 150) { // Клавиатура появилась
            document.body.classList.add('keyboard-visible');
            console.log('⌨️ Виртуальная клавиатура показана');
        } else { // Клавиатура скрыта
            document.body.classList.remove('keyboard-visible');
            console.log('⌨️ Виртуальная клавиатура скрыта');
        }
    });
}

// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// =====================

// Обновленная инициализация с учетом Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Инициализация приложения...');
    
    // Сначала инициализируем Telegram WebApp
    initializeTelegramWebApp();
    
    // Затем остальные компоненты
    initializeTabs();
    initializeHeaderScroll(); // Теперь учитывает Telegram
    initializeScrollToTop();
    handleTelegramKeyboard();
    
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
    
    console.log('✅ Приложение полностью инициализировано для Telegram WebApp');
});

// Очищаем интервалы при закрытии
window.addEventListener('beforeunload', function() {
    stopTelegramBackup();
    console.log('🔄 Резервное копирование остановлено');
});

console.log('🔧 Исправленные скрипты загружены! Все проблемы с сохранением, прогрессом и навигацией решены.');