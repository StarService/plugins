(function () {
    'use strict';

    /**
     * OMDB & TOTAL RATINGS (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description: Comprehensive ratings from IMDB, RT, Metacritic and TMDB with weighted average.
     */

    /* --- Маніфест --- */
    var pluginManifest = {
        version: '1.0',
        author: 'Lampa Users',
        docs: 'Private Server',
        contact: 'Private Contact'
    };

    // Локалізація та іконки
    function addLocalization() {
        Lampa.Lang.add({
            ratimg_omdb_avg: {
                ru: 'ИТОГ',
                en: 'TOTAL',
                uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle; margin-right:4px;"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>',
                be: 'ВЫНІК', pt: 'TOTAL', zh: '总评', he: 'סה"כ', cs: 'VÝSLEDEK', bg: 'РЕЗУЛТАТ'
            },
            loading_dots: {
                ru: 'Загрузка рейтингов',
                en: 'Loading ratings',
                uk: 'Трішки зачекаємо ...'
            },
            maxsm_omdb_oscars: {
                ru: 'Оскары',
                en: 'Oscars',
                uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDM4LjE4NTc0NCAxMDEuNzY1IgogICBoZWlnaHQ9IjEzNS42Njk0NSIKICAgd2lkdGg9IjUwLjkwODIwMyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxNCIgLz4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04LjQwNjE3NDUsMC42OTMpIgogICAgIGlkPSJnNCIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmZjYzAwIj4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDYiCiAgICAgICBkPSJtIDI3LjM3MSwtMC42OTMgYyAtMy45MjcsMC4zNjYgLTUuMjI5LDMuNTM4IC00Ljk2Myw2Ljc3OCAwLjI2NiwzLjIzOSAzLjY4NSw2Ljk3MiAwLjEzNSw4Ljk1NiAtMS41NzcsMS40MTMgLTMuMTU0LDMuMDczIC01LjIwNywzLjU0IC0yLjY3OSwwLjYwNyAtNC4yODcsMy4wNTQgLTQuNjA3LDYuNDE5IDEuMzg4LDQuODI0IDAuMzY1LDkuMjg1IDEuNzczLDEyLjgyNCAxLjQwNywzLjUzOSAzLjY5NiwzLjgzMSAzLjk4Niw1LjA3NiAwLjMxNyw3LjYzNyAyLjM0MSwxNy41MzUgMC44NTYsMjQuOTMgMS4xNzIsMC4xODQgMC45MywwLjQ0NCAwLjg5NCwwLjcyOSAtMC4wMzYsMC4yODQgLTAuNDgsMC4zODEgLTEuMDg4LDAuNTI3IDAuODQ3LDcuNjg0IC0wLjI3OCwxMi4xMzYgMS45ODMsMTguNzcxIGwgMCwzLjU5MiAtMS4wNywwIDAsMS41MjQgYyAwLDAgLTcuMzEsLTAuMDA1IC04LjU2NSwwIDAsMCAwLjY4LDIuMTU5IC0xLjUyMywzLjAyNyAwLjAwOCwxLjEgMCwyLjcxOSAwLDIuNzE5IGwgLTEuNTY5LDAgMCwyLjM1MyBjIDEzLjIyMTcwMywwIDI2LjgzNzkwNywwIDM4LjE4NiwwIGwgMCwtMi4zNTIgLTEuNTcsMCBjIDAsMCAtMC4wMDcsLTEuNjE5IDAuMDAxLC0yLjcxOSBDIDQyLjgyLDk1LjEzMyA0My41LDkyLjk3NCA0My41LDkyLjk3NCBjIC0xLjI1NSwtMC4wMDUgLTguNTY0LDAgLTguNTY0LDAgbCAwLC0xLjUyNCAtMS4wNzMsMCAwLC0zLjU5MiBjIDIuMjYxLC02LjYzNSAxLjEzOCwtMTEuMDg3IDEuOTg1LC0xOC43NzEgL0uNjA4LC0wLjE0NiAtMS4wNTQsLTAuMjQzIC0xLjA5LC0wLjUyNyAtMC4wMzYsLTAuMjg1IC0wLjI3OCwtMC41NDUgMC44OTQsLTAuNzI5IC0wLjg0NSwtOC4wNTggMC45MDIsLTE3LjQ5MyAwLjg1OCwtMjQuOTMgMC4yOSwtMS4yNDUgMi41NzksLTEuNTM3IDMuOTg2LC01LjA3NiAxLjQwOCwtMy41MzkgMC4zODUsLTggMS43NzQsLTEyLjgyNCAtMC4zMiwtMy4zNjUgLTEuOTMxLC01LjgxMiAtNC42MSwtNi40MiAtMi4wNTMsLTAuNDY2IC0zLjQ2OSwtMi42IC01LjM2OSwtMy44ODQgLTMuMTE4LC0yLjQ3MiAtMC42MSwtNS4zNjQgMC4zNzMsLTguNTc4IDAsLTUuMDEgLTIuMTU0LC02LjQ4MyAtNS4yOTMsLTYuODExIHoiCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7b3BhY2l0eToxO2ZpbGw6I2ZmY2MwMCIgLz4KICA8L2c+Cjwvc3ZnPgo=" style="height:14px; width:auto; vertical-align:middle; transform:scale(1.2);">'
            },
            source_imdb: {
                uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgNTc1IDI4OS44MyIgd2lkdGg9IjU3NSIgaGVpZ2h0PSIyODkuODMiPjxkZWZzPjxwYXRoIGQ9Ik01NzUgMjQuOTFDNTczLjQ0IDEyLjE1IDU2My45NyAxLjk4IDU1MS45MSAwQzQ5OS4wNSAwIDc2LjE4IDAgMjMuMzIgMEMxMC4xMSAyLjE3IDAgMTQuMTYgMCAyOC42MUMwIDUxLjg0IDAgMjM3LjY0IDAgMjYwLjg2QzAgMjc2Ljg2IDEyLjM3IDI4OS44MyAyNy42NCAyODkuODNDNzkuNjMgMjg5LjgzIDQ5NS42Ijg5LjgzIDU0Ny41OSAyODkuODNDNTYxLjY1IDI4OS44MyA1NzMuMjYgMjc4LjgyIDU3NSAyNjQuNTclQzU3NSAyMTYuNjQgNTc1IDQ4Ljg3IDU3NSAyNC45MVoiIGlkPSJkMXB3aGY5d3kyIj48L3BhdGg+PHBhdGggZD0iTTY5LjM1IDU4LjI0TDExNC45OCA1OC4yNEwxMTQuOTggMjMzLjg5TDY5LjM1IDIzMy44OUw2OS4zNSA1OC4yNFoiIGlkPSJnNWpqbnEyNnlTIj48L3BhdGg+PHBhdGggZD0iTTIwMS4yIDEzOS4xNUMxOTcuMjggMTEyLjM4IDE5NS4xIDk3LjUgMTk0LjY3IDk0LjUzQzE5Mi43NiA4MC4yIDE5MC45NCA2Ny43MyAxODkuMiA1Ny4wOUMxODUuMjUgNTcuMDkgMTY1LjU0IDU3LjA5IDEzMC4wNCA1Ny4wOUwxMzAuMDQgMjMyLjc0TDE3MC4wMSAyMzIuNzRMMTcwLjE1IDExNi43NkwxODYuOTcgMjMyLjc0TDIxNS40NCAyMzIuNzRMMjMxLjM5IDExNC4xOEwyMzEuNTQgMjMyLjc0TDI3MS4zOCAyMzIuNzRMMjcxLjM4IDU3LjA5TDIxMS43NyA1Ny4wOUwyMDEuMiAxMzkuMTVaIiBpZD0iaTNQcmgxSnBYdCI+PC9wYXRoPjxwYXRoIGQ9Ik0zNDYuNzEgOTMuNjNDMzQ3LjIxIDk1Ljg3IDM0Ny40NyAxMDAuOTUgMzQ3LjQ3IDEwOC44OUMzNDcuNDcgMTE1LjcgMzQ3LjQ3IDE3MC4xOCAzNDcuNDcgMTc2Ljk5QzM0Ny40NyAxODguNjggMzQ2LjcxIDE5NS44NCAzNDUuMiAxOTguNDhDMzQzLjY4IDIwMS4xMiAzMzkuNjQgMjAyLjQzIDMzMy4wOSAyMDIuNDNDMzMzLjA5IDE5MC45IDMzMy4wOSA5OC42NiAzMzMuMDkgODcuMTNDMzM4LjA2IDg3LjEzIDM0MS40NSA4Ny42NiAzNDMuMjUgODguN0MzNDUuMDUgODguN0MzNDYuMjEgOTEuMzkgMzQ2LjcxIDkzLjYzWk0zNjcuMzIgMjMwLjk1QzM3Mi43NSAyMjkuNzYgMzc3LjMxIDIyNy42NiAzODEuMDEgMjI0LjY3QzM4NC43IDIyMS42NyAzODcuMjkgMjE3LjUyIDM4OC43NyAyMTIuMjFDMzkwLjI2IDIwNi45MSAzOTEuMTQgMTk2LjM4IDM5MS4xNCAxODAuNjNDMzkxLjE0IDE3NC40NyAzOTEuMTQgMTI1LjEyIDM5MS4xNCAxMTguOTVDMzkxLjE0IDEwMi4zMyAzOTAuNDkgOTEuMTkgMzg5LjQ4IDg1LjUzQzM4OC40NiA3OS44NiAzODUuOTMgNzQuNzEgMzgxLjg4IDcwLjA5QzM3Ny44MiA2NS40NyAzNzEuOSA2Mi4xNSAzNjQuMTIgNjAuMTNDMzU2LjMzIDU4LjExIDM0My42MyA1Ny4wOSAzMjEuNTQgNTcuMDlDMzE5LjI3IDU3LjA5IDMwNy45MyA1Ny4wOSAyODcuNSA1Ny4wOUwyODcuNSAyMzIuNzRMMzQyLjc4IDIzMi43NEMzNTUuNTIgMjMyLjM0IDM2My43IDIzMS43NSAzNjcuMzIgMjMwLjk1WloiIGlkPSJhNG92OXJSR1FtIj48L3BhdGg+PHBhdGggZD0iTTQ2NC43NiAyMDQuN0M0NjMuOTIgMjA2LjkzIDQ2MC4yNCAyMDguMDYgNDU3LjQ2IDIwOC4wNkM0NTQuNzQgMjA4LjA2IDQ1Mi45MyAyMDYuOTggNDUyLjAxIDIwNC44MUM0NTEuMDkgMjAyLjY1IDQ1MC42NCAxOTcuNzIgNDUwLjY0IDE5MEM0NTAuNjQgMTg1LjM2IDQ1MC42NCAxNDguMjIgNDUwLjY0IDE0My41OEM0NTAuNjQgMTM1LjU4IDQ1MS4wNCAxMzAuNTkgNDUxLjg1IDEyOC42QzQ1Mi42NSAxMjYuNjMgNDU0LjQxIDEyNS42MyA0NTcuMTMgMTI1LjYzQzQ1OS45MSAxMjUuNjMgNDYzLjY0IDEyNi43NiA0NjQuNiAxMjkuMDNDNDY1LjU1IDEzMS4zIDQ2Ni4wMyAxMzYuMTUgNDY2LjAzIDE0My41OEM0NjYuMDMgMTQ2LjU4IDQ2Ni4wMyAxNjEuNTggNDY2LjAzIDE4OC41OUM0NjUuNzQgMTk3Ljg0IDQ2NS4zMiAyMDMuMjEgNDY0Ljc2IDIwNC43Wk00MDYuNjggMjMxLjIxTDQ0Ny43NiAyMzEuMjFDNDQ5LjQ3IDIyNC41IDQ1MC40MSAyMjAuNzcgNDUwLjYgMjIwLjAyQzQ1NC4zMiAyMjQuNTIgNDU4LjQxIDIyNy45IDQ2Mi45IDIzMC4xNEM0NjcuMzcgMjMyLjM5IDQ3NC4wNiAyMzMuNTEgNDc5LjI0IDIzMy41MUM0ODYuNDUgMjMzLjUxIDQ5Mi42NyAyMzEuNjIgNDk3LjkyIDIyNy44M0M1MDMuMTYgMjI0LjA1IDUwNi41IDIxOS41NyA1MDcuOTIgMjE0LjQyQzUwOS4zNCAyMDkuMjYgNTEwLjA1IDIwMS40MiA1MTAuMDUgMTkwLjg4QzUxMC4wNSAxODUuOTUgNTEwLjA1IDE0Ni41MyA1MTAuMDUgMTQxLjZDNTEwLjA1IDEzMSA1MDkuODEgMTI0LjA4IDUwOS4zNCAxMjAuODNDNTA4Ljg3IDExNy41OCA1MDcuNDcgMTE0LjI3IDUwNS4xNCAxMTAuODhDNTAyLjgxIDEwNy40OSA0OTkuNDIgMTA0Ljg2IDQ5NC45OCAxMDIuOThDNDkwLjU0IDEwMS4xIDQ4NS4zIDEwMC4xNiA0NzkuMjYgMTAwLjE2QzQ3NC4wMSAxMDAuMTYgNDY3LjI5IDEwMS4yMSA0NjIuODEgMTAzLjI4QzQ1OC4zNCAxMDUuMzUgNDU0LjI4IDEwOC40OSA0NTAuNjQgMTEyLjdDNDUwLjY0IDEwOC44OSA0NTAuNjQgODkuODUgNDUwLjY0IDU1LjU2TDQwNi42OCA1NS41Nkw0MDYuNjggMjMxLjIxWiIgaWQ9ImZrOTY4QnBzWCI+PC9wYXRoPjwvZGVmcz48Zz48Zz48Zz48dXNlIHhsaW5rOmhyZWY9IiNkMXB3aGY5d3kyIiBvcGFjaXR5PSIxIiBmaWxsPSIjZjZjNzAwIiBmaWxsLW9wYWNpdHk9IjEiPjwvdXNlPjxnPjx1c2UgeGxpbms6aHJlZj0iI2QxcHdoZjl3eTIiIG9wYWNpdHk9IjEiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwIj48L3VzZT48L2c+PC9nPjxnPjx1c2UgeGxpbms6aHJlZj0iI2c1ampucTI2eVMiIG9wYWNpdHk9IjEiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwIj48L3VzZT48L2c+PC9nPjxnPjx1c2UgeGxpbms6aHJlZj0iI2kzQmxpZ2h0X2ltZGJfbG9nbyI+PC91c2U+PC9nPjwvZz48L2c+PC9zdmc+" style="height:14px; vertical-align:middle; transform:scale(1.2);">'
            }
        });
    }

    // Стилі
    function addStyles() {
        var css = "<style id=\"star_omdb_rating_styles\">" +
            ".full-start-new__rate-line { visibility: hidden; flex-wrap: wrap; gap: 0.4em 0; }" +
            ".full-start-new__rate-line > * { margin-left: 0 !important; margin-right: 0.6em !important; }" +
            ".rate--avg.rating--green { color: #4caf50; font-weight: bold; }" +
            ".rate--avg.rating--lime { color: #3399ff; }" +
            ".rate--avg.rating--orange { color: #ff9933; }" +
            ".rate--avg.rating--red { color: #f44336; }" +
            ".rate--oscars { color: gold; }" +
            ".loading-dots-container { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; }" +
            ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #fff; background: rgba(0,0,0,0.4); padding: 0.6em 1em; border-radius: 0.5em; }" +
            ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background: currentColor; animation: star-bounce 1.4s infinite ease-in-out both; }" +
            ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
            ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
            "@keyframes star-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +
            "</style>";
        $('body').append(css);
    }

    /* --- Конфігурація --- */
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; 
    var OMDB_CACHE_KEY = 'star_omdb_cache';
    var MAPPING_CACHE_KEY = 'star_mapping_cache';
    var OMDB_API_KEY = '5301dba1'; // Твій ключ

    var WEIGHTS = { imdb: 0.40, tmdb: 0.40, mc: 0.10, rt: 0.10 };

    // Основна логіка
    function parseOscars(text) {
        if (typeof text !== 'string') return null;
        var m = text.match(/Won (\d+) Oscars?/i);
        return m ? parseInt(m[1], 10) : null;
    }

    function fetchAdditionalRatings(card) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var normalized = {
            id: card.id,
            imdb_id: card.imdb_id || card.imdb || null,
            type: card.media_type || card.type || (card.name ? 'tv' : 'movie')
        };

        var rateLine = $('.full-start-new__rate-line', render);
        if (rateLine.length) {
            rateLine.css('visibility', 'hidden');
            addLoadingAnimation(rateLine);
        }

        var key = normalized.type + '_' + (normalized.imdb_id || normalized.id);
        var cached = getCache(OMDB_CACHE_KEY, key);

        if (cached) {
            processRatings(cached);
        } else if (normalized.imdb_id) {
            loadFromOMDB(normalized, key);
        } else {
            // Шукаємо IMDB ID через TMDB
            getImdbId(normalized.id, normalized.type, function(id) {
                if (id) {
                    normalized.imdb_id = id;
                    loadFromOMDB(normalized, normalized.type + '_' + id);
                } else {
                    finalizeUI({});
                }
            });
        }
    }

    function loadFromOMDB(card, key) {
        var url = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&i=' + card.imdb_id;
        new Lampa.Reguest().silent(url, function(data) {
            if (data && data.Response === 'True') {
                var res = {
                    rt: extract(data.Ratings, 'Rotten Tomatoes'),
                    mc: extract(data.Ratings, 'Metacritic'),
                    imdb: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
                    age: data.Rated || null,
                    oscars: parseOscars(data.Awards || '')
                };
                setCache(OMDB_CACHE_KEY, key, res);
                processRatings(res);
            } else finalizeUI({});
        }, function() { finalizeUI({}); });
    }

    function extract(ratings, src) {
        if (!ratings) return null;
        var r = ratings.find(function(i) { return i.Source === src; });
        if (!r) return null;
        return src === 'Rotten Tomatoes' ? parseFloat(r.Value) / 10 : parseFloat(r.Value) / 10;
    }

    function processRatings(data) {
        insertRatingsUI(data);
        calculateFinalRating();
    }

    function insertRatingsUI(data) {
        var render = Lampa.Activity.active().activity.render();
        var rateLine = $('.full-start-new__rate-line', render);

        // Оскари
        if (data.oscars && !$('.rate--oscars', rateLine).length) {
            rateLine.prepend('<div class="full-start__rate rate--oscars"><div>' + data.oscars + '</div><div class="source--name">' + Lampa.Lang.translate("maxsm_omdb_oscars") + '</div></div>');
        }
        
        // RT та Metacritic
        if (data.rt && !$('.rate--rt', rateLine).length) {
            rateLine.append('<div class="full-start__rate rate--rt"><div>' + data.rt.toFixed(1) + '</div><div class="source--name">RT</div></div>');
        }
        if (data.mc && !$('.rate--mc', rateLine).length) {
            rateLine.append('<div class="full-start__rate rate--mc"><div>' + data.mc.toFixed(1) + '</div><div class="source--name">MC</div></div>');
        }
    }

    function calculateFinalRating() {
        var render = Lampa.Activity.active().activity.render();
        var rateLine = $('.full-start-new__rate-line', render);
        
        var ratings = {
            imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
            tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
            mc: parseFloat($('.rate--mc div:first', rateLine).text()) || 0,
            rt: parseFloat($('.rate--rt div:first', rateLine).text()) || 0
        };

        var sum = 0, weight = 0, count = 0;
        for (var k in WEIGHTS) {
            if (ratings[k] > 0) {
                sum += ratings[k] * WEIGHTS[k];
                weight += WEIGHTS[k];
                count++;
            }
        }

        if (count > 1 && weight > 0) {
            var avg = sum / weight;
            var cls = avg >= 8 ? 'rating--green' : (avg >= 6 ? 'rating--lime' : (avg >= 5.5 ? 'rating--orange' : 'rating--red'));
            $('.rate--avg', rateLine).remove();
            rateLine.prepend('<div class="full-start__rate rate--avg ' + cls + '"><div>' + avg.toFixed(1) + '</div><div class="source--name">' + Lampa.Lang.translate("ratimg_omdb_avg") + '</div></div>');
        }

        finalizeUI();
    }

    function finalizeUI() {
        var render = Lampa.Activity.active().activity.render();
        $('.loading-dots-container', render).remove();
        $('.full-start-new__rate-line', render).css('visibility', 'visible');
    }

    function addLoadingAnimation(container) {
        if ($('.loading-dots-container', container).length) return;
        container.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + Lampa.Lang.translate("loading_dots") + '</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
    }

    // Допоміжні функції кешу
    function getCache(cKey, key) {
        var c = Lampa.Storage.get(cKey) || {};
        var i = c[key];
        return i && (Date.now() - i.ts < CACHE_TIME) ? i.data : null;
    }

    function setCache(cKey, key, data) {
        var c = Lampa.Storage.get(cKey) || {};
        c[key] = { data: data, ts: Date.now() };
        Lampa.Storage.set(cKey, c);
    }

    function getImdbId(id, type, callback) {
        var cleanType = type === 'movie' ? 'movie' : 'tv';
        var cached = getCache(MAPPING_CACHE_KEY, cleanType + '_' + id);
        if (cached) return callback(cached);

        var url = 'https://api.themoviedb.org/3/' + cleanType + '/' + id + '/external_ids?api_key=' + Lampa.TMDB.key();
        new Lampa.Reguest().silent(url, function(d) {
            if (d && d.imdb_id) {
                setCache(MAPPING_CACHE_KEY, cleanType + '_' + id, d.imdb_id);
                callback(d.imdb_id);
            } else callback(null);
        }, function() { callback(null); });
    }

    // Запуск
    function startPlugin() {
        if (window.star_ratings_plugin_active) return;
        window.star_ratings_plugin_active = true;

        addLocalization();
        addStyles();

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                setTimeout(function() { fetchAdditionalRatings(e.data.movie); }, 500);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') startPlugin(); });

})();
