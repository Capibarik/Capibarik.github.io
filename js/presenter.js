// FIXME: update_settings() uses the same code three times
// TODO: define new behavior of dragged balls
// TODO: process case in the code when the balls is over
// TODO: you have to not forget that you need update draggable properties of game balls before new game
// TODO: implement function send_message() instead of alerts
// TODO: before a game you should disable everything except 'theme' radiobuttons in settings
// TODO: implement function of rotate and add marbles of field at both model and view 
// DONE: so the overlay doesn`t want to disappear, you should fix that
// DONE: create score table using data from settings
// DONE: why does img of balls think that it is notch and recieve drop event?
// DONE: overlay doesn`t still work properly
// Presenter - communicate with model (js app) and view (HTML and CSS)


import game from "./model.js";


let doc = document;
let current_add_window = false; // true - occupied, false - free
let dragged_elem = null; // it is game ball

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
    // events for game
    for (let game_ball of doc.querySelectorAll("#left-balls-table img")) {
        game_ball.addEventListener("dragstart", dragstart_ball);
    }
    for (let notch of doc.getElementsByClassName("notch")) {
        notch.addEventListener("dragover", dragover_notch);
        notch.addEventListener("dragleave", dragleave_notch);
        notch.addEventListener("drop", place_marble);
    }
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
    // micro func
    function change_zIndex() {
        overlay.style.zIndex = "-1";
    }
    if (offset >= 0) { // want to occupied
        if (!current_add_window) { // free
            elem.style.cssText = addCss;
            overlay.style.opacity = "90%";
            overlay.style.zIndex = "1";
            current_add_window = true; // occupied
        }
    }
    else { // want to leave
        overlay.addEventListener("transitionend", change_zIndex, {
            "once": true,
        }); // put overlay under main layers
        elem.style.cssText = addCss;
        overlay.style.opacity = "0%";
        current_add_window = false; // free
    }
}

function send_message() {
    // like alert, but it is better
    
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
    let deckOfPatterns = game.deckOfPatterns;
    // update interface (generate cards) (to UI)
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
            img_marble.src = "imgs/" + game.getColorOfNumber(cardMarble.color) + "_cardball.png";
            img_marble.setAttribute("draggable", "false");
            inner_card.appendChild(img_marble);
        }
        empty_card.appendChild(inner_card);
        container_cards.appendChild(empty_card);
    }
}

function dragstart_ball(evt) {
    // ball is started to drag
    // read data (from UI)
    dragged_elem = evt.target; // memorize what ball has been dragged
    let color = dragged_elem.src.match(/(?<=imgs\/).*/)[0].match(/.*(?=_gameball\.png)/)[0];
    // read data (from model)
    if (game.getNumberOfMarbles(color) == 1) {
        evt.target.setAttribute("draggable", "false");
    }
}

function dragover_notch(evt) {
    // dragged ball over notch
    evt.preventDefault(); // block next acts to allow dispatching drop event
    let notch = evt.target;
    if (notch.childNodes.length == 0 & notch.nodeName === "DIV") {
        notch.classList.add("bordered");
    }
}

function dragleave_notch(evt) {
    // dragged ball leave from notch
    evt.target.classList.remove("bordered");
}

function place_marble(evt) { 
    // drop ball on the notch
    dragleave_notch(evt);
    // read data from model (from model)
    let isBlock = game.settings.isBlock; // has game started?
    // continue read data from interface (from UI)
    let notch = evt.target;
    if (!isBlock) { // game is block
        alert("Game hasn`t started yet");
    }
    else if (notch.childNodes.length > 0 | notch.nodeName !== "DIV") {
        alert("This place has been occupied");
    }
    else {
        // update inteface (to UI)
        let new_game_ball = doc.createElement("img");
        new_game_ball.setAttribute("draggable", "false");
        new_game_ball.src = dragged_elem.src;
        notch.appendChild(new_game_ball);
        // read data from interface (from UI)
        let index_field = parseInt(notch.parentNode.getAttribute("id").split("-")[2]) - 1;
        let index_notch = parseInt(notch.getAttribute("class").split(" ")[1].at(1)) - 1; // just take number of notch
        let index_row = Math.floor(index_notch / 3);
        index_notch %= 3;
        let color = new_game_ball.src.match(/(?<=imgs\/).*/)[0].match(/.*(?=_gameball\.png)/)[0];
        // update model (to model)
        game.placeMarble(index_field, index_row, index_notch, color);
        // update interface (to UI)
        let td_xnum = doc.getElementById(color + "-xnum");
        td_xnum.innerHTML = "X" + game.getNumberOfMarbles(color);
        // as soon as player puts ball on the field, the arrows will appear on each angle of the parts
        rotate();
    }
}

function rotate() {
    // rotate part of field
    let arrow_cw = doc.createElement("img"); // clockwise
    let arrow_ccw = doc.createElement("img"); // counter clockwise
    
}