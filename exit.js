(function () {
    "use strict";
	
	/**
     * VOTE COLORS (Unified)
     * Developed by: Lampa Users
     * Version: 1.0
     * Description:
     */

    /* --- Маніфест плагіна (відображається в налаштуваннях) --- */
    var pluginManifest = {
        name: 'Main Menu Exit',
        version: '1.0',
        description: 'Додає пункт виходу з підтвердженням та перевіркою середовища',
        author: 'Lampa Users',
    };

    /* --- Локалізація текстів --- */
    Lampa.Lang.add({
        exit_menu: {
            ru: "Выход",
            en: "Exit",
            uk: "Вихід",
            be: "Вынахад",
            zh: "出口",
            pt: "Saída",
            bg: "Изход"
        },
        exit_confirm_title: {
            uk: "Вихід",
            ru: "Выход",
            en: "Exit"
        },
        exit_confirm_text: {
            uk: "Ви дійсно хочете закрити програму?",
            ru: "Вы действительно хотите выйти?",
            en: "Do you really want to exit?"
        },
        exit_browser_warning: {
            uk: "Ця функція не працює в браузері. Просто закрийте вкладку.",
            ru: "Эта функция не работает в браузере. Просто закройте вкладку.",
            en: "This function doesn't work in the browser. Just close the tab."
        },
        exit_yes: { uk: "Так", ru: "Да", en: "Yes" },
        exit_no: { uk: "Ні", ru: "Нет", en: "No" }
    });

    /* --- Компонент-заглушка для системи Activity --- */
    function exit_m(object) {
        this.create = function () { };
        this.build = function () { };
        this.start = function () { };
        this.pause = function () { };
        this.stop = function () { };
        this.render = function () { };
        this.destroy = function () { };
    }

    /* --- Функція створення та додавання кнопки в меню --- */
    function add() {
        // Твоя оригінальна іконка без змін
        var ico = '<svg version="1.1" id="exit" color="#fff" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n<g>\n	<path fill="currentColor" d="M256,5.1c138.6,0,250.9,112.3,250.9,250.9S394.6,506.9,256,506.9S5.1,394.6,5.1,256S117.4,5.1,256,5.1z\n		 M256,40.1C136.7,40.1,40.1,136.7,40.1,256S136.7,471.9,256,471.9S471.9,375.3,471.9,256S375.3,40.1,256,40.1z M311.4,176.6\n		c6.7-6.7,17.5-6.7,24.2,0c6.7,6.7,6.7,17.5,0,24.2l-55.1,55.1l55.1,55c6.7,6.7,6.7,17.5,0,24.2c-6.7,6.7-17.5,6.7-24.2,0L256.3,280\n		l-55.1,55.1c-6,6-15.4,6.6-22.1,1.8l-2.2-1.8c-6.7-6.7-6.7-17.5,0-24.2l55.1-55l-55.1-55c-6.7-6.7-6.7-17.5,0-24.2s17.5-6.7,24.2,0\n		l55.1,55.1L311.4,176.6z"/>\n</g>\n</svg>';

        // Формуємо пункт меню
        var menu_items = $(
            '<li class="menu__item selector" data-action="exit_r"><div class="menu__ico">' +
            ico +
            '</div><div class="menu__text">' +
            Lampa.Lang.translate("exit_menu") +
            "</div></li>"
        );

        // Подія натискання
        menu_items.on("hover:enter", function () {
            // ПЕРЕВІРКА: Чи ми в браузері? 
            // Якщо жодна з нативних платформ не визначена — значить це звичайний браузер
            var isNative = Lampa.Platform.is('tizen') || Lampa.Platform.is('webos') || 
                           Lampa.Platform.is('android') || Lampa.Platform.is('apple_tv') || 
                           Lampa.Platform.is('nw') || Lampa.Platform.is('orsay');

            if (!isNative) {
                // Виводимо сповіщення, що в браузері вихід не працює
                Lampa.Noty.show(Lampa.Lang.translate('exit_browser_warning'));
            } else {
                // Якщо це додаток (ТВ, Андроїд або NW.js на ноутбуці) — показуємо підтвердження
                Lampa.Select.show({
                    title: Lampa.Lang.translate('exit_confirm_title'),
                    items: [
                        { title: Lampa.Lang.translate('exit_yes'), action: 'yes' },
                        { title: Lampa.Lang.translate('exit_no'), action: 'no' }
                    ],
                    onSelect: function (item) {
                        if (item.action === 'yes') {
                            Lampa.Activity.out();
                            // Виконуємо вихід відповідно до платформи
                            if (Lampa.Platform.is('apple_tv')) window.location.assign('exit://exit');
                            if (Lampa.Platform.is("tizen")) tizen.application.getCurrentApplication().exit();
                            if (Lampa.Platform.is("webos")) window.close();
                            if (Lampa.Platform.is("android")) Lampa.Android.exit();
                            if (Lampa.Platform.is("orsay")) Lampa.Orsay.exit();
                            if (Lampa.Platform.is("nw")) nw.Window.get().close();
                        } else {
                            Lampa.Controller.toggle('menu'); // Повертаємось у меню
                        }
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('menu');
                    }
                });
            }
        });

        // Додаємо в другий блок меню (де налаштування)
        $(".menu .menu__list").eq(1).append(menu_items);
    }

    /* --- Реєстрація та запуск плагіна --- */
    function createExitMenu() {
        window.plugin_exit_m_ready = true;
        Lampa.Component.add("exit_m", exit_m);
        
        if (window.appready) add();
        else {
            Lampa.Listener.follow("app", function (e) {
                if (e.type == "ready") add();
            });
        }
    }

    if (!window.plugin_exit_m_ready) createExitMenu();

})();
