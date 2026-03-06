(function () {
    'use strict';
    
    /**
     * QUALITY (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description: Оптимізований плагін для відображення якості контенту з ефектом Glassmorphism.
     */

    /* --- Маніфест плагіна --- 
       Метадані для системи Lampa, що відображаються в налаштуваннях. */
    var pluginManifest = {
        name: 'QUALITY',
        version: '1.0',
        description: 'Оптимізоване відображення якості для приватного сервера',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Основні налаштування та обгортка --- */
    var Q_LOGGING = true;                                              // Логування в консоль (STAR-RATINGS)
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000;                            // Кешуємо результат на 24 години
    var QUALITY_CACHE = 'star_ratings_quality_cache';                  // Унікальний ключ кешу (замінено на star)
    var JACRED_PROTOCOL = 'https://';                                  // Використовуємо захищений протокол
    var JACRED_URL = Lampa.Storage.get('jacred.xyz') || 'jac.red';  // Пряма адреса джерела метаданих
    var PROXY_TIMEOUT = 5000;                                          // Максимальний час очікування відповіді
    
    /* Список проксі-серверів для обходу CORS обмежень браузера */
    var PROXY_LIST = [
        'https://api.allorigins.win/raw?url=',
        'https://cors.bwa.workers.dev/'
    ];

    /* --- Стилізація (Преміальний дизайн) --- 
       Збережено твою оригінальну геометрію (0.5em / -0.8em / 1.2em).
       Додано ефект "багатості" (blur) для дорожчого вигляду. */
    var style = "<style id=\"star_ratings_quality_css\">" +
        ".card__view { position: relative !important; }" +
        ".card__quality { " +
        "   position: absolute !important; " +
        "   bottom: 0.3em !important; " +   
        "   left: -0.8em !important; " + 
        "   background-color: transparent !important; " +
        "   z-index: 10; " +
        "   width: fit-content !important; " +
        "   max-width: calc(100% - 1em) !important; " +
        "}" +
        ".card__quality div { " +
        "   text-transform: none !important; " +
        "   border: 1px solid #FFFFFF !important; " +   /* Біла рамка */
        "   background-color: rgba(0, 0, 0, 0.7) !important; " + 
        "   backdrop-filter: blur(4px); " +              /* Ефект розмиття фону */
        "   -webkit-backdrop-filter: blur(4px); " +      /* Підтримка для старих TV */
        "   color: #FFFFFF !important; " +               /* Білий текст */
        "   font-weight: bold !important; " + 
        "   font-style: normal !important; " +
        "   font-size: 1.2em !important; " +
        "   border-radius: 3px !important; " +
        "   padding: 0.2em 0.4em !important; " +
		"   box-shadow: 0 2px 4px rgba(0,0,0,0.5); " +   /* Тінь для об'єму */
        "}" +
        "</style>";

    // Додавання стилів у документ через вбудований шаблон Lampa
    Lampa.Template.add('star_ratings_quality_css', style);
    if (!$('#star_ratings_quality_css').length) $('body').append(Lampa.Template.get('star_ratings_quality_css', {}, true));

    /* --- Логіка роботи з даними --- */

    /* Визначаємо тип контенту: фільм чи серіал */
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    /* Робота з проксі: послідовне опитування серверів при помилках */
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
            if (Q_LOGGING) console.log("STAR-RATINGS", "card: " + cardId + ", Fetch with proxy: " + proxyUrl);
            
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, PROXY_TIMEOUT);

            fetch(proxyUrl)
                .then(function(r) { 
                    clearTimeout(timeoutId);
                    if (!r.ok) throw new Error('Status: ' + r.status);
                    return r.text(); 
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
    }

    /* Отримання найкращого релізу з JacRed */
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        function translateQuality(quality) {
            if (typeof quality !== 'number') return quality;
            if (quality >= 2160) return '4K';
            if (quality >= 1080) return 'FHD';
            if (quality >= 720) return 'HD';
            if (quality > 0) return 'SD';
            return null;
        }

        var year = (normalizedCard.release_date || '').substring(0, 4);
        if (!year || isNaN(year)) return callback(null);

        var uid = Lampa.Storage.get('lampac_unic_id', '');
        var title = normalizedCard.original_title || normalizedCard.title;
        var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' +
            encodeURIComponent(title) + '&year=' + year + '&exact=true' + (uid ? '&uid=' + uid : '');

        fetchWithProxy(apiUrl, cardId, function(err, responseText) {
            if (err || !responseText) return callback(null);
            try {
                var torrents = JSON.parse(responseText);
                if (Array.isArray(torrents) && torrents.length > 0) {
                    // Фільтрація екранок (твій оригінал)
                    var filtered = torrents.filter(function(t) {
                        var low = (t.title || '').toLowerCase();
                        return !/\b(ts|telesync|camrip|cam)\b/i.test(low) || (t.quality || 0) >= 720;
                    });
                    
                    if (filtered.length) {
                        var maxQ = Math.max.apply(Math, filtered.map(function(t) { return t.quality || 0; }));
                        callback({ quality: translateQuality(maxQ) });
                    } else callback(null);
                } else callback(null);
            } catch (e) { callback(null); }
        });
    }

    /* --- Візуалізація та кешування --- */

    function getQualityCache(key) {
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < Q_CACHE_TIME) ? item : null;
    }

    function saveQualityCache(key, quality, localId) {
        if (Q_LOGGING) console.log("STAR-RATINGS", "card: " + localId + ", quality: Save quality cache");
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[key] = { quality: quality, timestamp: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

    /* Нанесення значка якості на картку */
    function applyQualityToCard(card, quality, source, qCacheKey) {
        if (!document.body.contains(card)) return;
        
        card.setAttribute('data-star-q', 'true'); // Тепер тут star
        var cardView = card.querySelector('.card__view');
        if (!cardView) return;

        $(cardView).find('.card__quality').remove();

        if (source === 'JacRed' && quality && quality !== 'none') {
            var cardId = card.card_data ? card.card_data.id : 'unknown';
            saveQualityCache(qCacheKey, quality, cardId);
        }

        if (quality && quality !== 'none') {
            var qualityDiv = document.createElement('div');
            qualityDiv.className = 'card__quality';
            var qualityInner = document.createElement('div');
            qualityInner.textContent = quality;
            qualityDiv.appendChild(qualityInner);
            cardView.appendChild(qualityDiv);
        }
    }

    /* Обробка карток: перевірка кешу або запит до JacRed */
    function updateCards(cards) {
        cards.forEach(function(card) {
            if (card.hasAttribute('data-star-q')) return;
            var data = card.card_data;
            if (!data) return;

            var normalized = {
                id: data.id || '',
                title: data.title || data.name || '',
                original_title: data.original_title || data.original_name || '',
                release_date: data.release_date || data.first_air_date || '',
                type: getCardType(data)
            };

            var qCacheKey = normalized.type + '_' + normalized.id;
            var cache = getQualityCache(qCacheKey);
            
            if (cache) {
                if (Q_LOGGING) console.log("STAR-RATINGS", "card: " + normalized.id + ", quality: Get from cache");
                applyQualityToCard(card, cache.quality, 'Cache', qCacheKey);
            } else {
                getBestReleaseFromJacred(normalized, normalized.id, function(res) {
                    applyQualityToCard(card, res ? res.quality : 'none', 'JacRed', qCacheKey);
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
            var newCards = [];
            mutations.forEach(function(m) {
                if (m.addedNodes) {
                    m.addedNodes.forEach(function(n) {
                        if (n.nodeType === 1) {
                            if (n.classList.contains('card')) newCards.push(n);
                            n.querySelectorAll('.card').forEach(function(c) { newCards.push(c); });
                        }
                    });
                }
            });
            if (newCards.length) updateCards(newCards);
        }, 200); 
    });

    /* --- Ініціалізація --- */
    function startPlugin() {
        if (Q_LOGGING) console.log("STAR-RATINGS-QUALITY", "Plugin started!");
        
        // Налаштування по замовчуванню (з префіксом star)
        if (!localStorage.getItem('star_ratings_quality')) {
            localStorage.setItem('star_ratings_quality', 'true');
        }
        if (!localStorage.getItem('star_ratings_quality_inlist')) {
            localStorage.setItem('star_ratings_quality_inlist', 'true');
        }
        if (!localStorage.getItem('star_ratings_quality_tv')) {
            localStorage.setItem('star_ratings_quality_tv', 'false');
        }

        if (localStorage.getItem('star_ratings_quality_inlist') === 'true') {
            observer.observe(document.body, { childList: true, subtree: true });
            var existing = document.querySelectorAll('.card');
            if (existing.length) updateCards(Array.from(existing));
        }
    }

    // Захист від подвійного запуску
    if (!window.starRatingsQualityPlugin) {
        window.starRatingsQualityPlugin = true;
        startPlugin();
    }
})();
