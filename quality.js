(function () {
    "use strict";
	
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
        description: 'Відображення якості через адресу, вказану в налаштуваннях парсера',
        author: 'Lampa Users',
		docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Отримання адреси ПРЯМО з налаштувань парсера Lampa --- */
    function getParserAddress() {
        // Пріоритет 1: Адреса проксі-парсера (найчастіше там стоїть Lampac/JacRed)
        // Пріоритет 2: Основний сервер (якщо парсер не вказано окремо)
        var url = Lampa.Storage.get('parser_proxy_url') || Lampa.Storage.get('native_server') || '';
        
        if (url) {
            url = url.replace(/\/$/, ''); // Прибираємо зайвий слеш в кінці
            // Якщо адреса не містить /jacred, додаємо його, бо Jackett занадто повільний для карток
            if (!url.includes('jacred') && !url.includes('api')) {
                url += '/jacred';
            }
        }
        return url;
    }

    var QUALITY_CACHE = 'star_quality_cache';
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000; 

    /* --- Стилі --- */
    var style = "<style id=\"star_quality_style\">" +
        ".card__view { position: relative !important; }" +
        ".card__quality_star { " +
        "   position: absolute !important; " +
        "   bottom: 10px !important; " +
        "   left: 6px !important; " +
        "   z-index: 5; " +
        "}" +
        ".card__quality_star div { " +
        "   background: rgba(0, 0, 0, 0.8) !important; " +
        "   backdrop-filter: blur(4px); " +
        "   color: #fff !important; " +
        "   font-weight: bold !important; " +
        "   font-size: 11px !important; " +
        "   border: 1px solid rgba(255, 255, 255, 0.2) !important; " +
        "   border-radius: 4px !important; " +
        "   padding: 2px 5px !important; " +
        "}" +
        "</style>";

    Lampa.Template.add('star_quality_css', style);
    $('body').append(Lampa.Template.get('star_quality_css', {}, true));

    /* --- Функція запиту якості --- */
    function getQuality(data, callback) {
        var addr = getParserAddress();
        
        if (!addr) {
            if (!window.star_q_warn) {
                Lampa.Noty.show("Якість: Вкажіть адресу парсера в налаштуваннях!");
                window.star_q_warn = true;
            }
            return callback(null);
        }

        var year = (data.release_date || data.first_air_date || '').substring(0, 4);
        var title = data.original_title || data.title || data.name;
        
        // Формуємо фінальний URL запиту до твоєї бази
        var finalUrl = addr + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year + '&exact=true';

        fetch(finalUrl)
            .then(r => r.json())
            .then(json => {
                if (json && json.length) {
                    var maxQ = Math.max.apply(Math, json.map(t => t.quality || 0));
                    if (maxQ >= 2160) return callback('4K');
                    if (maxQ >= 1080) return callback('FHD');
                    if (maxQ >= 720) return callback('HD');
                }
                callback(null);
            })
            .catch(() => callback(null));
    }

    /* --- Нанесення мітки на картку --- */
    function apply(card, q, key) {
        if (!card || !q || card.querySelector('.card__quality_star')) return;
        $(card.querySelector('.card__view')).append('<div class="card__quality_star"><div>' + q + '</div></div>');
        card.setAttribute('data-star-q', 'true');

        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[key] = { q: q, t: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

    /* --- Обробка карток --- */
    function process(cards) {
        cards.forEach(card => {
            var d = card.card_data;
            if (!d || card.hasAttribute('data-star-q')) return;

            var key = (d.media_type || 'movie') + '_' + d.id;
            var cache = Lampa.Storage.get(QUALITY_CACHE) || {};

            if (cache[key] && (Date.now() - cache[key].t < Q_CACHE_TIME)) {
                apply(card, cache[key].q, key);
            } else {
                getQuality(d, (q) => {
                    if (q) apply(card, q, key);
                    else card.setAttribute('data-star-q', 'none');
                });
            }
        });
    }

    /* --- Старт плагіна --- */
    function init() {
        if (window.star_q_parser_loaded) return;
        window.star_q_parser_loaded = true;

        var timer;
        var observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                var cards = document.querySelectorAll('.card:not([data-star-q])');
                if (cards.length) process(Array.from(cards));
            }, 600);
        });

        observer.observe(document.body, { childList: true, subtree: true });
        
        setTimeout(() => {
            var items = document.querySelectorAll('.card');
            if (items.length) process(Array.from(items));
        }, 1000);
    }

    if (window.appready) init();
    else Lampa.Listener.follow("app", function (e) { if (e.type == "ready") init(); });

})();
