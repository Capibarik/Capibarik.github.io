"use strict";
class CardMarble {
    constructor(color) {
        this.color = color;
    }
}
class CardPattern {
    constructor() {
        this.isBuilt = false;
        this.pattern = [];
        for (let i = 0; i < 5; i++) {
            this.pattern.push(new CardMarble(Math.ceil(Math.random() * (2 - 0) + 0)));
        }
    }
    blockCard() {
        this.isBuilt = true;
    }
}
class GameField {
    constructor(settings) {
        this.settings = settings;
        this.currentRound = 1;
        this.numberOfLeftMarbles = 30;
        this.numberOfMarbleOnField = 0;
        this.numberOfPlayers = settings.numberOfPlayers;
        this.numberOfRounds = settings.numberOfRounds;
        this.numberOfCardsInRounds = settings.numberOfCardsInRounds;
        this.alivePlayerID = Math.ceil(Math.random() * (this.numberOfPlayers - 1) + 1);
        this.playerTurn = this.alivePlayerID;
        this.players = [];
        for (let i = 1; i <= this.numberOfPlayers; i++) {
            this.players.push(new Player(i, (i == this.alivePlayerID ? true : false), (i == this.playerTurn ? true : false)));
        }
        this.stats = new Stats(this.alivePlayerID, 0, 0, 0, 0);
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers);
        this.marblesOnField = [];
        for (let i = 0; i < 6; i++) {
            let line = [];
            for (let j = 0; j < 6; j++) {
                line.push(null);
            }
            this.marblesOnField.push(line);
        }
        this.deckOfPatterns = [];
        for (let i = 0; i < this.numberOfCardsInRounds; i++) {
            this.deckOfPatterns.push(new CardPattern());
        }
    }
    get scoreTable() {
        return this._scoreTable;
    }
}
class GameMarble {
    constructor(color) {
        this.color = color;
    }
}
class Player {
    constructor(playerID, isAlive, isMyTurn) {
        this._playerID = playerID;
        this._isAlive = isAlive;
        this._isMyTurn = isMyTurn;
    }
    get playerID() {
        return this._playerID;
    }
    get isAlive() {
        return this._isAlive;
    }
    get isMyTurn() {
        return this._isMyTurn;
    }
    set isAlive(isAlive) {
        this._isAlive = isAlive;
    }
    set isMyTurn(isMyTurn) {
        this._isMyTurn = isMyTurn;
    }
}
class Score {
    constructor(numberOfRounds, numberOfPlayers) {
        this.table = [];
        for (let i = 0; i < numberOfRounds + 1; i++) {
            let line = [];
            for (let j = 0; j < numberOfPlayers; j++) {
                line.push(0);
            }
            this.table.push(line);
        }
    }
    addPointToPlayer(round, playerID) {
        this.table[round][playerID]++;
    }
    summarizeScore() {
        let rows = this.table.length;
        let columns = this.table[0].length;
        console.log("Rounds:", rows, "\n", "Players:", columns);
        console.log(this.table);
    }
}
class Settings {
    constructor(numberOfPlayers, numberOfRounds, numberOfCardsInRound, theme) {
        this._isBlock = false;
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfCardsInRound;
        this._theme = theme;
    }
    get isBlock() {
        return this._isBlock;
    }
    get numberOfPlayers() {
        return this._numberOfPlayers;
    }
    get numberOfRounds() {
        return this._numberOfRounds;
    }
    get numberOfCardsInRounds() {
        return this._numberOfCardsInRound;
    }
    get theme() {
        return this._theme;
    }
    set isBlock(isBlock) {
        this._isBlock = isBlock;
    }
    set numberOfPlayers(number) {
        if (!this.isBlock) {
            this._numberOfPlayers = number;
        }
    }
    set numberOfRounds(number) {
        if (!this.isBlock) {
            this._numberOfPlayers = number;
        }
    }
    set numberOfCardsInRound(number) {
        if (!this.isBlock) {
            this._numberOfCardsInRound = number;
        }
    }
    set theme(theme) {
        this._theme = theme;
    }
}
class Stats {
    constructor(alivePlayerID, numberOfGames, cardsPerRound, cardsePerGame, numberWins) {
        this.alivePlayerID = alivePlayerID;
        this.numberOfGames = numberOfGames;
        this.cardsPerRound = cardsPerRound;
        this.cardsPerGame = cardsePerGame;
        this.numberWins = numberWins;
    }
}
let settings = new Settings(3, 3, 2, 1);
let game = new GameField(settings);
console.log(game.scoreTable.summarizeScore());
