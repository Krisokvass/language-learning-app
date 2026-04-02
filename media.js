// Модуль media.js - Работа с аудио, видео, произношением

const MediaManager = (function() {
    let audioContext = null;
    let currentAudio = null;
    let settings = null;
    let isSpeaking = false;

    // Инициализация
    function init() {
        settings = StorageService.getSettings();
        if (window.AudioContext || window.webkitAudioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this;
    }

    // Получение настроек звука
    function getSettings() {
        return settings;
    }

    // Обновление настроек
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        StorageService.saveSettings(settings);
    }

    // Воспроизведение звукового файла
    function playSound(soundFileName, onEnd = null) {
        if (!settings.soundEnabled) return;
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        const audio = new Audio(`assets/audio/${soundFileName}`);
        audio.volume = settings.volume;
        
        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
        });
        
        if (onEnd) {
            audio.addEventListener('ended', onEnd);
        }
        
        currentAudio = audio;
        return audio;
    }

    // Воспроизведение произношения слова с использованием Web Speech API
    function speakWord(word, language = 'en-US') {
        if (!settings.soundEnabled) return Promise.reject('Звук отключён');
        
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject('Web Speech API не поддерживается');
                return;
            }
            
            // Остановить текущую речь
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = language;
            utterance.rate = 0.9;  // Немного медленнее для лучшего восприятия
            utterance.pitch = 1;
            utterance.volume = settings.volume;
            
            utterance.onstart = () => {
                isSpeaking = true;
            };
            
            utterance.onend = () => {
                isSpeaking = false;
                resolve();
            };
            
            utterance.onerror = (error) => {
                isSpeaking = false;
                reject(error);
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }

    // Воспроизведение звука правильного ответа
    function playCorrectSound() {
        playSound('correct.mp3');
    }

    // Воспроизведение звука неправильного ответа
    function playWrongSound() {
        playSound('wrong.mp3');
    }

    // Воспроизведение звука завершения урока
    function playCompleteSound() {
        playSound('complete.mp3');
    }

    // Синтез речи для целой фразы
    function speakPhrase(phrase, language, onEnd = null) {
        if (!settings.soundEnabled) return;
        
        if (window.speechSynthesis) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.lang = language;
            utterance.rate = 0.8;
            utterance.volume = settings.volume;
            
            utterance.onend = () => {
                isSpeaking = false;
                if (onEnd) onEnd();
            };
            
            window.speechSynthesis.speak(utterance);
            isSpeaking = true;
        }
    }

    // Остановка воспроизведения
    function stopSpeaking() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
        }
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    }

    // Получение доступных голосов (для выбора пользователем)
    function getAvailableVoices() {
        if (!window.speechSynthesis) return [];
        return window.speechSynthesis.getVoices();
    }

    // Публичное API
    return {
        init,
        getSettings,
        updateSettings,
        playSound,
        speakWord,
        speakPhrase,
        playCorrectSound,
        playWrongSound,
        playCompleteSound,
        stopSpeaking,
        getAvailableVoices
    };
})();
