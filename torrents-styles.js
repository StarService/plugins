(function () {
    "use strict";

    /**
     * Torrent Styles (Premium Emerald)
     * Developed by: Lampa Users
     * Version: 1.0
     * UI Theme: Emerald Glassmorphism
     */

    /* --- Маніфест плагіна (відображається в налаштуваннях) --- */
    var pluginManifest = {
        name: 'Torrent Styles Premium',
        version: '1.0',
        description: 'Професійна стилізація торрентів: градієнти, світіння та розумна логіка (UA/EN)',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Пороги (Thresholds) --- */
    var TH = {
        seeds: { danger: 5, good: 10, top: 20 },
        bitrate: { high: 50, very_high: 100 },
        size: { mid: 50, high: 100, top: 200 },
        debounce: 60
    };

    /* --- Преміальний дизайн (CSS) --- */
    var style = '<style>' +
        // Базовий вигляд бейджів
        '.ts-badge { display: inline-flex !important; align-items: center; justify-content: center; min-height: 1.7em; padding: 0.15em 0.5em !important; border-radius: 0.5em !important; font-weight: 700 !important; font-size: 0.9em !important; margin-right: 0.55em !important; white-space: nowrap !important; font-variant-numeric: tabular-nums !important; border: 0.15em solid transparent !important; }' +
        
        // СІДИ (Seeds)
        '.ts-seeds { color: #5cd4b0; background: rgba(92, 212, 176, 0.14); border-color: rgba(92, 212, 176, 0.9) !important; box-shadow: 0 0 0.75em rgba(92, 212, 176, 0.28); }' +
        '.ts-seeds.low { color: #ff5f6d; background: rgba(255, 95, 109, 0.14); border-color: rgba(255, 95, 109, 0.82) !important; box-shadow: 0 0 0.65em rgba(255, 95, 109, 0.26); }' +
        '.ts-seeds.good { color: #43cea2; background: rgba(67, 206, 162, 0.16); border-color: rgba(67, 206, 162, 0.92) !important; box-shadow: 0 0 0.9em rgba(67, 206, 162, 0.34); }' +
        '.ts-seeds.top { color: #ffc371; background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.1)) !important; border-color: rgba(255, 195, 113, 0.92) !important; box-shadow: 0 0 0.95em rgba(255, 195, 113, 0.38); }' +

        // ПІРИ (Leechers)
        '.ts-grabs { color: #4db6ff; background: rgba(77, 182, 255, 0.12); border-color: rgba(77, 182, 255, 0.82) !important; box-shadow: 0 0 0.35em rgba(77, 182, 255, 0.16); }' +

        // БІТРЕЙТ (Speed)
        '.ts-bitrate { color: #5cd4b0; background: rgba(67, 206, 162, 0.1); border-color: rgba(92, 212, 176, 0.78) !important; }' +
        '.ts-bitrate.high { color: #ffc371; background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.1)) !important; border-color: rgba(255, 195, 113, 0.92) !important; }' +
        '.ts-bitrate.danger { color: #ff5f6d; background: linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08)) !important; border-color: rgba(255, 95, 109, 0.92) !important; }' +

        // РОЗМІР (Size)
        '.ts-size { color: #5cd4b0; background: rgba(92, 212, 176, 0.12); border-color: rgba(92, 212, 176, 0.82) !important; }' +
        '.ts-size.mid { color: #43cea2; border-color: rgba(67, 206, 162, 0.92) !important; }' +
        '.ts-size.high { color: #ffc371; background: linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.1)) !important; border-color: rgba(255, 195, 113, 0.95) !important; }' +
        '.ts-size.top { color: #ff5f6d; background: linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08)) !important; border-color: rgba(255, 95, 109, 0.95) !important; }' +
        
        // Фокус на картці
        '.torrent-item.selector.focus { box-shadow: 0 0 0 0.3em rgba(67, 206, 162, 0.4) !important; }' +
        '</style>';

    if (!$('style#ts-premium-emerald').length) $('head').append('<style id="ts-premium-emerald">' + style + '</style>');

    /* --- Логіка парсингу --- */
    function extractNumber(text) {
        var match = (text || '').replace(',', '.').match(/\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
    }

    function updateStyles() {
        $('.torrent-item__details > div, .torrent-item__details > span').each(function () {
            var $el = $(this);
            var text = $el.text().toLowerCase();
            $el.removeClass('ts-badge ts-seeds ts-grabs ts-bitrate ts-size low good top mid high danger');

            // 🟢 РОЗДАЮТЬ / SEEDS
            if (text.indexOf('роздають') !== -1 || text.indexOf('seeds') !== -1) {
                var s = extractNumber(text);
                $el.addClass('ts-badge ts-seeds');
                if (s < TH.seeds.danger) $el.addClass('low');
                else if (s >= TH.seeds.top) $el.addClass('top');
                else if (s >= TH.seeds.good) $el.addClass('good');
            }
            // 🔵 КАЧАЮТЬ / PEERS
            else if (text.indexOf('качають') !== -1 || text.indexOf('leechers') !== -1 || text.indexOf('peers') !== -1) {
                $el.addClass('ts-badge ts-grabs');
            }
            // 🟡 БІТРЕЙТ / BITRATE
            else if (text.indexOf('бітрейт') !== -1 || text.indexOf('bitrate') !== -1) {
                var br = extractNumber(text);
                $el.addClass('ts-badge ts-bitrate');
                if (br > TH.bitrate.very_high) $el.addClass('danger');
                else if (br >= TH.bitrate.high) $el.addClass('top');
            }
            // 🟢 ГБ / GB (Об'єм)
            else if (text.indexOf('гб') !== -1 || text.indexOf('gb') !== -1) {
                var sz = extractNumber(text);
                $el.addClass('ts-badge ts-size');
                if (sz > TH.size.top) $el.addClass('top');
                else if (sz >= TH.size.high) $el.addClass('high');
                else if (sz >= TH.size.mid) $el.addClass('mid');
            }
        });
    }

    /* --- Запуск --- */
    function init() {
        var observer = new MutationObserver(function() { setTimeout(updateStyles, TH.debounce); });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        if (window.Lampa) Lampa.Manifest.plugins['torrent_styles_mod'] = pluginManifest;
        updateStyles();
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();
