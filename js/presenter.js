// FIXME: delete everything has comment DELETE
// FIXME: change color of arrows depending on themes
// TODO: create normal localStorage (with JSON)
// TODO: find out how create pretty animations in order to real player manages to keep an eye on the game
// TODO: find out how computer can get only not zero number of balls
// TODO: how can computer get random color of available ball (number of this ball doesn`t equal zero)
// TODO: try to refactor code for graphics (in presenter)
// TODO: process case in the code when all balls is over at the end of the round
// TODO: before a game you should disable everything except 'theme' radiobuttons in settings
// TODO: graphic code refactoring
// TODO: make smooth appearing of card back after checking combs if player builds a combinations
// TODO: process the end of the game (while without animations and transitions
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
import { 
    smooth_move,
    send_alert,
    read_radio_data,
    remove_elems,
    set_list_of_elems_attr,
    normalize_part_field_coords,
    set_number_of_marbles,
    random_number } from "./graphics_utility.js";
// model
// import { game, stats } from "./model.js";
import {Settings, GameField, Stats} from "./model.js";


let doc = document;
let dragged_elem = null; // it is game ball
let computer = null;
let settings = null;
let stats = null;
let game = null;

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
    for (let theme_radio of doc.querySelectorAll("#theme input[type='radio']")) {
        theme_radio.addEventListener("change", function (evt) {
            set_theme(evt.target.value);
        })
    }
    // events for game
    for (let game_ball of doc.querySelectorAll("#left-balls-table img")) {
        game_ball.addEventListener("dragstart", dragstart_ball);
        game_ball.addEventListener("touchstart", touchstart_ball);
        game_ball.addEventListener("touchmove", touchmove_ball);
        game_ball.addEventListener("touchend", touchend_ball);
    }
    for (let notch of doc.getElementsByClassName("notch")) {
        notch.addEventListener("dragover", dragover_notch);
        notch.addEventListener("dragleave", dragleave_notch);
        notch.addEventListener("drop", function (evt) {
            dragleave_notch(evt);
            place_marble(evt.target, true); // true - I am real player
            // add_arrows_on_field();
        });
    }
}

function init_window() {
    // window.localStorage.clear();
    set_data();
    smooth_move(doc.getElementById("settings"), "left", 0); // open settings at the beginning
}

function set_data() {
    // from localStorage to UI
    let data = read_data_from_localStorage();
    // write default data to localStorage
    for (let row in data) {
        write_data_to_localStorage(row, data[row]);
    }
    // to model
    settings = new Settings(
        data.settings_data.number_of_players,
        data.settings_data.number_of_rounds,
        data.settings_data.theme
    );
    stats = new Stats(
        data.stats_data.number_of_games,
        data.stats_data.number_of_rounds,
        data.stats_data.number_of_cards,
        data.stats_data.wins
    );
    game = new GameField(settings);
    // to UI
    // settings
    doc.querySelector(`#computer input[value=${
        data.settings_data.computer // playing with computer doesn`t connect with settings of game 
    }]`).setAttribute("checked", "");
    doc.querySelector(`#number-of-players input[value='${
        game.settings.numberOfPlayers
    }']`).setAttribute("checked", "");
    doc.querySelector(`#number-of-rounds input[value='${
        game.settings.numberOfRounds
    }']`).setAttribute("checked", "");
    doc.querySelector(`#theme input[value='${
        game.settings.theme
    }']`).setAttribute("checked", "");
    set_theme(game.settings.theme);
    // stats
    doc.querySelector(`#number-of-games`).innerHTML = stats.numberOfGames;
    doc.querySelector(`#cards-per-round`).innerHTML = stats.cardsPerRound;
    doc.querySelector(`#cards-per-game`).innerHTML = stats.cardsPerGame;
    doc.querySelector(`#number-of-wins`).innerHTML = stats.numberWins;
}

function write_data_to_localStorage(purpose, data) {
    if (window.localStorage) {
        window.localStorage[purpose] = JSON.stringify(data);
    }
}

function read_data_from_app() {
    let settings_data = {
        "computer": (computer ? "on" : "off"),
        "number_of_players": parseInt(game.settings.numberOfPlayers),
        "number_of_rounds": parseInt(game.settings.numberOfRounds),
        "theme": game.settings.theme
    };
    let stats_data = {
        "number_of_games": parseInt(stats.numberOfGames),
        "number_of_rounds": parseInt(stats.numberOfRounds),
        "number_of_cards": parseInt(stats.numberOfCards),
        "wins": parseInt(stats.numberWins)
    };
    return {
        "settings_data": settings_data,
        "stats_data": stats_data
    }
}

function read_data_from_localStorage() {
    if (window.localStorage) {
        let settings_data;
        let stats_data;
        if (window.localStorage.length > 0) {
            settings_data = JSON.parse(window.localStorage.settings_data);
            stats_data = JSON.parse(window.localStorage.stats_data);
        }
        else {
            settings_data = {
                "computer": "on",
                "number_of_players": 2,
                "number_of_rounds": 1,
                "theme": "light" 
            }
            stats_data = {
                "number_of_games": 0,
                "number_of_rounds": 0,
                "number_of_cards": 0,
                "wins": 0
            }
        }
        return {
            "settings_data": settings_data,
            "stats_data": stats_data
        };
    }
}

function update_settings() { // or start game
    // update game settings
    if (!game.settings.isBlock) { // game hasn`t started yet
        // read data from interface (from UI)
        let play_with_computer = read_radio_data(doc.querySelectorAll("#computer input"));
        let numberOfPlayers = parseInt(read_radio_data(doc.querySelectorAll("#number-of-players input")));
        let numberOfRounds = parseInt(read_radio_data(doc.querySelectorAll("#number-of-rounds input")));
        let theme = read_radio_data(doc.querySelectorAll("#theme input"));
        // set data in game settings (to model)
        game.settings.updateSettings(numberOfPlayers, numberOfRounds, theme);
        game.runGame(); // update game field according to the settings
        // do we let computer plays or not?
        if (play_with_computer === 'on') computer = true;
        else computer = false;
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
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "class",
            ""
        );
        // write data from UI to localStorage
        let data = read_data_from_app();
        write_data_to_localStorage("settings_data", data.settings_data);
    }
    else {
        send_alert("Game is going on");
    }
}

function set_theme(theme) {
    // set theme
    let theme_id = theme + "-theme";
    doc.getElementsByTagName("html")[0].setAttribute("data", theme_id);
    // write theme to localStorage
    if (window.localStorage) {
        let settings_data = JSON.parse(window.localStorage['settings_data']);
        settings_data['theme'] = theme;
        window.localStorage["settings_data"] = JSON.stringify(settings_data);
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
        let flip_card = doc.createElement("div");
        flip_card.setAttribute("class", "card");
        let inner_card = doc.createElement("div");
        inner_card.setAttribute("class", "card-pattern");
        inner_card.setAttribute("id", "card-pattern-" + i);
        let card_front = doc.createElement("div");
        card_front.setAttribute("class", "card-marble"); 
        let card_back = doc.createElement("div");
        card_back.setAttribute("class", "card-back");
        let cardPattern = deckOfPatterns[i]; 
        for (let cardMarble of cardPattern.pattern) {
            let img_marble = doc.createElement("img");
            img_marble.src = "imgs/" + game.getColorOfNumber(cardMarble.color) + "_cardball.png";
            img_marble.setAttribute("draggable", "false");
            card_front.appendChild(img_marble);
        }
        inner_card.appendChild(card_front);
        inner_card.appendChild(card_back);
        flip_card.appendChild(inner_card);
        container_cards.appendChild(flip_card);        
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

function touchstart_ball(evt) {
    // for phone
    dragstart_ball(evt);
}

function touchmove_ball(evt) {
    // when ball is moved by user
    evt.preventDefault();
    let ball = evt.target;
    let touch = evt.touches[0];
    if (game.settings.isBlock) {
        evt.target.setAttribute("class", "moveable-ball");
        ball.style.left = touch.pageX - ball.offsetWidth / 2 + "px";
        ball.style.top = touch.pageY - ball.offsetHeight / 2 + "px";
    }
}

function touchend_ball(evt) {
    // drop for phone
    
    let touch = evt.changedTouches[0];
    let notch = doc.elementsFromPoint(touch.pageX, touch.pageY)[1]; // should be notch
    
    place_marble(notch, true);
}

function place_marble(notch, isRealPlayer) { // notch: HTMLElement
    // drop ball on the notch
    // continue read data from interface (from UI)
    if (notch.childNodes.length > 0 | notch.nodeName !== "DIV") {
        send_alert("The ball isn`t in a notch");
        set_list_of_elems_attr(
            [dragged_elem],
            "class",
            ""
        ); // return ball on its place
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
        set_number_of_marbles(color, game.getNumberOfMarbles(color));
        // as soon as player puts ball on the field, the arrows will appear on each angle of the parts
        // disable all gameballs until player will rotates field
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "draggable",
            "false"
        );
        // for touches
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "class",
            "immovable-ball"
        )
        if (isRealPlayer) add_arrows_on_field();
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
        arrow_cw.classList.add(...["arrow", "cw-f" + i, "arrow-color"]);
        arrow_ccw.classList.add(...["arrow", "ccw-f" + i, "arrow-color"]);
        arrow_cw.setAttribute("draggable", "false");
        arrow_ccw.setAttribute("draggable", "false");
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
        game_ball.setAttribute("class", number_of_color != 0 ? "" : "immovable-ball");
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
            let card_pattern = doc.getElementById(`card-pattern-${built_index}`);
            card_pattern.classList.add("flip-card"); // add "flip-card" to card-pattern
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

function change_turn() {
    // read data (from model)
    game.changeTurn(); // to model
    // change interface and read data from model (from model to UI)
    setTimeout(function () {
        let next_player = game.playerIDTurn;
        let current_player_in_table = doc.getElementById("current-player");
        current_player_in_table.removeAttribute("id");
        let next_player_in_table = doc.querySelector(`#score-table thead tr th:nth-child(${next_player + 1})`);
        next_player_in_table.setAttribute("id", "current-player");
    }, 1000);
    
    // check alive player
    if (computer && (game.alivePlayerID !== game.playerIDTurn)) { // computer plays
        // disable balls
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "draggable",
            "false"
        );
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "class",
            "immovable-ball"
        );
        // computer`s move
        let move = calc_move(game.marblesOnField);
        dragged_elem = move["game-ball"];
        setTimeout(function () {
            place_marble(move["target"], false);
        }, 1000);
        setTimeout(function () {
            rotate(move["part-field"], move["direction"]);
        }, 2000); 
    }
}

function can_we_continue_round() {
    // check whether all balls are over
    let left_marbles = game.getLeftMarbles();
    if (left_marbles > 0) { // continue round
        change_turn();
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
        set_list_of_elems_attr(
            doc.querySelectorAll("#left-balls-table img"),
            "class",
            "immovable-ball"
        );
        // smooth disappearing cards and balls
        // 
        for (let ball of doc.querySelectorAll(".notch img")) {
            ball.classList.add("disappear-ball");
        }
        for (let card of doc.querySelectorAll("#cards .card")) {
            setInterval(function () {
                card.classList.add("spin-disappear-card");
            }, 1500);
        }
        // calculate result (from model)
        game.scoreTable.summarizeScore();
        let result_row = game.scoreTable.getResultRow();
        let winner_id = game.scoreTable.winnerPlayerID;
        
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
            send_alert(`Player P${winner_id} has won!!!`);
        }
        // update stats (to model)
        stats.updateStats(game.scoreTable);
        // update stats (to UI)
        doc.getElementById("number-of-games").innerHTML = stats.numberOfGames;
        doc.getElementById("cards-per-round").innerHTML = stats.cardsPerRound;
        doc.getElementById("cards-per-game").innerHTML = stats.cardsPerGame;
        doc.getElementById("number-of-wins").innerHTML = stats.numberWins;
        // write stats from UI to localStorage
        let data = read_data_from_app();
        write_data_to_localStorage("stats_data", data.stats_data);
        // clean all game field
        setTimeout(function () {
            clear_gamefield()
        }, 3000);
        // unlock settings in order to play again
        game.settings.isBlock = false; // settings is enabled
    }
    else { // it isn`t last round
        setTimeout(function () {
            run_round(); // run new round
        }, 1500);
        
    }
}

function run_round() {
    // clear game field on the screen 
    // clean out marbles and cards
    // restore amount of marbles
    // clear screen (UI)
    remove_elems(".card");
    remove_elems(".notch img");
    // run new round (model)
    game.runRound();
    let next_round = game.currentRound;
    // update (UI)
    let colors = ["yellow", "blue", "red"];
    for (let color of colors) {
        set_number_of_marbles(color, game.getNumberOfMarbles(color));
    }
    // enable balls
    set_list_of_elems_attr(
        doc.querySelectorAll("#left-balls-table img"),
        "draggable",
        "true"
    );
    set_list_of_elems_attr(
        doc.querySelectorAll("#left-balls-table img"),
        "class",
        ""
    );
    // update table
    let current_round_in_table = doc.getElementById("current-round");
    current_round_in_table.removeAttribute("id");
    let next_round_in_table = doc.querySelector(`#score-table tbody tr:nth-child(${next_round}) th:first-child`);
    next_round_in_table.setAttribute("id", "current-round");
    // gen cards
    gen_cards();
    // change turn of players
    change_turn();
}

function clear_gamefield() {
    // full clear to almost first condition
    // restore marbles (to model)
    game.restoreMarbles();
    // update marbles (to UI)    
    let colors = ["yellow", "blue", "red"];
    for (let color of colors) {
        set_number_of_marbles(color, game.getNumberOfMarbles(color));
    }
    // clear screen (to UI)
    remove_elems(".card");
    remove_elems(".notch img");
}

function calc_move() {
    // calc computer move
    // return {HTMLElement, HTMLElement, HTMLElement, string}
    // this is computer`s stategy
    // computer uses game.marblesOnField in order to calculate its next move
    let directions = ["cw", "ccw"];
    let direction = directions[Math.floor(Math.random() * 2)];
    let number_of_color = random_number(0, 3);
    while (game.getNumberOfMarbles(game.getColorOfNumber(number_of_color)) === 0) {
        number_of_color = random_number(0, 3);
    }
    let game_ball = doc.getElementById(game.getColorOfNumber(number_of_color) + "-gameball");
    let number_of_field = random_number(1, 5);
    let number_of_notch = random_number(1, 10);
    let target = doc.querySelector(`#field-part-${number_of_field} .n${number_of_notch}`);
    
    
    while (target.childNodes.length > 0) {
        number_of_field = random_number(1, 5);
        number_of_notch = random_number(1, 10);
        target = doc.querySelector(`#field-part-${number_of_field} .n${number_of_notch}`);
    }
    
    let part_field = doc.getElementById("field-part-" + random_number(1, 5));
    return {
        "game-ball": game_ball,
        "target": target,
        "part-field": part_field,
        "direction": direction
    };
}