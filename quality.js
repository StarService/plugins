(function () {
    'use strict';

    /**
     * QUALITY (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description:
     */

    /* --- Маніфест плагіна --- */
    var pluginManifest = {
        name: 'QUALITY',
        version: '1.0',
        description: 'Відображення якості релізів з JacRed на картках',
        author: 'Lampa Users',
    };

    /* --- Конфігурація --- */
    var Q_LOGGING = false; // Вимкнув за замовчуванням для швидкості
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000; // Кеш на 24 години
    var QUALITY_CACHE = 'star_quality_cache';
    var JACRED_PROTOCOL = 'http://';
    var JACRED_URL = Lampa.Storage.get('jacred.xyz') || ''; // Беремо адресу з налаштувань
    var PROXY_TIMEOUT = 4000; 
    var PROXY_LIST = [
        'http://api.allorigins.win/raw?url=',
        'http://cors.bwa.workers.dev/'
    ];

    /* --- Локалізація та сповіщення --- */
    Lampa.Lang.add({
        star_q_no_url: {
            uk: 'Якість: Вкажіть адресу JacRed у налаштуваннях!',
            ru: 'Качество: Укажите адрес JacRed в настройках!',
            en: 'Quality: Set JacRed URL in settings!'
        },
        star_q_proxy_error: {
            uk: 'Якість: Не вдалося отримати дані (помилка проксі)',
            ru: 'Качество: Не удалось получить данные (ошибка прокси)',
            en: 'Quality: Proxy error'
        }
    });

    /* --- Стилі: Чорна підкладка, білий текст, "скляний" ефект --- */
    var style = "<style id=\"star_quality_style\">" +
        ".card__view { position: relative !important; }" +
        ".card__quality_star { " +
        "   position: absolute !important; " +
        "   bottom: 10px !important; " +
        "   left: 5px !important; " +
        "   z-index: 5; " +
        "}" +
        ".card__quality_star div { " +
        "   background: rgba(0, 0, 0, 0.8) !important; " + // Чорна напівпрозора
        "   backdrop-filter: blur(4px); " + // Ефект розмиття (на сучасних ТВ)
        "   color: #FFFFFF !important; " +
        "   font-weight: bold !important; " +
        "   font-size: 0.8em !important; " +
        "   border: 1px solid rgba(255, 255, 255, 0.2) !important; " +
        "   border-radius: 4px !important; " +
        "   padding: 2px 6px !important; " +
        "   box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important; " +
        "   text-shadow: 1px 1px 1px #000; " +
        "}" +
        "</style>";

    Lampa.Template.add('star_quality_css', style);
    $('body').append(Lampa.Template.get('star_quality_css', {}, true));

    /* --- Допоміжні функції --- */
    function getCardType(card) {
        var type = card.media_type || card.type;
        return (type === 'movie' || type === 'tv') ? type : (card.name || card.original_name ? 'tv' : 'movie');
    }

    /* --- Робота з проксі (оптимізована) --- */
    function fetchWithProxy(url, callback) {
        var proxyIdx = 0;
        function tryProxy() {
            if (proxyIdx >= PROXY_LIST.length) return callback(new Error('Fail'));
            
            var target = PROXY_LIST[proxyIdx] + encodeURIComponent(url);
            var controller = new AbortController();
            var timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT);

            fetch(target, { signal: controller.signal })
                .then(r => r.text())
                .then(data => {
                    clearTimeout(timeout);
                    callback(null, data);
                })
                .catch(() => {
                    clearTimeout(timeout);
                    proxyIdx++;
                    tryProxy();
                });
        }
        tryProxy();
    }

    /* --- Запит до JacRed --- */
    function getQualityFromJacred(normalizedCard, callback) {
        if (!JACRED_URL) {
            Lampa.Noty.show(Lampa.Lang.translate('star_q_no_url'));
            return callback(null);
        }

        var year = (normalizedCard.release_date || '').substring(0, 4);
        if (!year) return callback(null);

        var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' + 
                     encodeURIComponent(normalizedCard.original_title || normalizedCard.title) + 
                     '&year=' + year + '&exact=true';

        fetchWithProxy(apiUrl, function(err, data) {
            if (err) {
                if (Q_LOGGING) Lampa.Noty.show(Lampa.Lang.translate('star_q_proxy_error'));
                return callback(null);
            }
            try {
                var json = JSON.parse(data);
                if (json && json.length) {
                    var maxQ = Math.max.apply(Math, json.map(t => t.quality || 0));
                    if (maxQ >= 2160) return callback('4K');
                    if (maxQ >= 1080) return callback('FHD');
                    if (maxQ >= 720) return callback('HD');
                    if (maxQ > 0) return callback('SD');
                }
                callback(null);
            } catch(e) { callback(null); }
        });
    }

    /* --- Застосування до картки --- */
    function applyQuality(cardElement, quality, qCacheKey) {
        if (!cardElement || !quality) return;
        
        var cardView = cardElement.querySelector('.card__view');
        if (!cardView || cardElement.querySelector('.card__quality_star')) return;

        var badge = $('<div class="card__quality_star"><div>' + quality + '</div></div>');
        $(cardView).append(badge);
        cardElement.setAttribute('data-star-q', 'true');

        // Зберігаємо в кеш
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[qCacheKey] = { q: quality, t: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

    /* --- Оновлення списку карток --- */
    function updateCards(cards) {
        cards.forEach(card => {
            if (card.hasAttribute('data-star-q')) return;
            
            var data = card.card_data;
            if (!data) return;

            var qCacheKey = getCardType(data) + '_' + data.id;
            var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
            
            // Перевірка кешу
            if (cache[qCacheKey] && (Date.now() - cache[qCacheKey].t < Q_CACHE_TIME)) {
                applyQuality(card, cache[qCacheKey].q, qCacheKey);
            } else {
                getQualityFromJacred(data, function(quality) {
                    if (quality) applyQuality(card, quality, qCacheKey);
                    else card.setAttribute('data-star-q', 'none'); // Щоб не смикати JacRed постійно
                });
            }
        });
    }

    /* --- Оптимізований спостерігач (Observer) --- */
    var debounceTimer;
    var observer = new MutationObserver(function (mutations) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            var cards = document.querySelectorAll('.card:not([data-star-q])');
            if (cards.length) updateCards(Array.from(cards));
        }, 500); // Чекаємо півсекунди після останньої зміни, щоб не «гальмувати» ТБ
    });

    /* --- Старт --- */
    function startPlugin() {
        if (window.star_quality_loaded) return;
        window.star_quality_loaded = true;

        console.log("Star Quality: Initialized");
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Обробка перших карток
        setTimeout(() => {
            var initial = document.querySelectorAll('.card');
            if (initial.length) updateCards(Array.from(initial));
        }, 1000);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow("app", function (e) { if (e.type == "ready") startPlugin(); });

})();
