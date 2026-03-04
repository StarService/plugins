(function () {
    "use strict";

    /**
     * Wiki Find (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description: Розумний пошук та перегляд статей Вікіпедії про фільми, режисерів та акторів.
     */

    /* --- Маніфест плагіна (відображається в налаштуваннях) --- */
    var pluginManifest = {
        name: 'Wiki Find',
        version: '1.0',
        description: 'Інтеграція Вікіпедії: історія створення, біографії та факти прямо в картці фільму',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    /* --- Основна логіка плагіна--- */
    function WikiSmartPlugin() {
        var _this = this;
        var ICON_WIKI = 'https://starservice.github.io/plugins/wiki.svg'; // Зовнішня іконка
        var cachedResults = null;  // Кеш результатів для поточної картки
        var isFallbackUsed = false; // Прапорець, якщо точну статтю не знайдено і використано пошук за назвою
        var searchPromise = null;  // Посилання на поточний процес пошуку
        var isOpened = false;      // Стан вікна перегляду

        /* Ініціалізація: відстеження відкриття картки фільму */
        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    _this.cleanup(); // Очищення перед новим рендером
                    setTimeout(function() {
                        try {
                            _this.render(e.data, e.object.activity.render());
                        } catch (err) {}
                    }, 200);
                }
            });
        };

        /* Очищення пам'яті та інтерфейсу */
        this.cleanup = function() {
            $('.lampa-wiki-smart-btn').remove();
            cachedResults = null;
            isFallbackUsed = false;
            searchPromise = null;
            isOpened = false;
        };

        /* Додавання кнопки "Вікі" в інтерфейс Lampa */
        this.render = function (data, html) {
            var container = $(html);
            if (container.find('.lampa-wiki-smart-btn').length) return;

            var button = $('<div class="full-start__button selector lampa-wiki-smart-btn">' +
                                '<img src="' + ICON_WIKI + '">' +
                                '<span>Вікі</span>' +
                            '</div>');

            /* Впровадження стилів для вікна перегляду та кнопки */
            var style = '<style>' +
                '.lampa-wiki-smart-btn { display: flex !important; align-items: center; justify-content: center; } ' +
                '.lampa-wiki-smart-btn img { width: 1.6em; height: 1.6em; object-fit: contain; margin-right: 5px; } ' +
                '.wiki-smart-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #121212; z-index: 5000; display: flex; flex-direction: column; overflow: hidden; }' +
                '.wiki-smart-header { padding: 25px 5%; background: #1a1a1a; border-bottom: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 2; }' +
                '.wiki-smart-nav { display: flex; align-items: center; gap: 10px; flex: 1; overflow: hidden; }' +
                '.wiki-smart-arrow { font-size: 2.5em; color: #444; font-weight: bold; line-height: 1; padding: 0 20px; user-select: none; transition: 0.2s; -webkit-tap-highlight-color: transparent; }' +
                '.wiki-smart-arrow.active { color: #fff; cursor: pointer; }' +
                '.wiki-smart-info { display: flex; flex-direction: column; overflow: hidden; white-space: nowrap; padding: 0 10px; }' +
                '.wiki-smart-title { font-size: 1.6em; color: #fff; font-weight: bold; text-overflow: ellipsis; overflow: hidden; }' +
                '.wiki-smart-warning { font-size: 0.9em; color: #ffbd2e; margin-top: 6px; display: flex; align-items: center; gap: 8px; }' +
                '.wiki-smart-close { width: 55px; height: 55px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 34px; color: #aaa; background: #252525; cursor: pointer; }' +
                '.wiki-smart-close.focus { background: #fff; color: #000; }' +
                '.wiki-smart-content { flex: 1; overflow-y: auto; padding: 40px 6% 80px 6%; color: #d0d0d0; line-height: 1.65; font-size: 1.45em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-smart-content h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1em; padding-bottom: 0.3em; }' +
                '.wiki-smart-extracted-table { margin: 1.2em 0; padding: 15px 20px; background: #1a1a1a; border-left: 4px solid #444; border-radius: 0 8px 8px 0; color: #bbb; font-size: 0.9em; }' +
                '.wiki-smart-extracted-img { max-width: 350px !important; height: auto; display: block; margin: 20px auto; border-radius: 8px; }' +
                '</style>';

            if (!$('style#wiki-smart-style').length) $('head').append('<style id="wiki-smart-style">' + style + '</style>');

            /* Позиціонування кнопки в ряду стандартних кнопок Lampa */
            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            var neighbors = buttons_container.find('.selector');
            if (neighbors.length >= 2) button.insertAfter(neighbors.eq(1));
            else buttons_container.append(button);

            if (Lampa.Controller.enabled().name === 'full_start') {
                Lampa.Controller.toggle('full_start');
            }

            /* Фоновий запуск пошуку при відкритті картки */
            _this.startFullSearch(data.movie);

            button.on('hover:enter click', function() {
                if (!isOpened) _this.handleButtonClick(data.movie);
            });
        };

        /* Обробка натискання кнопки Вікі */
        this.handleButtonClick = function(movie) {
            if (!movie) return;
            isOpened = true;

            if (cachedResults && cachedResults.length > 0) {
                _this.openViewer(cachedResults, isFallbackUsed);
            } else if (searchPromise) {
                Lampa.Noty.show('Пошук у Wikipedia...');
                searchPromise.done(function(results, isFallback) {
                    if (results.length) _this.openViewer(results, isFallback);
                    else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                }).fail(function() { Lampa.Noty.show('Помилка завантаження'); isOpened = false; });
            }
        };

        /* --- Алгоритм пошуку (Wikidata + Fallback) --- */
        this.startFullSearch = function(movie) {
            var def = $.Deferred();
            this.searchWikidata(movie).done(function(results) {
                if (results && results.length > 0) {
                    cachedResults = results; isFallbackUsed = false;
                    def.resolve(results, false);
                } else {
                    _this.searchTextFallback(movie).done(function(fallbackResults) {
                        cachedResults = fallbackResults; isFallbackUsed = true;
                        def.resolve(fallbackResults, true);
                    }).fail(function() { def.reject(); });
                }
            }).fail(function() {
                _this.searchTextFallback(movie).done(function(fallbackResults) {
                    cachedResults = fallbackResults; isFallbackUsed = true;
                    def.resolve(fallbackResults, true);
                }).fail(function() { def.reject(); });
            });
            searchPromise = def.promise();
            return searchPromise;
        };

        /* Пошук через Wikidata (найточніший метод) */
        this.searchWikidata = function (movie) {
            var def = $.Deferred();
            var method = (movie.original_name || movie.name) ? 'tv' : 'movie';
            var mainType = method === 'tv' ? 'Серіал' : 'Фільм';
            var tmdbKey = Lampa.TMDB.key();

            $.ajax({
                url: Lampa.TMDB.api(method + '/' + movie.id + '/external_ids?api_key=' + tmdbKey),
                dataType: 'json',
                success: function(extResp) {
                    var mainQId = extResp.wikidata_id;
                    if (!mainQId) return def.reject();

                    /* Отримання пов'язаних сутностей: режисери, актори, приквели */
                    $.ajax({
                        url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + mainQId + '&props=claims&format=json&origin=*',
                        dataType: 'json',
                        success: function(claimResp) {
                            var claims = claimResp.entities[mainQId].claims || {};
                            var targets = [{ qId: mainQId, type: mainType }];

                            var extractQIds = function(prop, typeName, limit) {
                                if (claims[prop]) {
                                    claims[prop].slice(0, limit).forEach(function(item) {
                                        if (item.mainsnak.datavalue) targets.push({ qId: item.mainsnak.datavalue.value.id, type: typeName });
                                    });
                                }
                            };

                            extractQIds('P144', 'Основано на', 1);
                            extractQIds('P57', 'Режисер', 1);
                            extractQIds('P161', 'Актор', 5);

                            var uniqueQIds = targets.map(t => t.qId).filter((v, i, a) => a.indexOf(v) === i);

                            /* Отримання посилань на україномовну або англомовну Вікіпедію */
                            $.ajax({
                                url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + uniqueQIds.join('|') + '&props=sitelinks&format=json&origin=*',
                                dataType: 'json',
                                success: function(siteResp) {
                                    var finalResults = [];
                                    var entities = siteResp.entities || {};
                                    targets.forEach(function(t) {
                                        var entity = entities[t.qId];
                                        if (entity && entity.sitelinks) {
                                            if (entity.sitelinks.ukwiki) finalResults.push({ type: t.type, title: entity.sitelinks.ukwiki.title, lang: 'ua', langIcon: '🇺🇦' });
                                            else if (entity.sitelinks.enwiki) finalResults.push({ type: t.type, title: entity.sitelinks.enwiki.title, lang: 'en', langIcon: '🇺🇸' });
                                        }
                                    });
                                    def.resolve(finalResults);
                                },
                                error: function() { def.reject(); }
                            });
                        },
                        error: function() { def.reject(); }
                    });
                },
                error: function() { def.reject(); }
            });
            return def.promise();
        };

        /* Пошук за назвою (якщо QID не спрацював) */
        this.searchTextFallback = function(movie) {
            var def = $.Deferred();
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            var titleUA = (movie.title || movie.name || '').replace(/[^\w\sа-яієїґ]/gi, '');
            var isTV = !!(movie.first_air_date || movie.number_of_seasons);
            
            $.ajax({ 
                url: 'https://uk.wikipedia.org/w/api.php', 
                data: { action: 'query', list: 'search', srsearch: titleUA + ' ' + year + (isTV ? ' серіал' : ' фільм'), srlimit: 3, format: 'json', origin: '*' }, 
                dataType: 'json',
                success: function(r) {
                    var results = [];
                    if (r.query && r.query.search) {
                        r.query.search.forEach(function(i) {
                            results.push({ type: 'Знайдено', title: i.title, lang: 'ua', langIcon: '🇺🇦' });
                        });
                        def.resolve(results);
                    } else def.reject();
                },
                error: function() { def.reject(); }
            });
            return def.promise();
        };

        /* --- Інтерфейс перегляду статті --- */
        this.openViewer = function(articles, isFallback) {
            var prev_controller = Lampa.Controller.enabled().name;
            var currentIndex = 0;

            var viewer = $('<div class="wiki-smart-overlay">' +
                                '<div class="wiki-smart-header">' +
                                    '<div class="wiki-smart-nav">' +
                                        '<div class="wiki-smart-arrow arrow-left">‹</div>' +
                                        '<div class="wiki-smart-info">' +
                                            '<div class="wiki-smart-type"></div>' +
                                            '<div class="wiki-smart-title"></div>' +
                                        '</div>' +
                                        '<div class="wiki-smart-arrow arrow-right">›</div>' +
                                        '<div class="wiki-smart-counter"></div>' +
                                    '</div>' +
                                    '<div class="wiki-smart-close selector">×</div>' +
                                '</div>' +
                                '<div class="wiki-smart-content"></div>' +
                            '</div>');

            $('body').append(viewer);

            /* Оновлення контенту при перемиканні між статтями */
            var updateUI = function() {
                var item = articles[currentIndex];
                viewer.find('.wiki-smart-type').text(item.type + ' ' + item.langIcon);
                viewer.find('.wiki-smart-title').text(item.title);
                viewer.find('.wiki-smart-counter').text('[' + (currentIndex + 1) + '/' + articles.length + ']');
                
                var contentDiv = viewer.find('.wiki-smart-content');
                contentDiv.html('<div class="wiki-smart-loader">Завантаження...</div>');

                /* Отримання чистого HTML статті через Wikipedia REST API */
                var apiUrl = 'https://' + (item.lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(item.title);

                $.ajax({
                    url: apiUrl,
                    success: function(htmlContent) {
                        /* Очищення та трансформація HTML */
                        htmlContent = htmlContent.replace(/<base[^>]*>/gi, '').replace(/src="\/\//g, 'src="https://');
                        var tempDiv = $('<div>').html(htmlContent);
                        tempDiv.find('script, style, link, .mw-empty-elt, .navbox, .reflist, .reference').remove();

                        /* КОНВЕРТАЦІЯ ТАБЛИЦЬ У ТЕКСТ (для TV-інтерфейсу) */
                        tempDiv.find('table').each(function() {
                            var table = $(this);
                            var textBlocks = [];
                            table.find('tr').each(function() {
                                var rowText = [];
                                $(this).children('th, td').each(function() {
                                    var cellText = $(this).text().trim();
                                    if (cellText) rowText.push(cellText);
                                });
                                if (rowText.length) textBlocks.push(rowText.join(' — '));
                            });
                            table.replaceWith('<div class="wiki-smart-extracted-table">' + textBlocks.join('<br>') + '</div>');
                        });

                        contentDiv.html(tempDiv.html());
                    }
                });
            };

            /* Навігація кнопками та пультом */
            viewer.find('.wiki-smart-close').on('click', function() { viewer.remove(); Lampa.Controller.toggle(prev_controller); isOpened = false; });
            viewer.find('.arrow-left').on('click', function() { if (currentIndex > 0) { currentIndex--; updateUI(); } });
            viewer.find('.arrow-right').on('click', function() { if (currentIndex < articles.length - 1) { currentIndex++; updateUI(); } });

            Lampa.Controller.add('wiki_smart_viewer', {
                toggle: function() { Lampa.Controller.collectionFocus(viewer.find('.wiki-smart-close')[0], viewer); },
                up: function() { viewer.find('.wiki-smart-content').scrollTop(viewer.find('.wiki-smart-content').scrollTop() - 200); },
                down: function() { viewer.find('.wiki-smart-content').scrollTop(viewer.find('.wiki-smart-content').scrollTop() + 200); },
                left: function() { viewer.find('.arrow-left').click(); },
                right: function() { viewer.find('.arrow-right').click(); },
                back: function() { viewer.find('.wiki-smart-close').click(); }
            });

            Lampa.Controller.toggle('wiki_smart_viewer');
            updateUI();
        };
    }

    /* Запуск плагіна */
    if (window.Lampa) new WikiSmartPlugin().init();
})();
