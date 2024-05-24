// HACK: create normal screen to announce winner or draw (without alert)
// FIXME: delete everything has comment DELETE
// FIXME: if you select gameball as an image, you can move it
// TODO: process case in the code when all balls is over at the end of the round
// TODO: before a game you should disable everything except 'theme' radiobuttons in settings
// TODO: graphic code refactoring
// TODO: make smooth appearing of card back after checking combs if player builds a combinations
// TODO: process the end of the game (while without animations and transitions)
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

// graphics_utility
import { smooth_move } from "./graphics_utility.js";
// model
import game from "./model.js";


let doc = document;
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
        if (doc.getElementById("score-table") !== null) {
            doc.getElementById("score-table").remove();
        }
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
    // create skeleton of score table
    let score_table = doc.createElement("table");
    score_table.setAttribute("id", "score-table");
    let thead = doc.createElement("thead");
    let first_tr = doc.createElement("tr");
    let first_th = doc.createElement("th");
    first_th.innerHTML = "R\\P";
    let tbody_empty = doc.createElement("tbody");
    first_tr.appendChild(first_th);
    thead.appendChild(first_tr);
    score_table.appendChild(thead);
    score_table.appendChild(tbody_empty);
    doc.getElementById("score").appendChild(score_table);
    // update interface (to UI)
    let tr_of_players = doc.querySelector("#score-table thead tr");
    for (let p = 1; p <= columns; p++) {
        let th_of_player = doc.createElement("th");
        th_of_player.innerHTML = ("P" + p);
        if (p == alivePlayerID) {
            th_of_player.setAttribute("id", "current-player");
        }
        tr_of_players.appendChild(th_of_player);
    }
    let tbody = doc.querySelector("#score-table tbody");
    for (let r = 1; r <= rows; r++) {
        let tr_round = doc.createElement("tr");
        let th_round_label = doc.createElement("th"); 
        th_round_label.innerHTML = "R" + r;
        if (r == 1) { // mark first round 
            th_round_label.setAttribute("id", "current-round");
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
        set_number_of_marbles(color);
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
    check_combs();
}

function check_combs() {
    // do we have built combinations?
    // calc (in model)
    let built_cards_indexes = game.checkCombs();
    // update interface (to UI)
    if (built_cards_indexes.length > 0) { // if there are built cards
        for (let built_index of built_cards_indexes) {
            let card_marble = doc.querySelector(`#card-pattern-${built_index} .card-marble`);
            while (card_marble.children.length > 0) {
                card_marble.children[0].remove();
            }
            card_marble.setAttribute("class", "card-back");
            // add point(s) to current player 
            // read data (from model)
            let score_table = game.scoreTable;
            let current_round = game.currentRound - 1; // score uses 0-indexed
            let current_player = game.playerIDTurn - 1; // score uses 0-indexed
            score_table.addPointToPlayer(current_round, current_player);
            // update intefrace (to UI)
            let cell = doc.querySelector(`#score-table tbody tr:nth-child(${current_round + 1}) th:nth-child(${current_player + 2})`);
            cell.innerHTML = parseInt(cell.innerHTML) + 1;
        }
        // check whether all cards are built
        if (game.getLeftCardPatterns() > 0) { // not all cards are built
            can_we_continue_round();
        }
        else { // all cards are built
            can_we_continue_game();
        }
    }
    else { // if there aren`t
        can_we_continue_round();
    }

}

function can_we_continue_round() {
    // check whether all balls are over
    let left_marbles = game.getLeftMarbles();
    if (left_marbles > 0) { // continue round
        // read data (from model)
        game.changeTurn(); // to model
        // change interface and read data from model (from model to UI)
        let next_player = game.playerIDTurn;
        let current_player_in_table = doc.getElementById("current-player");
        current_player_in_table.removeAttribute("id");
        let next_player_in_table = doc.querySelector(`#score-table thead tr th:nth-child(${next_player + 1})`);
        next_player_in_table.setAttribute("id", "current-player");
    }
    else { // balls are over
        can_we_continue_game();
    }
}

function can_we_continue_game() {
    // check whether it is last round
    let number_of_rounds = game.numberOfRounds;
    let current_round = game.currentRound;
    if (current_round == number_of_rounds) { // end of the game
        // disable balls
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "draggable",
            "false"
        );
        // calculate result (from model)
        game.scoreTable.summarizeScore();
        let result_row = game.scoreTable.getResultRow();
        let winner_id = game.scoreTable.winnerPlayerID;
        console.log(game.scoreTable);
        // update score table result (to UI)
        let result_cells = doc.querySelectorAll("#score-table tbody tr:last-child th:nth-child(n+2)");
        for (let i = 0; i < result_cells.length; i++) {
            result_cells[i].innerHTML = result_row[i];
        }
        // announce the winner or announce draw (to UI)
        if (winner_id == 0) { // draw
            send_alert("Draw :(");
        }
        else { // one winner
            send_alert(`Player P${winner_id} has won!!!\nCongratulations!!!`);
        }
        // update stats (to model)
        game.stats.updateStats(game.scoreTable);
        // update stats (to UI)
        doc.getElementById("number-of-games").innerHTML = game.stats.numberOfGames;
        doc.getElementById("cards-per-round").innerHTML = game.stats.cardsPerRound;
        doc.getElementById("cards-per-game").innerHTML = game.stats.cardsPerGame;
        doc.getElementById("number-of-wins").innerHTML = game.stats.numberWins;
        // clean all game field
        clear_gamefield();
        // unlock settings in order to play again
        game.settings.isBlock = false; // settings is enabled
    }
    else { // it isn`t last round
        run_round(); // run new round
    }
}

function run_round() {
    // clear game field on the screen 
    // clean out marbles and cards
    // restore amount of marbles
    // clear screen (UI)
    remove_elems(".card-pattern");
    remove_elems(".notch img");
    // run new round (model)
    game.runRound();
    let next_round = game.currentRound;
    // update (UI)
    let colors = ["yellow", "blue", "red"];
    for (let color of colors) {
        set_number_of_marbles(color);
    }
    // enable balls
    set_list_of_elems_attr(
        doc.querySelectorAll("#left-balls-table img"),
        "draggable",
        "true"
    );
    // update table
    let current_round_in_table = doc.getElementById("current-round");
    current_round_in_table.removeAttribute("id");
    let next_round_in_table = doc.querySelector(`#score-table tbody tr:nth-child(${next_round}) th:first-child`);
    next_round_in_table.setAttribute("id", "current-round");
    // gen cards
    gen_cards();
}

function set_number_of_marbles(color) {
    // on the screen
    let td_xnum = doc.getElementById(color + "-xnum");
    td_xnum.innerHTML = "X" + game.getNumberOfMarbles(color);
}

function remove_elems(query) {
    let elem = doc.querySelector(query);
    while (elem !== null) {
        elem.remove();
        elem = doc.querySelector(query);
    }
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

function clear_gamefield() {
    // full clear to almost first condition
    // restore marbles (to model)
    game.restoreMarbles();
    // update marbles (to UI)    
    let colors = ["yellow", "blue", "red"];
    for (let color of colors) {
        set_number_of_marbles(color);
    }
    // clear screen (to UI)
    remove_elems(".card-pattern");
    remove_elems(".notch img");
}