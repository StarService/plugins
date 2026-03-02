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
        description: 'Оптимізоване відображення якості з прямим підключенням',
        author: 'Lampa Users'
		docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Налаштування --- */
    var JACRED_API = 'https://jacred.xyz/api/v1.0/torrents';
    var QUALITY_CACHE = 'star_quality_cache';
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000; 

    /* --- Стилі (Скляна чорна підкладка) --- */
    var style = "<style id=\"star_quality_style\">" +
        ".card__view { position: relative !important; }" +
        ".card__quality_star { " +
        "    position: absolute !important; " +
        "    bottom: 8px !important; " +
        "    left: 4px !important; " +
        "    z-index: 5; " +
        "}" +
        ".card__quality_star div { " +
        "    background: rgba(0, 0, 0, 0.7) !important; " +
        "    backdrop-filter: blur(4px); " +
        "    color: #fff !important; " +
        "    font-weight: bold !important; " +
        "    font-size: 12px !important; " +
        "    border: 1px solid rgba(255, 255, 255, 0.2) !important; " +
        "    border-radius: 4px !important; " +
        "    padding: 2px 6px !important; " +
        "    box-shadow: 0 2px 4px rgba(0,0,0,0.5); " +
        "}" +
        "</style>";

    Lampa.Template.add('star_quality_css', style);
    if (!$('#star_quality_style').length) $('body').append(Lampa.Template.get('star_quality_css', {}, true));

    function getQuality(data, callback) {
        var uid = Lampa.Storage.get('lampac_unic_id', '');
        var year = (data.release_date || data.first_air_date || '').substring(0, 4);
        var title = data.original_title || data.title || data.name;
        
        if (!title || !year) return callback(null);

        var finalUrl = JACRED_API + '?search=' + encodeURIComponent(title) + '&year=' + year + '&exact=true' + (uid ? '&uid=' + uid : '');

        // Використовуємо проксі для стабільності, як у твоєму оригіналі
        var proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(finalUrl);

        fetch(proxyUrl)
            .then(r => r.json())
            .then(json => {
                if (json && Array.isArray(json) && json.length) {
                    var maxQ = Math.max.apply(Math, json.map(t => t.quality || 0));
                    if (maxQ >= 2160) return callback('4K');
                    if (maxQ >= 1080) return callback('FHD');
                    if (maxQ >= 720) return callback('HD');
                }
                callback(null);
            })
            .catch(() => callback(null));
    }

    /* --- Решта логіки (Кешування та MutationObserver) залишається моєю оптимізованою --- */
    function apply(card, q, key) {
        if (!card || !q || card.querySelector('.card__quality_star')) return;
        $(card.querySelector('.card__view')).append('<div class="card__quality_star"><div>' + q + '</div></div>');
        card.setAttribute('data-star-q', 'true');
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[key] = { q: q, t: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

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

    function init() {
        if (window.star_q_loaded) return;
        window.star_q_loaded = true;
        
        var timer;
        var observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                var cards = document.querySelectorAll('.card:not([data-star-q])');
                if (cards.length) process(Array.from(cards));
            }, 800); // Оптимізована затримка для ТБ
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
            var items = document.querySelectorAll('.card');
            if (items.length) process(Array.from(items));
        }, 2000);
    }

    if (window.appready) init();
    else Lampa.Listener.follow("app", function (e) { if (e.type == "ready") init(); });
})();
