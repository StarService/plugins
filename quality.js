(function () {
    'use strict';
    
    /**
     * QUALITY (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description:
     */

    /* --- Маніфест плагіна --- 
       Метадані для відображення в меню налаштувань Lampa. */
    var pluginManifest = {
        name: 'QUALITY',
        version: '1.0',
        description: 'Оптимізоване відображення якості для приватного сервера',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Основні налаштування --- */
    var Q_LOGGING = false;                     // Вимкнено для економії ресурсів (true для налагодження)
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000;    // Кешуємо результат на 24 години
    var QUALITY_CACHE = 'star_quality_cache';  // Унікальний ключ кешу Lampa Users
    var JACRED_PROTOCOL = 'https://';          // Використовуємо захищений протокол
    var JACRED_URL = 'jacred.xyz';             // Пряма адреса джерела метаданих
    var PROXY_TIMEOUT = 5000;                  // Максимальний час очікування відповіді

    /* Список проксі-серверів для стабільної роботи (обхід CORS) */
    var PROXY_LIST = [
        'https://api.allorigins.win/raw?url=',
        'https://cors.bwa.workers.dev/'
    ];

    /* --- 3. Стилізація (Преміальний дизайн) --- 
       Чорна підкладка (0.7), ефект розмиття фону (blur) та білий жирний текст. */
    var style = "<style id=\"star_quality_style\">" +
        ".card__view { position: relative !important; }" +
        ".card__quality_star { " +
        "   position: absolute !important; " +
        "   bottom: 0.6em !important; " +
        "   left: -0.5em !important; " +
        "   z-index: 10; " +
        "}" +
        ".card__quality_star div { " +
        "   background-color: rgba(0, 0, 0, 0.7) !important; " + // Чорна напівпрозора підкладка
        "   backdrop-filter: blur(4px); " +                      // Ефект матового скла
        "   -webkit-backdrop-filter: blur(4px); " +
        "   color: #FFFFFF !important; " +                       // Білий колір тексту
        "   font-weight: bold !important; " +
        "   font-size: 1.1em !important; " +
        "   border: 1px solid rgba(255, 255, 255, 0.2) !important; " + // Тонка рамка
        "   border-radius: 4px !important; " +
        "   padding: 0.2em 0.5em !important; " +
        "   text-shadow: 0 1px 2px rgba(0,0,0,0.8); " +
        "}" +
        "</style>";

    // Додаємо стилі в систему Lampa
    Lampa.Template.add('star_quality_css', style);
    if (!$('#star_quality_style').length) $('body').append(Lampa.Template.get('star_quality_css', {}, true));

    /* --- Логіка роботи з даними --- */

    // Визначаємо тип контенту (фільм чи серіал)
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    // Ротація проксі-серверів для надійності
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed'));
                }
                return;
            }
            var proxyUrl = PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, PROXY_TIMEOUT);

            fetch(proxyUrl)
                .then(function(r) { 
                    clearTimeout(timeoutId);
                    return r.text(); 
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(null, data);
                    }
                })
                .catch(function() {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
    }

    // Основна функція запиту до JacRed
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        function translateQuality(quality) {
            if (quality >= 2160) return '4K';
            if (quality >= 1080) return 'FHD';
            if (quality >= 720) return 'HD';
            return null;
        }

        var year = (normalizedCard.release_date || '').substring(0, 4);
        if (!year || isNaN(year)) return callback(null);

        // Спроба отримати UID, якщо він є (для розширених результатів)
        var userId = Lampa.Storage.get('lampac_unic_id', '');
        var title = normalizedCard.original_title || normalizedCard.title;
        
        // Формуємо URL запиту
        var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' +
            encodeURIComponent(title) + '&year=' + year + '&exact=true' + (userId ? '&uid=' + userId : '');

        fetchWithProxy(apiUrl, cardId, function(err, responseText) {
            if (err || !responseText) return callback(null);
            try {
                var torrents = JSON.parse(responseText);
                if (Array.isArray(torrents) && torrents.length > 0) {
                    // Шукаємо торрент з найвищою якістю
                    var maxQ = Math.max.apply(Math, torrents.map(function(t) { return t.quality || 0; }));
                    callback({ quality: translateQuality(maxQ) });
                } else callback(null);
            } catch (e) { callback(null); }
        });
    }

    /* --- Візуалізація та кешування --- */

    // Малюємо значок якості на картці
    function applyQualityToCard(card, quality, qCacheKey) {
        if (!card || !quality || card.hasAttribute('data-star-q')) return;
        var cardView = card.querySelector('.card__view');
        if (cardView) {
            // Очищуємо старі значки, якщо вони випадково залишились
            $(cardView).find('.card__quality_star').remove();
            
            // Додаємо новий значок
            $(cardView).append('<div class="card__quality_star"><div>' + quality + '</div></div>');
            card.setAttribute('data-star-q', 'true');
            
            // Зберігаємо в локальне сховище
            var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
            cache[qCacheKey] = { q: quality, t: Date.now() };
            Lampa.Storage.set(QUALITY_CACHE, cache);
        }
    }

    // Обробка масиву карток
    function updateCards(cards) {
        cards.forEach(function(card) {
            if (card.hasAttribute('data-star-q')) return;
            var data = card.card_data;
            if (!data) return;

            var qCacheKey = getCardType(data) + '_' + data.id;
            var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
            
            // Перевіряємо кеш
            if (cache[qCacheKey] && (Date.now() - cache[qCacheKey].t < Q_CACHE_TIME)) {
                applyQualityToCard(card, cache[qCacheKey].q, qCacheKey);
            } else {
                // Запитуємо API
                getBestReleaseFromJacred(data, data.id, function(res) {
                    if (res && res.quality) applyQualityToCard(card, res.quality, qCacheKey);
                    else card.setAttribute('data-star-q', 'none'); // Щоб не мучити сервер повторно
                });
            }
        });
    }

    /* --- Оптимізований Observer --- 
       Ми використовуємо дебаунс (debounce) на 800мс. Коли ти гортаєш стрічку,
       плагін не запускається для кожної картки окремо, а чекає зупинки,
       збирає всі нові картки і обробляє їх пачкою. Це прибирає фризи на ТБ. */
    var timer;
    var observer = new MutationObserver(function (mutations) {
        clearTimeout(timer);
        timer = setTimeout(function() {
            var newCards = document.querySelectorAll('.card:not([data-star-q])');
            if (newCards.length) updateCards(Array.from(newCards));
        }, 800); 
    });

    /* --- Ініціалізація --- */
    function startPlugin() {
        // Починаємо спостереження за змінами в інтерфейсі
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Обробляємо ті картки, що вже є на екрані при старті
        var existing = document.querySelectorAll('.card');
        if (existing.length) updateCards(Array.from(existing));
    }

    // Запобігаємо подвійному запуску
    if (!window.starQualityPlugin) {
        window.starQualityPlugin = true;
        startPlugin();
    }
})();
