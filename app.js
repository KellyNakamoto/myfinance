// ==========================================
// TELEGRAM MINI APP INTEGRATION
// ==========================================
// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Применяем цветовую схему Telegram
document.documentElement.setAttribute('data-theme', tg.colorScheme);

// Отслеживаем изменение темы в Telegram
tg.onEvent('themeChanged', function() {
    document.documentElement.setAttribute('data-theme', tg.colorScheme);
});

// ==========================================
// ПРОВЕРКА ВЕРСИИ И ПОДДЕРЖКИ CLOUDSTORAGE
// ==========================================

console.log('Telegram WebApp version:', tg.version);
console.log('CloudStorage available:', typeof tg.CloudStorage !== 'undefined');

// Для CloudStorage нужна версия 6.9+
const isCloudStorageSupported = tg.CloudStorage && typeof tg.CloudStorage.setItem === 'function';

// ==========================================
// СОХРАНЕНИЕ ДАННЫХ (HYBRID APPROACH)
// ==========================================

// Гибридный подход: CloudStorage + localStorage как fallback
async function saveToTelegramCloud(data) {
    const dataString = JSON.stringify(data);
    let cloudSaved = false;
    
    // Пытаемся сохранить в Telegram CloudStorage
    if (isCloudStorageSupported) {
        try {
            await new Promise((resolve, reject) => {
                tg.CloudStorage.setItem('financeAppData', dataString, (error, result) => {
                    if (error) {
                        console.error('CloudStorage setItem error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Данные сохранены в Telegram CloudStorage');
                        resolve(result);
                    }
                });
            });
            cloudSaved = true;
        } catch (error) {
            console.error('❌ Ошибка CloudStorage:', error);
        }
    } else {
        console.warn('⚠️ CloudStorage не поддерживается (требуется Telegram v6.9+)');
    }
    
    // ОБЯЗАТЕЛЬНО сохраняем в localStorage как резервную копию
    try {
        localStorage.setItem('financeAppData', dataString);
        localStorage.setItem('financeAppData_timestamp', Date.now().toString());
        console.log('✅ Данные сохранены в localStorage (backup)');
    } catch (e) {
        console.error('❌ Ошибка localStorage:', e);
    }
    
    return cloudSaved;
}

// Функция для загрузки данных
async function loadFromTelegramCloud() {
    let cloudData = null;
    let localData = null;
    
    // Пытаемся загрузить из CloudStorage
    if (isCloudStorageSupported) {
        try {
            const dataString = await new Promise((resolve, reject) => {
                tg.CloudStorage.getItem('financeAppData', (error, result) => {
                    if (error) {
                        console.error('CloudStorage getItem error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
            
            if (dataString && dataString.length > 0) {
                cloudData = JSON.parse(dataString);
                console.log('✅ Данные загружены из CloudStorage');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки из CloudStorage:', error);
        }
    }
    
    // Загружаем из localStorage
    try {
        const localDataString = localStorage.getItem('financeAppData');
        const timestamp = localStorage.getItem('financeAppData_timestamp');
        
        if (localDataString) {
            localData = JSON.parse(localDataString);
            console.log('✅ Данные загружены из localStorage');
            console.log('📅 Время последнего сохранения:', timestamp ? new Date(parseInt(timestamp)).toLocaleString('ru-RU') : 'неизвестно');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки из localStorage:', error);
    }
    
    // Возвращаем наиболее свежие данные
    if (cloudData && localData) {
        // Если есть оба источника, выбираем более свежий
        const cloudTimestamp = cloudData.lastModified || 0;
        const localTimestamp = parseInt(localStorage.getItem('financeAppData_timestamp')) || 0;
        
        if (cloudTimestamp > localTimestamp) {
            console.log('🔄 Используем данные из CloudStorage (более свежие)');
            return cloudData;
        } else {
            console.log('🔄 Используем данные из localStorage (более свежие)');
            return localData;
        }
    }
    
    return cloudData || localData || null;
}

// Автосохранение при любых изменениях данных
let saveTimeout;
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        if (appData) {
            appData.lastModified = Date.now();
            await saveToTelegramCloud(appData);
            console.log('💾 Автосохранение выполнено');
        }
    }, 500); // Сохраняем через 0.5 секунды
}

// Принудительное сохранение (вызываем при закрытии)
async function forceSave() {
    if (appData) {
        appData.lastModified = Date.now();
        await saveToTelegramCloud(appData);
        console.log('💾 Принудительное сохранение выполнено');
    }
}

// Отслеживание изменений массивов для автосохранения
function makeArrayObservable(arr) {
    const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    methods.forEach(method => {
        const original = arr[method];
        if (typeof original === 'function') {
            arr[method] = function(...args) {
                const result = original.apply(this, args);
                autoSave();
                return result;
            };
        }
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
        },
        lastModified: Date.now()
    };
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ==========================================

let appData = null;
let isInitialized = false;

// Асинхронная инициализация с загрузкой данных
(async function initializeApp() {
    console.log('🚀 Начало инициализации приложения...');
    
    try {
        // Показываем индикатор загрузки
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        // Загружаем данные из хранилища
        const savedData = await loadFromTelegramCloud();
        
        if (savedData) {
            console.log('✅ Восстановлены сохраненные данные');
            appData = savedData;
        } else {
            console.log('📝 Создаем новые данные по умолчанию');
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
        
        // Ждём загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        appData = getDefaultAppData();
        showToast('Ошибка загрузки данных. Созданы данные по умолчанию.', 'warning');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }
    }
})();

function startApp() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🎯 Запуск интерфейса приложения');
    
    // Скрываем индикатор загрузки
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    initializeTabs();
    loadInitialData();
    updateAllCalculations();
    initializeCharts();
    initializeCalendarHeatmap();
    
    showToast('Приложение загружено. Добро пожаловать!', 'success');
}

// Сохраняем данные перед закрытием приложения
window.addEventListener('beforeunload', () => {
    forceSave();
});

// Сохраняем при потере фокуса (переключение на другое приложение)
window.addEventListener('blur', () => {
    forceSave();
});

// Telegram-специфичное событие закрытия
tg.onEvent('viewportChanged', () => {
    if (!tg.isExpanded) {
        forceSave();
    }
});

// Периодическое автосохранение каждые 30 секунд
setInterval(() => {
    if (appData) {
        forceSave();
    }
}, 30000);

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

// Остальные функции остаются без изменений...
// (addIncome, removeIncome, renderIncomes, addFixedExpense, и т.д.)
