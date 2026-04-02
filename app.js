javascript
// Модуль app.js - Главный контроллер приложения

const App = (function() {
    let currentView = 'home';
    let currentExerciseSequence = [];
    let currentExerciseIndex = 0;
    let currentLessonId = null;
    let currentSkillType = null;

    // Инициализация приложения
    async function init() {
        // Инициализация всех модулей
        StorageService.isAvailable();
        ProgressManager.init();
        MediaManager.init();
        ModuleManager.init();
        
        // Загрузка сохранённых настроек
        loadSettings();
        
        // Настройка обработчиков навигации
        setupNavigation();
        
        // Загрузка главного экрана
        loadHomeScreen();
        
        console.log('Приложение успешно запущено');
    }

    // Загрузка настроек
    function loadSettings() {
        const settings = StorageService.getSettings();
        // Применение настроек (тема, звук и т.д.)
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // Настройка навигации
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                switchView(view);
                
                // Обновление активной кнопки
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Переключение между представлениями
    function switchView(view) {
        currentView = view;
        switch(view) {
            case 'home':
                loadHomeScreen();
                break;
            case 'lessons':
                loadLessonsScreen();
                break;
            case 'practice':
                loadPracticeScreen();
                break;
            case 'progress':
                loadProgressScreen();
                break;
        }
    }

    // Загрузка главного экрана
    function loadHomeScreen() {
        const mainContent = document.getElementById('mainContent');
        const dashboard = ProgressManager.getDashboardData();
        
        mainContent.innerHTML = `
            <div class="welcome-card">
                <h2>👋 Добро пожаловать в LinguaMaster!</h2>
                <p>Продолжайте учить английский язык каждый день</p>
                <div class="daily-streak">🔥 Серия: ${Math.floor(dashboard.totalXP / 100)} дней</div>
            </div>
            
            <div class="quick-actions">
                <div class="action-card" onclick="App.startLesson()">
                    <span>📚</span>
                    <h3>Начать урок</h3>
                    <p>Продолжить обучение</p>
                </div>
                <div class="action-card" onclick="App.startPractice('all')">
                    <span>🎯</span>
                    <h3>Быстрая тренировка</h3>
                    <p>10 минут в день</p>
                </div>
                <div class="action-card" onclick="App.openSkillPractice()">
                    <span>🎧</span>
                    <h3>Тренировка навыков</h3>
                    <p>Чтение, письмо, аудирование</p>
                </div>
                <div class="action-card" onclick="App.openChat()">
                    <span>💬</span>
                    <h3>Общение</h3>
                    <p>Практика с другими</p>
                </div>
            </div>
            
            <div class="stats-preview">
                <h3>Ваш прогресс</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${dashboard.lessonsCompleted}</div>
                        <div>уроков пройдено</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${dashboard.wordsLearned}</div>
                        <div>слов выучено</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${dashboard.accuracy}%</div>
                        <div>точность</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${dashboard.totalXP}</div>
                        <div>опыта</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Загрузка экрана уроков
    function loadLessonsScreen() {
        const mainContent = document.getElementById('mainContent');
        const allLessons = ModuleManager.getAllLessons();
        const courseProgress = ModuleManager.getCourseProgress();
        
        let lessonsHtml = `
            <h2>📚 Уроки</h2>
            <div class="course-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${courseProgress.percentage}%"></div>
                </div>
                <p>Пройдено ${courseProgress.completedLessons} из ${courseProgress.totalLessons} уроков</p>
            </div>
            <div class="lessons-list">
        `;
        
        for (const lesson of allLessons) {
            const statusIcon = lesson.completed ? '✅' : '📖';
            const isAvailable = ModuleManager.isLessonAvailable(lesson.id);
            const clickHandler = isAvailable ? `App.startLessonById('${lesson.id}')` : null;
            const disabledClass = !isAvailable ? 'disabled' : '';
            
            lessonsHtml += `
                <div class="lesson-item ${lesson.completed ? 'completed' : ''} ${disabledClass}" 
                     onclick="${clickHandler}">
                    <div>
                        <strong>${lesson.title}</strong>
                        <small>${lesson.levelName}</small>
                    </div>
                    <div class="lesson-status">${statusIcon}</div>
                </div>
            `;
        }
        
        lessonsHtml += `</div>`;
        mainContent.innerHTML = lessonsHtml;
    }

    // Загрузка экрана тренировки навыков
    function loadPracticeScreen() {
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <h2>🎯 Тренировка навыков</h2>
            <div class="skills-grid">
                <div class="action-card" onclick="App.startPractice('reading')">
                    <span>📖</span>
                    <h3>Чтение</h3>
                    <p>Понимание текста</p>
                </div>
                <div class="action-card" onclick="App.startPractice('writing')">
                    <span>✍️</span>
                    <h3>Письмо</h3>
                    <p>Правописание и грамматика</p>
                </div>
                <div class="action-card" onclick="App.startPractice('listening')">
                    <span>🎧</span>
                    <h3>Аудирование</h3>
                    <p>Восприятие на слух</p>
                </div>
            </div>
            <button class="next-btn" onclick="App.startPractice('all')">Случайная тренировка</button>
        `;
    }

    // Загрузка экрана прогресса
    function loadProgressScreen() {
        const mainContent = document.getElementById('mainContent');
        const dashboard = ProgressManager.getDashboardData();
        const performance = ProgressManager.getPerformanceStats();
        const learnedWords = ProgressManager.getLearnedWords();
        
        mainContent.innerHTML = `
            <h2>📊 Мой прогресс</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${dashboard.level}</div>
                    <div>Уровень</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${dashboard.totalXP}</div>
                    <div>Опыт (XP)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${dashboard.lessonsCompleted}</div>
                    <div>Уроков пройдено</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${dashboard.wordsLearned}</div>
                    <div>Слов выучено</div>
                </div>
            </div>
            
            <h3>📈 Статистика по навыкам</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div>Чтение</div>
                    <div class="stat-value">${performance.skillStats.reading.correct}/${performance.skillStats.reading.total}</div>
                </div>
                <div class="stat-card">
                    <div>Письмо</div>
                    <div class="stat-value">${performance.skillStats.writing.correct}/${performance.skillStats.writing.total}</div>
                </div>
                <div class="stat-card">
                    <div>Аудирование</div>
                    <div class="stat-value">${performance.skillStats.listening.correct}/${performance.skillStats.listening.total}</div>
                </div>
            </div>
            
            <h3>📖 Выученные слова (${learnedWords.length})</h3>
            <div class="words-list">
                ${learnedWords.slice(0, 10).map(w => `
                    <div class="word-item">
                        <strong>${w.word}</strong> — ${w.translation}
                    </div>
                `).join('')}
                ${learnedWords.length === 0 ? '<p>Пока нет выученных слов. Начните уроки!</p>' : ''}
            </div>
        `;
    }

    // Начать урок с текущим уроком
    function startLesson() {
        const currentLesson = ModuleManager.getCurrentLesson();
        if (currentLesson) {
            startLessonById(currentLesson.id);
        } else {
            const firstLesson = ModuleManager.getAllLessons()[0];
            if (firstLesson) {
                startLessonById(firstLesson.id);
            }
        }
    }

    // Начать урок по ID
    function startLessonById(lessonId) {
        currentLessonId = lessonId;
        currentSkillType = null;
        const exercises = ModuleManager.loadLessonExercises(lessonId);
        
        if (exercises.length === 0) {
            alert('В этом уроке пока нет упражнений');
            return;
        }
        
        // Преобразуем упражнения в формат для ExerciseManager
        currentExerciseSequence = exercises.map(ex => {
            if (ex.type === 'word_card') {
                return {
                    type: 'word_card',
                    word: ex.word,
                    translation: ex.translation
                };
            } else {
                return ExerciseManager.getExerciseByType('multiple_choice');
            }
        });
        
        currentExerciseIndex = 0;
        showExercise();
    }

    // Начать тренировку навыков
    function startPractice(skillType) {
        currentSkillType = skillType;
        currentLessonId = null;
        
        // Генерируем 5 случайных упражнений
        currentExerciseSequence = [];
        for (let i = 0; i < 5; i++) {
            currentExerciseSequence.push(ExerciseManager.getRandomExercise(skillType));
        }
        
        currentExerciseIndex = 0;
        showExercise();
    }

    // Открыть выбор навыков для тренировки
    function openSkillPractice() {
        loadPracticeScreen();
    }

    // Открыть чат (заглушка для будущей реализации)
    function openChat() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="exercise-container">
                <h2>💬 Общение</h2>
                <p>Функция общения с другими пользователями и чат-ботом будет доступна в следующей версии приложения.</p>
                <button class="next-btn" onclick="App.switchView('home')">Вернуться на главную</button>
            </div>
        `;
    }

    // Отображение текущего упражнения
    function showExercise() {
        if (currentExerciseIndex >= currentExerciseSequence.length) {
            completeLessonOrPractice();
            return;
        }
        
        const exercise = currentExerciseSequence[currentExerciseIndex];
        const mainContent = document.getElementById('mainContent');
        
        if (exercise.type === 'word_card') {
            // Отображение карточки слова
            mainContent.innerHTML = `
                <div class="exercise-container">
                    <h2>📖 Запомните слово</h2>
                    <div class="question-text">
                        ${exercise.word}
                        <button class="speak-btn" onclick="App.speakCurrentWord()">🔊</button>
                    </div>
                    <div class="translation-hint">
                        <p>Перевод: ${exercise.translation}</p>
                    </div>
                    <button class="next-btn" onclick="App.nextExercise()">Далее →</button>
                </div>
            `;
        } else {
            // Отображение интерактивного упражнения
            const isMultipleChoice = exercise.type === 'multiple_choice' || exercise.options;
            const question = exercise.question || `Что означает "${exercise.word || exercise.questionWord || exercise.wordToListen}"?`;
            const options = exercise.options || [];
            
            let optionsHtml = '';
            if (isMultipleChoice && options.length > 0) {
                optionsHtml = '<div class="options-list">';
                for (const opt of options) {
                    optionsHtml += `
                        <button class="option-btn" onclick="App.checkExerciseAnswer('${opt.text.replace(/'/g, "\\'")}')">
                            ${opt.text}
                        </button>
                    `;
                }
                optionsHtml += '</div>';
            } else {
                optionsHtml = `
                    <input type="text" id="userAnswer" placeholder="Введите ответ" class="answer-input">
                    <button class="check-btn" onclick="App.checkExerciseAnswerFromInput()">Проверить</button>
                `;
            }
            
            mainContent.innerHTML = `
                <div class="exercise-container">
                    <div class="exercise-header">
                        <span>Упражнение ${currentExerciseIndex + 1} из ${currentExerciseSequence.length}</span>
                        ${exercise.type === 'listening' ? '<button class="listen-btn" onclick="App.listenToWord()">🔊 Прослушать</button>' : ''}
                    </div>
                    <div class="question-text">${question}</div>
                    ${optionsHtml}
                    <div id="feedback" class="feedback"></div>
                </div>
            `;
            
            // Автоматическое озвучивание для упражнений на аудирование
            if (exercise.type === 'listening' && exercise.wordToListen) {
                setTimeout(() => MediaManager.speakWord(exercise.wordToListen, 'en-US'), 500);
            }
        }
    }

    // Озвучить текущее слово (для карточек)
    function speakCurrentWord() {
        const exercise = currentExerciseSequence[currentExerciseIndex];
        if (exercise && exercise.word) {
            MediaManager.speakWord(exercise.word, 'en-US');
        }
    }

    // Прослушать слово для аудирования
    function listenToWord() {
        const exercise = currentExerciseSequence[currentExerciseIndex];
        if (exercise && exercise.wordToListen) {
            MediaManager.speakWord(exercise.wordToListen, 'en-US');
        }
    }

    // Проверка ответа из вариантов
    function checkExerciseAnswer(answer) {
        const exercise = currentExerciseSequence[currentExerciseIndex];
        const result = ExerciseManager.checkAnswer(answer);
        
        const feedbackDiv = document.getElementById('feedback');
        if (feedbackDiv) {
            feedbackDiv.textContent = result.feedback;
            feedbackDiv.className = `feedback ${result.correct ? 'correct' : 'wrong'}`;
        }
        
        if (result.correct) {
            ProgressManager.addXP(result.xpEarned, currentSkillType || 'lesson', true);
            MediaManager.playCorrectSound();
            
            // Автоматический переход к следующему упражнению через 1 секунду
            setTimeout(() => {
                currentExerciseIndex++;
                showExercise();
            }, 1000);
        } else {
            MediaManager.playWrongSound();
            // Блокируем кнопки вариантов на время
            const optionBtns = document.querySelectorAll('.option-btn');
            optionBtns.forEach(btn => btn.disabled = true);
            setTimeout(() => {
                optionBtns.forEach(btn => btn.disabled = false);
            }, 1500);
        }
    }

    // Проверка ответа из текстового поля
    function checkExerciseAnswerFromInput() {
        const input = document.getElementById('userAnswer');
        if (input) {
            checkExerciseAnswer(input.value);
            input.value = '';
        }
    }

    // Переход к следующему упражнению (для карточек)
    function nextExercise() {
        currentExerciseIndex++;
        showExercise();
    }

    // Завершение урока или тренировки
    function completeLessonOrPractice() {
        if (currentLessonId) {
            // Завершение урока
            ProgressManager.completeLesson(currentLessonId, 100);
            MediaManager.playCompleteSound();
            
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="exercise-container">
                    <h2>🎉 Поздравляем!</h2>
                    <p>Вы успешно завершили урок!</p>
                    <p>Получено: +50 XP</p>
                    <button class="next-btn" onclick="App.switchView('lessons')">К списку уроков</button>
                </div>
            `;
        } else {
            // Завершение тренировки
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="exercise-container">
                    <h2>🏆 Тренировка завершена!</h2>
                    <p>Отличная работа! Продолжайте в том же духе.</p>
                    <button class="next-btn" onclick="App.switchView('home')">На главную</button>
                </div>
            `;
        }
        
        currentLessonId = null;
        currentExerciseSequence = [];
        currentExerciseIndex = 0;
    }

    // Публичное API для доступа из HTML
    return {
        init,
        switchView,
        startLesson,
        startLessonById,
        startPractice,
        openSkillPractice,
        openChat,
        showExercise,
        speakCurrentWord,
        listenToWord,
        checkExerciseAnswer,
        checkExerciseAnswerFromInput,
        nextExercise,
        completeLessonOrPractice
    };
})();

// Запуск приложения после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
