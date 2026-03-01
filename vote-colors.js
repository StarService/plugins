(function () {
    'use strict';

    /**
     * VOTE COLORS (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description: Changes movie rating colors based on value for better visual cues.
     */

    /* --- Маніфест: Сучасний локальний підхід --- */
    var pluginManifest = {
        version: '1.0',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Основна функція: Економна та швидка --- */
    function updateVoteColors() {
        try {
            // Шукаємо лише ті цифри, які ми ще НЕ фарбували
            document.querySelectorAll(".card__vote").forEach(function(voteElement) {
                if (!voteElement.textContent || voteElement.dataset.star_colored) return;
                
                var vote = parseFloat(voteElement.textContent.trim());
                if (isNaN(vote)) return;
                
                // Твоя логіка кольорів (без змін, як ти хотів)
                if (vote >= 0 && vote <= 3) {
                    voteElement.style.color = "#ff3333"; // червоний
                } else if (vote > 3 && vote <= 5.9) {
                    voteElement.style.color = "#ff9933"; // помаранчевий
                } else if (vote >= 6 && vote <= 7.9) {
                    voteElement.style.color = "#3399ff"; // блакитний
                } else if (vote >= 8 && vote <= 10) {
                    voteElement.style.color = "#33cc33"; // зелений
                }
                
                // Ставимо мітку, щоб не навантажувати процесор повторно
                voteElement.dataset.star_colored = "true";
            });
        } catch (e) {
            console.warn('Vote Colors Plugin Error:', e);
        }
    }

    function initPlugin() {
        // Перший запуск
        updateVoteColors();
        
        // Спостерігач: Слідкує за появою нових карток при скролінгу
        var observer = new MutationObserver(function(mutations) {
            updateVoteColors();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /* --- Безпечний запуск через Listener Лампи --- */
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
