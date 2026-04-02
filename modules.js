// Модуль modules.js - Управление структурой уроков и учебных модулей

const ModuleManager = (function() {
    // Структура учебных модулей
    const courseStructure = {
        title: "Английский язык - Начальный курс",
        levels: [
            {
                id: 1,
                name: "Уровень 1: Основы",
                lessons: [
                    { id: "L1_1", title: "Приветствия и знакомство", words: ["hello", "goodbye", "name"], completed: false, xpReward: 50 },
                    { id: "L1_2", title: "Семья и друзья", words: ["mother", "father", "brother", "sister"], completed: false, xpReward: 50 },
                    { id: "L1_3", title: "Цвета", words: ["red", "blue", "green", "yellow"], completed: false, xpReward: 50 }
                ]
            },
            {
                id: 2,
                name: "Уровень 2: Повседневная жизнь",
                lessons: [
                    { id: "L2_1", title: "Еда и напитки", words: ["apple", "water", "bread", "milk"], completed: false, xpReward: 75 },
                    { id: "L2_2", title: "Дом и мебель", words: ["table", "chair", "door", "window"], completed: false, xpReward: 75 },
                    { id: "L2_3", title: "Одежда", words: ["shirt", "pants", "shoes", "hat"], completed: false, xpReward: 75 }
                ]
            }
        ]
    };

    let currentModule = null;
    let currentLesson = null;
    let lessonExercises = [];

    // Инициализация
    function init() {
        const progress = StorageService.getProgress();
        updateLessonsCompletionStatus(progress.completedLessons);
        return this;
    }

    // Обновление статуса завершения уроков на основе сохранённого прогресса
    function updateLessonsCompletionStatus(completedLessonIds) {
        for (const level of courseStructure.levels) {
            for (const lesson of level.lessons) {
                lesson.completed = completedLessonIds.includes(lesson.id);
            }
        }
    }

    // Получение всей структуры курса
    function getCourseStructure() {
        return courseStructure;
    }

    // Получение списка всех уроков
    function getAllLessons() {
        const allLessons = [];
        for (const level of courseStructure.levels) {
            for (const lesson of level.lessons) {
                allLessons.push({
                    ...lesson,
                    levelName: level.name,
                    levelId: level.id
                });
            }
        }
        return allLessons;
    }

    // Получение урока по ID
    function getLessonById(lessonId) {
        for (const level of courseStructure.levels) {
            const lesson = level.lessons.find(l => l.id === lessonId);
            if (lesson) {
                return {
                    ...lesson,
                    levelName: level.name,
                    levelId: level.id
                };
            }
        }
        return null;
    }

    // Получение следующего урока
    function getNextLesson(currentLessonId) {
        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
            return allLessons[currentIndex + 1];
        }
        return null;
    }

    // Получение предыдущего урока
    function getPreviousLesson(currentLessonId) {
        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex > 0) {
            return allLessons[currentIndex - 1];
        }
        return null;
    }

    // Загрузка упражнений для конкретного урока
    function loadLessonExercises(lessonId) {
        const lesson = getLessonById(lessonId);
        if (!lesson) return [];
        
        // Генерация упражнений на основе слов урока
        const exercises = [];
        
        for (const word of lesson.words) {
            // Карточка слова
            exercises.push({
                type: 'word_card',
                word: word,
                translation: getTranslationForWord(word)
            });
            
            // Упражнение на выбор перевода
            exercises.push({
                type: 'multiple_choice',
                word: word,
                translation: getTranslationForWord(word)
            });
        }
        
        lessonExercises = exercises;
        return exercises;
    }

    // Вспомогательная функция для получения перевода слова
    function getTranslationForWord(word) {
        const translations = {
            hello: "привет", goodbye: "до свидания", name: "имя",
            mother: "мама", father: "папа", brother: "брат", sister: "сестра",
            red: "красный", blue: "синий", green: "зелёный", yellow: "жёлтый",
            apple: "яблоко", water: "вода", bread: "хлеб", milk: "молоко",
            table: "стол", chair: "стул", door: "дверь", window: "окно",
            shirt: "рубашка", pants: "штаны", shoes: "обувь", hat: "шляпа"
        };
        return translations[word] || word;
    }

    // Получение текущего урока
    function getCurrentLesson() {
        const progress = StorageService.getProgress();
        if (progress.currentLesson) {
            return getLessonById(progress.currentLesson);
        }
        // Если текущий урок не задан, возвращаем первый доступный
        return getAllLessons()[0];
    }

    // Установка текущего урока
    function setCurrentLesson(lessonId) {
        ProgressManager.setCurrentLesson(lessonId);
        currentLesson = getLessonById(lessonId);
    }

    // Получение прогресса по курсу
    function getCourseProgress() {
        const allLessons = getAllLessons();
        const completedLessons = allLessons.filter(l => l.completed);
        const totalLessons = allLessons.length;
        const completedCount = completedLessons.length;
        
        return {
            totalLessons: totalLessons,
            completedLessons: completedCount,
            percentage: (completedCount / totalLessons) * 100,
            currentLesson: getCurrentLesson()
        };
    }

    // Проверка, доступен ли урок (все предыдущие пройдены)
    function isLessonAvailable(lessonId) {
        const allLessons = getAllLessons();
        const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex === 0) return true;
        if (lessonIndex === -1) return false;
        
        // Проверяем, пройдены ли все предыдущие уроки
        for (let i = 0; i < lessonIndex; i++) {
            if (!allLessons[i].completed) return false;
        }
        return true;
    }

    // Публичное API
    return {
        init,
        getCourseStructure,
        getAllLessons,
        getLessonById,
        getNextLesson,
        getPreviousLesson,
        loadLessonExercises,
        getCurrentLesson,
        setCurrentLesson,
        getCourseProgress,
        isLessonAvailable
    };
})();
