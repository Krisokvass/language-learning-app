// Модуль storage.js - Абстракция для работы с localStorage

const StorageService = (function() {
    const STORAGE_KEYS = {
        PROGRESS: 'lingua_progress',
        SETTINGS: 'lingua_settings',
        VOCABULARY: 'lingua_vocabulary',
        STATISTICS: 'lingua_statistics'
    };

    // Проверка доступности localStorage
    function isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage недоступен:', e);
            return false;
        }
    }

    // Безопасное чтение данных
    function getItem(key, defaultValue = null) {
        if (!isLocalStorageAvailable()) return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Ошибка чтения ${key}:`, e);
            return defaultValue;
        }
    }

    // Безопасная запись данных
    function setItem(key, value) {
        if (!isLocalStorageAvailable()) return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('Превышен лимит localStorage');
                clearOldData();
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Не удалось сохранить даже после очистки');
                    return false;
                }
            }
            return false;
        }
    }

    // Очистка старых данных при переполнении
    function clearOldData() {
        // Удаляем статистику за старые периоды, оставляя только последние 30 дней
        const stats = getItem(STORAGE_KEYS.STATISTICS, { dailyData: [] });
        if (stats.dailyData && stats.dailyData.length > 30) {
            stats.dailyData = stats.dailyData.slice(-30);
            setItem(STORAGE_KEYS.STATISTICS, stats);
        }
    }

    // Удаление данных (для сброса прогресса)
    function removeItem(key) {
        if (!isLocalStorageAvailable()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Ошибка удаления ${key}:`, e);
            return false;
        }
    }

    // Получение прогресса
    function getProgress() {
        return getItem(STORAGE_KEYS.PROGRESS, {
            completedLessons: [],
            currentLesson: 0,
            totalXP: 0,
            level: 1,
            achievements: [],
            lessonAttempts: {}
        });
    }

    // Сохранение прогресса
    function saveProgress(progressData) {
        return setItem(STORAGE_KEYS.PROGRESS, progressData);
    }

    // Получение настроек
    function getSettings() {
        return getItem(STORAGE_KEYS.SETTINGS, {
            soundEnabled: true,
            volume: 0.7,
            theme: 'light',
            transcriptionType: 'ipa'
        });
    }

    // Сохранение настроек
    function saveSettings(settings) {
        return setItem(STORAGE_KEYS.SETTINGS, settings);
    }

    // Получение словаря пользователя
    function getVocabulary() {
        return getItem(STORAGE_KEYS.VOCABULARY, {
            learnedWords: [],
            customWords: [],
            totalWordsLearned: 0
        });
    }

    // Сохранение словаря
    function saveVocabulary(vocabulary) {
        return setItem(STORAGE_KEYS.VOCABULARY, vocabulary);
    }

    // Получение статистики
    function getStatistics() {
        return getItem(STORAGE_KEYS.STATISTICS, {
            totalExercises: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            dailyData: [],
            skillStats: {
                reading: { correct: 0, total: 0 },
                writing: { correct: 0, total: 0 },
                listening: { correct: 0, total: 0 }
            }
        });
    }

    // Сохранение статистики
    function saveStatistics(stats) {
        return setItem(STORAGE_KEYS.STATISTICS, stats);
    }

    // Сброс всех данных (для тестирования или начала заново)
    function resetAllData() {
        removeItem(STORAGE_KEYS.PROGRESS);
        removeItem(STORAGE_KEYS.SETTINGS);
        removeItem(STORAGE_KEYS.VOCABULARY);
        removeItem(STORAGE_KEYS.STATISTICS);
    }

    // Публичное API
    return {
        getProgress,
        saveProgress,
        getSettings,
        saveSettings,
        getVocabulary,
        saveVocabulary,
        getStatistics,
        saveStatistics,
        resetAllData,
        isAvailable: isLocalStorageAvailable
    };
})();
