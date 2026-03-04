(function () {
    "use strict";

    /**
     * Torrent Styles (Unified)
     * Developed by: Lampa Users
     * Version: 1.0.0
     * Description: Розумна стилізація та кольорове маркування торрент-роздач.
     */

    /* --- Маніфест плагіна (відображається в налаштуваннях) --- */
    var pluginManifest = {
        name: 'Torrent Styles Mod',
        version: '1.0.0',
        description: 'Кольорове маркування сідів, бітрейту та розміру торрентів',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    var config = {
        pluginId: 'torrent_styles_mod'
    };

    /* --- Пороги та налаштування --- */
    var TH = {
        seeds: {
            danger_below: 5,  // Червоний, якщо мало сідів
            good_from: 10,    // Смарагдовий
            top_from: 20      // Золотий
        },
        bitrate: {
            warn_from: 50,    // Золотий
            danger_from: 100  // Червоний (дуже важкий файл)
        },
        size: {
            mid_from_gb: 50,
            high_from_gb: 100,
            top_from_gb: 200
        },
        debounce_ms: 60 // Затримка оновлення для плавності інтерфейсу
    };

    /* --- Візуальні стилі (CSS) --- */
    var styles = {
        '.torrent-item__details': { 'font-size': '0.9em' },
        
        // Базовий вигляд бейджів (Glassmorphism)
        '.torrent-item__bitrate > span.ts-bitrate, .torrent-item__seeds > span.ts-seeds, .torrent-item__grabs > span.ts-grabs, .torrent-item__size.ts-size': {
            'display': 'inline-flex',
            'align-items': 'center',
            'justify-content': 'center',
            'min-height': '1.7em',
            'padding': '0.15em 0.45em',
            'border-radius': '0.5em',
            'font-weight': '700',
            'font-size': '0.9em',
            'font-variant-numeric': 'tabular-nums', // Однаковий розмір цифр для рівності
            'white-space': 'nowrap'
        },

        // Кольори для Сідів
        '.torrent-item__seeds > span.ts-seeds': { color: '#5cd4b0', 'background-color': 'rgba(92, 212, 176, 0.14)', border: '0.15em solid rgba(92, 212, 176, 0.9)' },
        '.torrent-item__seeds > span.ts-seeds.low-seeds': { color: '#ff5f6d', 'background-color': 'rgba(255, 95, 109, 0.14)', border: '0.15em solid rgba(255, 95, 109, 0.82)' },
        '.torrent-item__seeds > span.ts-seeds.high-seeds': { color: '#ffc371', background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))', border: '0.15em solid rgba(255, 195, 113, 0.92)' },

        // Стилі фокусу (виділення картки пультом)
        '.torrent-item.selector.focus': { 'box-shadow': '0 0 0 0.3em rgba(67, 206, 162, 0.4)' },
        '.torrent-item.focus::after': { border: '0.24em solid #5cd4b0', 'border-radius': '0.9em' }
    };

    /* --- Функції обробки даних --- */

    // Парсинг розміру (підтримує ГБ, ТБ, МБ та їх англійські аналоги)
    function tsParseSizeToGb(text) {
        try {
            var t = ((text || '') + '').replace(/\u00A0/g, ' ').trim();
            var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
            if (!m) return null;
            var num = parseFloat(m[1].replace(',', '.')) || 0;
            var unit = m[2].toLowerCase();
            if (unit === 'tb' || unit === 'тб') return num * 1024;
            if (unit === 'gb' || unit === 'гб') return num;
            if (unit === 'mb' || unit === 'мб') return num / 1024;
            return 0;
        } catch (e) { return null; }
    }

    // Основна функція оновлення стилів у списку
    function updateTorrentStyles() {
        try {
            // Обробка Сідів
            document.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
                var value = parseInt(span.textContent, 10) || 0;
                span.classList.add('ts-seeds');
                var tier = '';
                if (value < TH.seeds.danger_below) tier = 'low-seeds';
                else if (value >= TH.seeds.top_from) tier = 'high-seeds';
                else if (value >= TH.seeds.good_from) tier = 'good-seeds';
                span.classList.remove('low-seeds', 'good-seeds', 'high-seeds');
                if (tier) span.classList.add(tier);
            });

            // Обробка Розміру
            document.querySelectorAll('.torrent-item__size').forEach(function (el) {
                var gb = tsParseSizeToGb(el.textContent);
                el.classList.add('ts-size');
                var tier = '';
                if (gb > TH.size.top_from_gb) tier = 'top-size';
                else if (gb >= TH.size.high_from_gb) tier = 'high-size';
                else if (gb >= TH.size.mid_from_gb) tier = 'mid-size';
                el.classList.remove('mid-size', 'high-size', 'top-size');
                if (tier) el.classList.add(tier);
            });
        } catch (e) { console.error('Torrent Styles Error:', e); }
    }

    /* --- Впровадження та ініціалізація --- */

    function injectStyles() {
        var css = Object.keys(styles).map(function (sel) {
            var rules = Object.keys(styles[sel]).map(function (p) { return p + ': ' + styles[sel][p] + ' !important'; }).join('; ');
            return sel + ' { ' + rules + ' }';
        }).join('\n');
        var styleTag = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    }

    var timer = null;
    function scheduleUpdate() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(updateTorrentStyles, TH.debounce_ms);
    }

    function init() {
        injectStyles();
        
        // Стежимо за появою нових торрентів у списку
        var observer = new MutationObserver(scheduleUpdate);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        // Реєстрація плагіна в системі Lampa
        if (typeof Lampa !== 'undefined') {
            Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
            Lampa.Manifest.plugins[config.pluginId] = pluginManifest;
        }
        
        console.log('Torrent Styles Mod Loaded');
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();
