// FIXME: delete everything has comment DELETE
// TODO: define new behavior of dragged balls
// TODO: process case in the code when all balls is over at the end of the round
// TODO: before a game you should disable everything except 'theme' radiobuttons in settings
// TODO: graphic code refactoring
// TODO: relieve GameField.ts from a lot of outsider methods
// DONE: implement function of rotate and add marbles of field at both model and view 
// DONE: part of fields rotate in wrong way (they do entire 360 degrees turn)
// DONE: coords on parts of fields will break when a player rotates part
// DONE: update_settings() uses the same code three times
// DONE: fixed case when the text of rules goes beyond the limits of block with the add-class
// DONE: balls are able to drag when they are over
// DONE: implement function send_alert() instead of alerts
// DONE: so the overlay doesn`t want to disappear, you should fix that
// DONE: create score table using data from settings
// DONE: why does img of balls think that it is notch and recieve drop event?
// DONE: overlay doesn`t still work properly
// DONE: when player puts ball on the field, but hasn`t rotated part of field, you need disable balls
// DONE: you have to not forget that you need update draggable properties of game balls before new game
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
        doc.getElementById("rules").addEventListener("transitionend", function () {
            doc.getElementById("rules-block").classList.add("text-nowrapped");
        },  { once: true });
    });
    doc.getElementById("btn-rules").addEventListener("click", function () {
        smooth_move(doc.getElementById("rules"), "top", 180);
        doc.getElementById("rules-block").classList.remove("text-nowrapped");
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
    if (offset >= 0) { // want to occupied
        if (!current_add_window) { // free
            elem.style.cssText = addCss;
            overlay.style.opacity = "90%";
            overlay.style.zIndex = "1";
            current_add_window = true; // occupied
        }
    }
    else { // want to leave
        elem.style.cssText = addCss;
        overlay.style.opacity = "0%";
        current_add_window = false; // free
    }
}

function send_alert(message) {
    // like alert, but it is better
    let div_alert = doc.createElement("div");
    div_alert.classList.add("alert");
    let div_attention = doc.createElement("div");
    div_attention.classList.add("attention");
    let img = doc.createElement("img");
    img.src = "imgs/attention.svg";
    img.alt = "Внимание";
    let div_message = doc.createElement("div");
    div_message.classList.add("message");
    div_message.innerHTML = message;
    let div_alert_close = doc.createElement("div");
    div_alert_close.classList.add("alert-close");
    div_alert_close.innerHTML = "X";
    div_attention.appendChild(img);
    div_alert.appendChild(div_attention);
    div_alert.appendChild(div_message);
    div_alert.appendChild(div_alert_close);
    div_alert_close.addEventListener("click", function () {
        // disappearing
        div_alert.style.opacity = "0%";
        div_alert.addEventListener("transitionend", function () {
            // destruct after disappearing
            div_alert.remove();
        }, {once: true,});
    });
    doc.getElementsByTagName("body")[0].appendChild(div_alert);
    // situate alert on the screen
    let width = div_alert.getBoundingClientRect().width;
    let left_offset = window.innerWidth / 2 - width / 2;
    div_alert.style.left = `${left_offset}px`;
    div_alert.style.top = "20%";
    div_alert.style.opacity = "100%";
}

function read_radio_data(group_of_radio) {
    // read condition of radio buttons
    for (let radio_button of group_of_radio) {
        if (radio_button.checked) {
            return radio_button.getAttribute("value");
        }
    }
}

function update_settings() { // or start game
    // update game settings
    let settings = game.settings;
    if (!settings.isBlock) { // game hasn`t started yet
        // read data from interface (from UI)
        let numberOfPlayers = parseInt(read_radio_data(doc.querySelectorAll("#number-of-players input")));
        let numberOfRounds = parseInt(read_radio_data(doc.querySelectorAll("#number-of-rounds input")));
        let theme = read_radio_data(doc.querySelectorAll("#theme input"));
        // set data in game settings (to model)
        settings.updateSettings(numberOfPlayers, numberOfRounds, theme);
        settings.isBlock = true; // game has started
        game.runGame(); // update game field according to the settings
        // close settings and draw score table (to UI)
        create_scoreTable();
        gen_cards();
        smooth_move(doc.getElementById("settings"), "left", -420 - 70 - 10 - 10);
        // enable all gameballs until player will rotates field
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "draggable",
            "true"
        );
    }
    else {
        send_alert("Game is going on");
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
            th_of_player.classList.add("text-highlighted");
        }
        tr_of_players.appendChild(th_of_player);
    }
    let tbody = doc.querySelector("#score-table tbody");
    for (let r = 1; r <= rows; r++) {
        let tr_round = doc.createElement("tr");
        let th_round_label = doc.createElement("th"); 
        th_round_label.innerHTML = "R" + r;
        if (r == 1) { // mark first round 
            th_round_label.classList.add("text-highlighted");
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
    // continue read data from interface (from UI)
    let notch = evt.target;
    if (notch.childNodes.length > 0 | notch.nodeName !== "DIV") {
        send_alert("This place has been occupied");
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
        let color = dragged_elem.src.match(/(?<=imgs\/).*/)[0].match(/.*(?=_gameball\.png)/)[0];
        // update model (to model)
        game.placeMarble(index_field, index_row, index_notch, color);
        // update interface (to UI)
        let td_xnum = doc.getElementById(color + "-xnum");
        td_xnum.innerHTML = "X" + game.getNumberOfMarbles(color);
        // as soon as player puts ball on the field, the arrows will appear on each angle of the parts
        // disable all gameballs until player will rotates field
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "draggable",
            "false"
        );
        add_arrows_on_field(); // for rotating
    }
}

function add_arrows_on_field() {
    // add arrrow for rotating fields
    // update interface (to UI)
    let field = doc.getElementById("field");
    for (let i = 1; i <= 4; i++) {
        let arrow_cw = doc.createElement("img"); // clockwise
        let arrow_ccw = doc.createElement("img"); // counter clockwise
        arrow_cw.src = "imgs/bended_arrow.svg";
        arrow_ccw.src = "imgs/bended_arrow_mirrored.svg";
        arrow_cw.classList.add(...["arrow", "cw-f" + i]);
        arrow_ccw.classList.add(...["arrow", "ccw-f" + i]);
        let part_field = doc.getElementById("field-part-" + i);
        arrow_cw.addEventListener("click", function () {
            rotate(part_field, "cw");
        });
        arrow_ccw.addEventListener("click", function () {
            rotate(part_field, "ccw");
        });
        field.appendChild(arrow_cw);
        field.appendChild(arrow_ccw);
    }
}

function rotate(part_field, direction) {
    // rotate part field
    // update model (to model)
    let index_field = parseInt(part_field.getAttribute("id").match(/\d/)[0]) - 1;
    game.rotate(
        index_field,
        direction
    );
    // update interface (to UI)
    let degrees = parseInt(part_field.getAttribute("rotated"));
    part_field.classList.remove("rotated-" + degrees);
    if (direction === "cw") {
        part_field.setAttribute("rotated", degrees + 90);
        degrees = degrees + 90;
    }
    else {
        part_field.setAttribute("rotated", degrees - 90);
        degrees = degrees - 90;
    }
    part_field.style.transform = `rotate(${degrees}deg)`;
    // delete arrows
    let arrows = doc.getElementsByClassName("arrow");
    while (arrows.length > 0) {
        arrows[0].remove();
    }
    // disable balls selectively  
    let game_balls = doc.querySelectorAll("#left-balls-table img");
    for (let game_ball of game_balls) {
        // read data (from model and UI)
        let color = game_ball.getAttribute("id").match(/.*(?=(-gameball))/)[0];
        let number_of_color = game.getNumberOfMarbles(color);
        // update interface (to UI)
        game_ball.setAttribute("draggable", number_of_color != 0);
    }
    normalize_part_field_coords(part_field, direction);
    end_of_player_turn();
}

function end_of_player_turn() {
    // at the end of player turn we do a lot of things were described in file "Пентаго.drawio"
    check_combs();
    
}

function check_combs() {
    // do we have built combinations?
    // calc (in model)

    // update interface (to UI)

}

function set_list_of_elems_attr(list_of_elems, property, value) {
    for (let elem of list_of_elems) {
        elem.setAttribute(property, value);
    }
}

function normalize_part_field_coords(part_field, direction) {
    /*
    Real:
    1 2 3  (cw (ccw))   7 4 1
    4 5 6     -->       8 5 2  
    7 8 9               9 6 3
    
    We should fix that with turning the opposite direction

    Fixed:
    7 4 1  (ccw (cw))  1 2 3
    8 5 2     -->      4 5 6
    9 6 3              7 8 9

    We know that there is the normal order in part_field of notches in HTML
    So we should change sequence of notches "1 2 3 4 5 6 7 8 9" to "3 6 9 2 5 8 1 4 7"
    if a player turns field clockwise
    And "1 2 3 4 5 6 7 8 9" to "7 4 1 8 5 2 9 6 3", if a player turns counterclockwise, 
    to make normal order on the screen
    */
    let part_field_children = part_field.children;
    let mas = [];
    let nmas = [];
    // read order of notches
    for (let i = 0; i < 9; i++) {
        mas[i] = parseInt(part_field_children[i].classList[1].match(/\d/));
        nmas[i] = mas[i];
    }
    let k = (direction == "cw" ? 9 - 1 : 0);
    let d = (direction == "cw" ? -1 : +1);
    for (let i = 0; i < 3; i++) {
        for (let j = 2 - i; j < mas.length - i; j += 3) {
            nmas[j] = mas[k];
            k += d;
        }
    }
    for (let i = 0; i < mas.length; i++) {
        part_field_children[i].classList.remove("n" + mas[i]);
        part_field_children[i].classList.add("n" + nmas[i]);
    }
}