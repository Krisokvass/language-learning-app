// Модуль exercises.js - Реализация различных типов упражнений

const ExerciseManager = (function() {
    let currentExercise = null;
    let currentExerciseType = null;
    let onCompleteCallback = null;

    // База данных слов для упражнений (в реальном приложении загружалась бы с сервера)
    const vocabularyDatabase = {
        words: [
            { word: "apple", translation: "яблоко", image: "🍎", difficulty: 1 },
            { word: "cat", translation: "кот", image: "🐱", difficulty: 1 },
            { word: "dog", translation: "собака", image: "🐕", difficulty: 1 },
            { word: "house", translation: "дом", image: "🏠", difficulty: 1 },
            { word: "car", translation: "машина", image: "🚗", difficulty: 1 },
            { word: "beautiful", translation: "красивый", image: "🌸", difficulty: 2 },
            { word: "happy", translation: "счастливый", image: "😊", difficulty: 2 },
            { word: "big", translation: "большой", image: "🐘", difficulty: 1 },
            { word: "small", translation: "маленький", image: "🐭", difficulty: 1 },
            { word: "run", translation: "бежать", image: "🏃", difficulty: 2 }
        ]
    };

    // Типы упражнений
    const ExerciseTypes = {
        MULTIPLE_CHOICE: 'multiple_choice',
        WORD_CARD: 'word_card',
        LISTENING: 'listening',
        TRANSLATION: 'translation'
    };

    // Создание упражнения на выбор правильного перевода
    function createMultipleChoiceExercise() {
        const currentWord = vocabularyDatabase.words[Math.floor(Math.random() * vocabularyDatabase.words.length)];
        
        // Подбираем варианты ответов
        const otherWords = vocabularyDatabase.words
            .filter(w => w.word !== currentWord.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [
            { text: currentWord.translation, correct: true },
            ...otherWords.map(w => ({ text: w.translation, correct: false }))
        ].sort(() => 0.5 - Math.random());
        
        return {
            type: ExerciseTypes.MULTIPLE_CHOICE,
            question: `Что означает слово "${currentWord.word}"?`,
            questionWord: currentWord.word,
            correctAnswer: currentWord.translation,
            options: options,
            image: currentWord.image,
            wordData: currentWord
        };
    }

    // Создание упражнения на карточках
    function createWordCardExercise() {
        const word = vocabularyDatabase.words[Math.floor(Math.random() * vocabularyDatabase.words.length)];
        
        return {
            type: ExerciseTypes.WORD_CARD,
            word: word.word,
            translation: word.translation,
            image: word.image,
            wordData: word
        };
    }

    // Создание упражнения на аудирование
    function createListeningExercise() {
        const word = vocabularyDatabase.words[Math.floor(Math.random() * vocabularyDatabase.words.length)];
        
        const otherTranslations = vocabularyDatabase.words
            .filter(w => w.word !== word.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(w => w.translation);
        
        const options = [
            { text: word.translation, correct: true },
            ...otherTranslations.map(t => ({ text: t, correct: false }))
        ].sort(() => 0.5 - Math.random());
        
        return {
            type: ExerciseTypes.LISTENING,
            wordToListen: word.word,
            correctTranslation: word.translation,
            options: options,
            wordData: word
        };
    }

    // Создание упражнения на перевод
    function createTranslationExercise() {
        const useForward = Math.random() > 0.5;
        const word = vocabularyDatabase.words[Math.floor(Math.random() * vocabularyDatabase.words.length)];
        
        return {
            type: ExerciseTypes.TRANSLATION,
            question: useForward ? `Переведите на русский: ${word.word}` : `Переведите на английский: ${word.translation}`,
            correctAnswer: useForward ? word.translation : word.word,
            wordData: word,
            isForward: useForward
        };
    }

    // Получение случайного упражнения
    function getRandomExercise(skillType = 'all') {
        const types = [
            createMultipleChoiceExercise,
            createWordCardExercise,
            createListeningExercise,
            createTranslationExercise
        ];
        
        const randomIndex = Math.floor(Math.random() * types.length);
        currentExercise = types[randomIndex]();
        currentExerciseType = currentExercise.type;
        
        return currentExercise;
    }

    // Получение упражнения по типу
    function getExerciseByType(type) {
        switch(type) {
            case ExerciseTypes.MULTIPLE_CHOICE:
                currentExercise = createMultipleChoiceExercise();
                break;
            case ExerciseTypes.WORD_CARD:
                currentExercise = createWordCardExercise();
                break;
            case ExerciseTypes.LISTENING:
                currentExercise = createListeningExercise();
                break;
            case ExerciseTypes.TRANSLATION:
                currentExercise = createTranslationExercise();
                break;
            default:
                currentExercise = getRandomExercise();
        }
        currentExerciseType = currentExercise.type;
        return currentExercise;
    }

    // Проверка ответа пользователя
    function checkAnswer(userAnswer) {
        if (!currentExercise) return { correct: false, message: 'Упражнение не загружено' };
        
        const isCorrect = userAnswer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim();
        
        let feedback = '';
        let xpEarned = 0;
        
        if (isCorrect) {
            xpEarned = 10;
            feedback = `✅ Правильно! ${currentExercise.correctAnswer} — верный ответ. +${xpEarned} XP`;
            
            // Добавляем слово в выученные
            if (currentExercise.wordData) {
                ProgressManager.addLearnedWord(
                    currentExercise.wordData.word, 
                    currentExercise.wordData.translation
                );
            }
        } else {
            feedback = `❌ Неправильно. Правильный ответ: "${currentExercise.correctAnswer}". Попробуйте еще раз!`;
        }
        
        return {
            correct: isCorrect,
            feedback: feedback,
            xpEarned: xpEarned,
            exercise: currentExercise
        };
    }

    // Озвучивание слова для текущего упражнения (если есть аудио)
    function speakCurrentWord() {
        if (currentExercise && currentExercise.wordData) {
            MediaManager.speakWord(currentExercise.wordData.word, 'en-US');
        }
    }

    // Установка колбэка на завершение упражнения
    function setOnComplete(callback) {
        onCompleteCallback = callback;
    }

    // Завершение упражнения
    function completeExercise(isCorrect) {
        if (onCompleteCallback) {
            onCompleteCallback(isCorrect, currentExercise);
        }
    }

    // Получение текущего упражнения
    function getCurrentExercise() {
        return currentExercise;
    }

    // Получение доступных типов упражнений
    function getAvailableExerciseTypes() {
        return Object.values(ExerciseTypes);
    }

    // Публичное API
    return {
        getRandomExercise,
        getExerciseByType,
        checkAnswer,
        speakCurrentWord,
        setOnComplete,
        completeExercise,
        getCurrentExercise,
        getAvailableExerciseTypes,
        ExerciseTypes
    };
})();
