(function () {
    'use strict';

    /**
     * OMDB & TOTAL RATINGS (Unified)
     * Developed by: Lampa Users
     * Version: 1.1
     */
	 
    /* --- Маніфест --- */
    var pluginManifest = {
        version: '1.1',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };
	
    // Локалізація та іконки
    function startPlugin() {
        if (window.star_combined_ratings_active) return;
        window.star_combined_ratings_active = true;

        Lampa.Lang.add({
            rating_omdb_avg: {
                ru: 'ИТОГ',
                en: 'TOTAL',
                uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>',
                be: 'ВЫНІК', pt: 'TOTAL', zh: '总评', he: 'סה"כ', cs: 'VÝSLEDEK', bg: 'РЕЗУЛТАТ'
            },
            loading_dots: {
                ru: 'Загрузка рейтингов', en: 'Loading ratings', uk: 'Трішки зачекаємо ...', be: 'Загрузка рэйтынгаў', pt: 'Carregando classificações', zh: '载入评分', he: 'טוען דירוגים', cs: 'Načítání hodnocení', bg: 'Зареждане на рейтинги'
            },
            star_omdb_oscars: { // ЗАМІНЕНО на star
                ru: 'Оскары',
                en: 'Oscars',
                uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
                be: 'Оскары', pt: 'Oscars', zh: '奥斯卡奖', he: 'אוסקר', cs: 'Oscary', bg: 'Оскари'
            },
            source_imdb: {
                ru: 'IMDB', en: 'IMDB', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
                be: 'IMDB', pt: 'IMDB', zh: 'IMDB', he: 'IMDB', cs: 'IMDB', bg: 'IMDB'
            },
            source_tmdb: {
                ru: 'TMDB', en: 'TMDB', uk: '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRw..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
                be: 'TMDB', pt: 'TMDB', zh: 'TMDB', he: 'TMDB', cs: 'TMDB', bg: 'TMDB'
            },
            source_rt: {
                ru: 'Rotten Tomatoes', en: 'Rotten Tomatoes', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
                be: 'Rotten Tomatoes', pt: 'Rotten Tomatoes', zh: '烂番茄', he: 'Rotten Tomatoes', cs: 'Rotten Tomatoes', bg: 'Rotten Tomatoes'
            },
            source_mc: {
                ru: 'Metacritic', en: 'Metacritic', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
                be: 'Metacritic', pt: 'Metacritic', zh: 'Metacritic', he: 'Metacritic', cs: 'Metacritic', bg: 'Metacritic'
            }
        });

        /* --- Стилі (Всі ID тепер STAR) --- */
        var style = "<style id=\"star_omdb_rating\">" +
            ".full-start-new__rate-line { visibility: hidden; flex-wrap: wrap; gap: 0.4em 0; }" +
            ".full-start-new__rate-line > * { margin-left: 0 !important; margin-right: 0.6em !important; }" +
            ".rate--avg.rating--green { color: #4caf50; }" +
            ".rate--avg.rating--lime { color: #3399ff; }" +
            ".rate--avg.rating--orange { color: #ff9933; }" +
            ".rate--avg.rating--red { color: #f44336; }" +
            ".rate--oscars { color: gold; }" +
            "</style>";
        Lampa.Template.add('card_css', style);
        $('body').append(Lampa.Template.get('card_css', {}, true));

        var loadingStyles = "<style id=\"star_loading_animation\">" +
            ".loading-dots-container { position: absolute; top: 50%; left: 0; right: 0; text-align: left; transform: translateY(-50%); z-index: 10; }" +
            ".full-start-new__rate-line { position: relative; }" +
            ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #ffffff; font-size: 1em; background: rgba(0, 0, 0, 0.3); padding: 0.6em 1em; border-radius: 0.5em; }" +
            ".loading-dots__text { margin-right: 1em; }" +
            ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
            ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
            ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
            "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +
            "</style>";
        Lampa.Template.add('loading_animation_css', loadingStyles);
        $('body').append(Lampa.Template.get('loading_animation_css', {}, true));

        /* --- Конфігурація Кешу --- */
        var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;
        var STAR_OMDB_CACHE = 'star_rating_omdb';
        var STAR_MAPPING_CACHE = 'star_id_mapping';
        var OMDB_API_KEY = window.RATINGS_PLUGIN_TOKENS?.OMDB_API_KEY || '5301dba1';

        var AGE_RATINGS = { 'G': '3+', 'PG': '6+', 'PG-13': '13+', 'R': '17+', 'NC-17': '18+', 'TV-Y': '0+', 'TV-Y7': '7+', 'TV-G': '3+', 'TV-PG': '6+', 'TV-14': '14+', 'TV-MA': '17+' };
        var WEIGHTS = { imdb: 0.40, tmdb: 0.40, mc: 0.10, rt: 0.10 };

        // Основна логіка
        function parseOscars(awardsText) {
            if (typeof awardsText !== 'string') return null;
            var match = awardsText.match(/Won (\d+) Oscars?/i);
            return (match && match[1]) ? parseInt(match[1], 10) : null;
        }

        function addLoadingAnimation() {
            var render = Lampa.Activity.active().activity.render();
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
            rateLine.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + Lampa.Lang.translate("loading_dots") + '</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
            $('.loading-dots-container', rateLine).css({ 'opacity': '1', 'visibility': 'visible' });
        }

        function removeLoadingAnimation() {
            var render = Lampa.Activity.active().activity.render();
            if (!render) return;
            $('.loading-dots-container', render).remove();
        }

        function getCardType(card) {
            var type = card.media_type || card.type;
            if (type === 'movie' || type === 'tv') return type;
            return card.name || card.original_name ? 'tv' : 'movie';
        }

        function getRatingClass(rating) {
            if (rating >= 8.0) return 'rating--green';
            if (rating >= 6.0) return 'rating--lime';
            if (rating >= 5.5) return 'rating--orange';
            return 'rating--red';
        }

        function fetchAdditionalRatings(card) {
            var render = Lampa.Activity.active().activity.render();
            if (!render) return;

            var normalizedCard = {
                id: card.id,
                imdb_id: card.imdb_id || card.imdb || null,
                type: getCardType(card)
            };

            var rateLine = $('.full-start-new__rate-line', render);
            if (rateLine.length) {
                rateLine.css('visibility', 'hidden');
                addLoadingAnimation();
            }

            var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
            var cachedData = getStarCache(STAR_OMDB_CACHE, cacheKey);

            if (cachedData) {
                processAndDisplay(cachedData);
            } else if (normalizedCard.imdb_id) {
                loadFromApi(normalizedCard, cacheKey);
            } else {
                getImdbId(normalizedCard.id, normalizedCard.type, function(id) {
                    if (id) {
                        normalizedCard.imdb_id = id;
                        loadFromApi(normalizedCard, normalizedCard.type + '_' + id);
                    } else finalizeUI({});
                });
            }

            function processAndDisplay(data) {
                insertRatings(data.rt, data.mc, data.oscars);
                updateNativeElements(data);
                calculateAverage();
            }

            function loadFromApi(c, key) {
                var url = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&i=' + c.imdb_id;
                new Lampa.Reguest().silent(url, function(data) {
                    if (data && data.Response === 'True') {
                        var res = {
                            rt: extract(data.Ratings, 'Rotten Tomatoes'),
                            mc: extract(data.Ratings, 'Metacritic'),
                            imdb: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
                            ageRating: data.Rated || null,
                            oscars: parseOscars(data.Awards || '')
                        };
                        saveStarCache(STAR_OMDB_CACHE, key, res);
                        processAndDisplay(res);
                    } else finalizeUI({});
                }, function() { finalizeUI({}); });
            }
        }

        function extract(ratings, source) {
            if (!ratings || !Array.isArray(ratings)) return null;
            var r = ratings.find(function(i) { return i.Source === source; });
            if (!r) return null;
            return source === 'Rotten Tomatoes' ? parseFloat(r.Value) / 10 : parseFloat(r.Value.split('/')[0]) / 10;
        }

        function getStarCache(cKey, key) {
            var cache = Lampa.Storage.get(cKey) || {};
            var item = cache[key];
            return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
        }

        function saveStarCache(cKey, key, data) {
            var cache = Lampa.Storage.get(cKey) || {};
            cache[key] = Object.assign(data, { timestamp: Date.now() });
            Lampa.Storage.set(cKey, cache);
        }

        function getImdbId(tmdbId, type, callback) {
            var cleanType = type === 'movie' ? 'movie' : 'tv';
            var cacheKey = cleanType + '_' + tmdbId;
            var cache = Lampa.Storage.get(STAR_MAPPING_CACHE) || {};
            if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) return callback(cache[cacheKey].imdb_id);

            var url = 'https://api.themoviedb.org/3/' + cleanType + '/' + tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();
            new Lampa.Reguest().silent(url, function(data) {
                if (data && data.imdb_id) {
                    cache[cacheKey] = { imdb_id: data.imdb_id, timestamp: Date.now() };
                    Lampa.Storage.set(STAR_MAPPING_CACHE, cache);
                    callback(data.imdb_id);
                } else callback(null);
            }, function() { callback(null); });
        }

        function updateNativeElements(ratings) {
            var render = Lampa.Activity.active().activity.render();
            var pg = $('.full-start__pg.hide', render);
            if (pg.length && ratings.ageRating && !['N/A','Not Rated'].includes(ratings.ageRating)) {
                pg.removeClass('hide').text(AGE_RATINGS[ratings.ageRating] || ratings.ageRating);
            }
            var imdb = $('.rate--imdb', render);
            if (imdb.length && ratings.imdb) {
                imdb.removeClass('hide').children('div').eq(0).text(ratings.imdb.toFixed(1));
            }
        }

        function insertRatings(rt, mc, oscars) {
            var render = Lampa.Activity.active().activity.render();
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;

            if (rt && !$('.rate--rt', rateLine).length) {
                rateLine.append('<div class="full-start__rate rate--rt"><div>' + rt.toFixed(1) + '</div><div class="source--name">' + Lampa.Lang.translate('source_rt') + '</div></div>');
            }
            if (mc && !$('.rate--mc', rateLine).length) {
                rateLine.append('<div class="full-start__rate rate--mc"><div>' + mc.toFixed(1) + '</div><div class="source--name">' + Lampa.Lang.translate('source_mc') + '</div></div>');
            }
            if (oscars && !$('.rate--oscars', rateLine).length) {
                rateLine.prepend('<div class="full-start__rate rate--oscars"><div>' + oscars + '</div><div class="source--name">' + Lampa.Lang.translate("star_omdb_oscars") + '</div></div>');
            }
        }

        function calculateAverage() {
            var render = Lampa.Activity.active().activity.render();
            var rateLine = $('.full-start-new__rate-line', render);
            var r = {
                imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
                tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
                mc: parseFloat($('.rate--mc div:first', rateLine).text()) || 0,
                rt: parseFloat($('.rate--rt div:first', rateLine).text()) || 0
            };
            var sum = 0, w = 0, count = 0;
            for (var k in WEIGHTS) {
                if (r[k] > 0) { sum += r[k] * WEIGHTS[k]; w += WEIGHTS[k]; count++; }
            }
            $('.rate--avg', rateLine).remove();
            if (count > 1 && w > 0) {
                var avg = sum / w;
                rateLine.prepend('<div class="full-start__rate rate--avg ' + getRatingClass(avg) + '"><div>' + avg.toFixed(1) + '</div><div class="source--name">' + Lampa.Lang.translate("rating_omdb_avg") + '</div></div>');
            }
            finalizeUI();
        }

        function finalizeUI() {
            var render = Lampa.Activity.active().activity.render();
            removeLoadingAnimation();
            $('.full-start-new__rate-line', render).css('visibility', 'visible');
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') setTimeout(function() { fetchAdditionalRatings(e.data.movie); }, 500);
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();
