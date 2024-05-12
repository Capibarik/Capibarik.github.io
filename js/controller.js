// FIXME: update_settings() uses the same code three times
// HACK: change alert() with normal message, you should come up with the solution
// DONE: create score table using data from settings
// TODO: before a game you should disable everything except 'theme' radiobuttons in settings
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
        // read data from interface (from UI)
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
        game.runGame(); // update game field according to the settings
        // close settings and draw score table (to UI)
        create_scoreTable();
        gen_cards();
        smooth_move(doc.getElementById("settings"), "left", -420 - 70 - 10 - 10);
    }
    else {
        alert("Game is going on");
    }
}

function create_scoreTable() {
    // create score table according to settings before the game
    // read data from Score (from model)
    let score = game.scoreTable;
    let table = score.table;
    let alivePlayerID = score.alivePlayerID;
    let rows = table.length - 1;
    let columns = table[0].length;
    // update interface (to UI)
    let tr_of_players = doc.querySelector("#score-table thead tr");
    for (let p = 1; p <= columns; p++) {
        let th_of_player = doc.createElement("th");
        th_of_player.innerHTML = ("P" + p);
        if (p == alivePlayerID) {
            th_of_player.style.color = "white";
        }
        tr_of_players.appendChild(th_of_player);
    }
    let tbody = doc.querySelector("#score-table tbody");
    for (let r = 1; r <= rows; r++) {
        let tr_round = doc.createElement("tr");
        let th_round_label = doc.createElement("th"); 
        th_round_label.innerHTML = "R" + r;
        if (r == 1) { // mark first round 
            th_round_label.style.color = "white";
        }
        tr_round.appendChild(th_round_label);
        for (let p = 1; p <= columns; p++) {
            let th_round = doc.createElement("th");
            th_round.innerHTML = 0;
            tr_round.appendChild(th_round);
        }
        tbody.appendChild(tr_round);
    }
    let tr_result = doc.createElement("tr");
    let th_result_label = doc.createElement("th");
    th_result_label.innerHTML = "RES";
    tr_result.appendChild(th_result_label);
    for (let p = 1; p <= columns; p++) {
        let th_result = doc.createElement("th");
        th_result.innerHTML = 0;
        tr_result.appendChild(th_result);
    }
    tbody.appendChild(tr_result);
}

function gen_cards() {
    // generate cards for game
    // read data from Settings (from model)
    let settings = game.settings;
    let deckOfPatterns = game.deckOfPatterns;
    // update interface (generate cards) (to UI)
    let number_color = {
        0: "yellow",
        1: "red",
        2: "blue"
    };
    // generate cards from deckOfPatterns
    let container_cards = doc.getElementById("cards"); // container has already been on page
    for (let i = 0; i < deckOfPatterns.length; i++) {
        let empty_card = doc.createElement("div");
        empty_card.setAttribute("class", "card-pattern");
        empty_card.setAttribute("id", "card-pattern-" + i);
        let inner_card = doc.createElement("div");
        inner_card.setAttribute("class", "card-marble");
        let cardPattern = deckOfPatterns[i]; 
        for (let cardMarble of cardPattern.pattern) {
            let img_marble = doc.createElement("img");
            img_marble.src = "imgs/" + number_color[cardMarble.color] + "_cardball.png";
            inner_card.appendChild(img_marble);
        }
        empty_card.appendChild(inner_card);
        container_cards.appendChild(empty_card);
    }
}