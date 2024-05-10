// FIXME: update_settings() uses the same code three times
// TODO: create score table using data from settings
// Controller - communicate with model (js app) and view (HTML and CSS)


import game from "./model.js";


let doc = document;
let current_add_window = false; // true - occupied, false - free

(function () {
    window.addEventListener('load', function () {
        init_events();
        init_window();
    }); // everything was loaded
} ());

function init_events() {
    // events for opening and closing add windows
    doc.querySelector("#settings img").addEventListener("click", function() {
        smooth_move(doc.getElementById("settings"), "left", -420 - 70 - 10 - 10);  // 420px - width of add window, 70px - width of img, 10px - left shift, 10px - depth
    });
    doc.getElementById("btn-settings").addEventListener("click", function () {
        smooth_move(doc.getElementById("settings"), "left", 0);
    });
    doc.querySelector("#stats img").addEventListener("click", function() {
        smooth_move(doc.getElementById("stats"), "left", -420 - 70 - 10 - 10);  // 420px - width of add window, 70px - width of img, 10px - left shift, 10px - depth
    });
    doc.getElementById("btn-stats").addEventListener("click", function () {
        smooth_move(doc.getElementById("stats"), "left", 0);
    });
    doc.querySelector("#rules img").addEventListener("click", function() {
        smooth_move(doc.getElementById("rules"), "top", 180 - (180 + 600));  // 180px - top, 180px + 600px - just depth (we mustn`t see rules when we don`t press the button)
    });
    doc.getElementById("btn-rules").addEventListener("click", function () {
        smooth_move(doc.getElementById("rules"), "top", 180);
    });
    // events for update settings
    doc.getElementById("btn-start").addEventListener("click", function () {
        update_settings();
        create_scoreTable();
    });
}

function init_window() {
    smooth_move(doc.getElementById("settings"), "left", 0); // open settings at the beginning
}

function smooth_move(elem, direction, offset) {
    // smooth appearing and disappearing add windows
    let overlay = doc.getElementById("overlay");
    let addCss = `
        ${direction}: ${offset}px;
    `
    if (offset >= 0) { // want to occupied
        if (!current_add_window) { // free
            overlay.removeEventListener("transitionend", function () {
                overlay.style.zIndex = "-1";
            });
            elem.style.cssText = addCss;
            overlay.style.opacity = "90%";
            overlay.style.zIndex = 1;
            current_add_window = true; // occupied
        }
    }
    else { // want to leave
        overlay.addEventListener("transitionend", function () {
            overlay.style.display = "-1";
        });
        elem.style.cssText = addCss;
        overlay.style.opacity = "0%";
        current_add_window = false; // free
    }
}

function update_settings() { // or start game
    // update game settings
    let settings = game.settings;
    if (!settings.isBlock) { // game hasn`t started yet
        // read data from UI (from interface)
        let numberOfPlayers = 0;
        let radio_numberOfPlayers = doc.querySelectorAll("#number-of-players input");
        for (let radio_button of radio_numberOfPlayers) {
            if (radio_button.checked) {
                numberOfPlayers = parseInt(radio_button.getAttribute("value"));
                break;
            }
        }
        let numberOfRounds = 0;
        let radio_numberOfRounds = doc.querySelectorAll("#number-of-rounds input");
        for (let radio_button of radio_numberOfRounds) {
            if (radio_button.checked) {
                numberOfRounds = parseInt(radio_button.getAttribute("value"));
                break;
            }
        }
        let theme = "";
        let radio_theme = doc.querySelectorAll("#theme input");
        for (let radio_button of radio_theme) {
            if (radio_button.checked) {
                theme = radio_button.getAttribute("value");
                break;
            }
        }
        // set data in game settings (to model)
        settings.updateSettings(numberOfPlayers, numberOfRounds, theme);
        settings.isBlock = true; // game has started
        // close settings (to interface)
        smooth_move(doc.getElementById("settings"), "left", -420 - 70 - 10 - 10);
    }
}

function create_scoreTable() {
    // create score table according to settings
    
}