(function () {
    "use strict";

    /**
     * Torrent Styles (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description: Кольорові індикатори для торрентів (UA/EN: Роздають, Качають, Бітрейт, ГБ).
     */

    /* --- Маніфест плагіна (відображається в налаштуваннях) --- */
    var pluginManifest = {
        name: 'Torrent Styles Multi',
        version: '1.0',
        description: 'Універсальна стилізація: підтримує UA/EN мови, будь-який регістр букв та двокрапки',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Візуальні стилі (CSS) --- */
    var style = '<style>' +
        '.ts-badge { display: inline-flex !important; padding: 0.15em 0.5em !important; border-radius: 0.5em !important; font-weight: bold !important; margin-right: 0.6em !important; font-size: 0.9em !important; border: 1px solid transparent !important; white-space: nowrap !important; }' +
        /* Роздають / Seeds */
        '.ts-seeds { color: #5cd4b0; background: rgba(92, 212, 176, 0.15); border-color: #5cd4b0 !important; } ' +
        '.ts-seeds.low { color: #ff5f6d; border-color: #ff5f6d !important; } ' +
        '.ts-seeds.high { color: #ffc371; border-color: #ffc371 !important; } ' +
        /* Качають / Leechers */
        '.ts-grabs { color: #4db6ff; background: rgba(77, 182, 255, 0.15); border-color: #4db6ff !important; } ' +
        /* Бітрейт / Bitrate */
        '.ts-bitrate { color: #ffc371; background: rgba(255, 195, 113, 0.1); border-color: #ffc371 !important; } ' +
        /* ГБ / GB (Розмір) */
        '.ts-size { color: #43cea2; background: rgba(67, 206, 162, 0.15); border-color: #43cea2 !important; } ' +
        '</style>';

    // Впровадження стилів у head документа
    if (!$('style#ts-mod-final-pro').length) $('head').append('<style id="ts-mod-final-pro">' + style + '</style>');

    /* --- Функції обробки даних --- */

    /**
     * Витягує перше число з рядка.
     * Працює з: "Роздають: 383", "Bitrate: 8.92 Mbps", "15,5 ГБ"
     */
    function extractNumber(text) {
        var match = (text || '').replace(',', '.').match(/\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
    }

    /**
     * Основна функція оновлення стилів.
     * Сканує блоки деталей торрента та вішає класи залежно від знайдених слів.
     */
    function updateStyles() {
        // Проходимо по всіх div та span у контейнері деталей торрента
        $('.torrent-item__details > div, .torrent-item__details > span').each(function () {
            var $el = $(this);
            var text = $el.text().toLowerCase(); // Перетворюємо на малі літери для ігнорування регістру

            // 1. РОЗДАЮТЬ / SEEDS
            if (text.indexOf('роздають') !== -1 || text.indexOf('seeds') !== -1) {
                var val = extractNumber(text);
                $el.addClass('ts-badge ts-seeds').removeClass('low high');
                if (val < 5) $el.addClass('low');
                else if (val > 50) $el.addClass('high');
            }

            // 2. КАЧАЮТЬ / LEECHERS / PEERS
            else if (text.indexOf('качають') !== -1 || text.indexOf('leechers') !== -1 || text.indexOf('peers') !== -1) {
                $el.addClass('ts-badge ts-grabs');
            }

            // 3. БІТРЕЙТ / BITRATE
            else if (text.indexOf('бітрейт') !== -1 || text.indexOf('bitrate') !== -1) {
                $el.addClass('ts-badge ts-bitrate');
            }

            // 4. ГБ / GB / ТБ / TB (Розмір файлу)
            else if (text.indexOf('гб') !== -1 || text.indexOf('gb') !== -1 || text.indexOf('тб') !== -1 || text.indexOf('tb') !== -1) {
                $el.addClass('ts-badge ts-size');
            }
        });
    }

    /* --- Впровадження та ініціалізація --- */
    function init() {
        // MutationObserver стежить за появою нових торрентів у списку
        var observer = new MutationObserver(function() {
            setTimeout(updateStyles, 100);
        });
        
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        
        // Реєстрація плагіна в Lampa
        if (window.Lampa) {
            Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
            Lampa.Manifest.plugins['torrent_styles_mod'] = pluginManifest;
        }
        
        updateStyles(); // Запуск при ініціалізації
    }

    // Запуск після готовності додатку
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
