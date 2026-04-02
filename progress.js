// Модуль progress.js - Управление прогрессом пользователя

const ProgressManager = (function() {
    let currentProgress = null;
    let currentStatistics = null;
    let currentVocabulary = null;

    // Инициализация модуля
    function init() {
        currentProgress = StorageService.getProgress();
        currentStatistics = StorageService.getStatistics();
        currentVocabulary = StorageService.getVocabulary();
        updateUIStats();
        return this;
    }

    // Обновление отображения статистики в UI
    function updateUIStats() {
        const userLevelSpan = document.getElementById('userLevel');
        const userPointsSpan = document.getElementById('userPoints');
        
        if (userLevelSpan) {
            userLevelSpan.textContent = `Уровень ${currentProgress.level}`;
        }
        if (userPointsSpan) {
            userPointsSpan.textContent = `⭐ ${currentProgress.totalXP} XP`;
        }
    }

    // Получение текущего уровня на основе XP
    function calculateLevel(xp) {
        return Math.floor(xp / 100) + 1;
    }

    // Добавление опыта за выполненное упражнение
    function addXP(amount, exerciseType, isCorrect) {
        currentProgress.totalXP += amount;
        currentProgress.level = calculateLevel(currentProgress.totalXP);
        
        // Обновление статистики
        currentStatistics.totalExercises++;
        if (isCorrect) {
            currentStatistics.correctAnswers++;
        } else {
            currentStatistics.wrongAnswers++;
        }
        
        // Обновление статистики по навыкам
        if (currentStatistics.skillStats[exerciseType]) {
            currentStatistics.skillStats[exerciseType].total++;
            if (isCorrect) {
                currentStatistics.skillStats[exerciseType].correct++;
            }
        }
        
        saveAll();
        updateUIStats();
        return currentProgress.level;
    }

    // Отметка урока как пройденного
    function completeLesson(lessonId, score) {
        if (!currentProgress.completedLessons.includes(lessonId)) {
            currentProgress.completedLessons.push(lessonId);
            
            // Бонус XP за завершение урока
            const bonusXP = 50;
            addXP(bonusXP, 'lesson_complete', true);
        }
        
        // Сохраняем результат попытки
        if (!currentProgress.lessonAttempts[lessonId]) {
            currentProgress.lessonAttempts[lessonId] = [];
        }
        currentProgress.lessonAttempts[lessonId].push({
            date: new Date().toISOString(),
            score: score,
            xpEarned: score * 10
        });
        
        saveAll();
    }

    // Обновление текущего урока
    function setCurrentLesson(lessonId) {
        currentProgress.currentLesson = lessonId;
        saveAll();
    }

    // Добавление слова в выученные
    function addLearnedWord(word, translation) {
        if (!currentVocabulary.learnedWords.some(w => w.word === word)) {
            currentVocabulary.learnedWords.push({
                word: word,
                translation: translation,
                learnedAt: new Date().toISOString(),
                reviewCount: 0
            });
            currentVocabulary.totalWordsLearned = currentVocabulary.learnedWords.length;
            saveAll();
            return true;
        }
        return false;
    }

    // Получение прогресса по урокам
    function getLessonProgress() {
        return {
            completedCount: currentProgress.completedLessons.length,
            totalXP: currentProgress.totalXP,
            level: currentProgress.level,
            currentLesson: currentProgress.currentLesson
        };
    }

    // Получение статистики успеваемости
    function getPerformanceStats() {
        const total = currentStatistics.totalExercises;
        const correct = currentStatistics.correctAnswers;
        const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
        
        return {
            totalExercises: total,
            correctAnswers: correct,
            wrongAnswers: currentStatistics.wrongAnswers,
            accuracy: accuracy,
            skillStats: currentStatistics.skillStats
        };
    }

    // Получение списка выученных слов
    function getLearnedWords() {
        return currentVocabulary.learnedWords;
    }

    // Сохранение всех данных
    function saveAll() {
        StorageService.saveProgress(currentProgress);
        StorageService.saveStatistics(currentStatistics);
        StorageService.saveVocabulary(currentVocabulary);
    }

    // Получение общей статистики для отображения на экране прогресса
    function getDashboardData() {
        const performance = getPerformanceStats();
        return {
            level: currentProgress.level,
            totalXP: currentProgress.totalXP,
            lessonsCompleted: currentProgress.completedLessons.length,
            wordsLearned: currentVocabulary.totalWordsLearned,
            accuracy: performance.accuracy,
            totalExercises: performance.totalExercises,
            achievements: currentProgress.achievements
        };
    }

    // Добавление достижения
    function addAchievement(achievementId, achievementName) {
        if (!currentProgress.achievements.includes(achievementId)) {
            currentProgress.achievements.push(achievementId);
            // Бонус XP за достижение
            addXP(100, 'achievement', true);
            saveAll();
            return true;
        }
        return false;
    }

    // Публичное API
    return {
        init,
        addXP,
        completeLesson,
        setCurrentLesson,
        addLearnedWord,
        getLessonProgress,
        getPerformanceStats,
        getLearnedWords,
        getDashboardData,
        addAchievement,
        updateUIStats
    };
})();
