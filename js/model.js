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
    constructor(settings, stats) {
        this._settings = settings;
        this.currentRound = 1;
        this.numberOfLeftMarbles = 30;
        this.numberOfMarbleOnField = 0;
        this.numberOfPlayers = settings.numberOfPlayers;
        this.numberOfRounds = settings.numberOfRounds;
        this.numberOfCardsInRounds = settings.numberOfCardsInRounds;
        this.alivePlayerID = Math.ceil(Math.random() * (this.numberOfPlayers - 1) + 1);
        this.playerIDTurn = this.alivePlayerID;
        this.players = [];
        for (let i = 1; i <= this.numberOfPlayers; i++) {
            this.players.push(new Player(i, (i == this.alivePlayerID ? true : false), (i == this.playerIDTurn ? true : false)));
        }
        this.stats = stats;
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
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
    get settings() {
        return this._settings;
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
    constructor(numberOfRounds, numberOfPlayers, alivePlayerID) {
        this._winnerPlayerID = -1;
        this._alivePlayerID = alivePlayerID;
        this._table = [];
        for (let i = 0; i < numberOfRounds + 1; i++) {
            let line = [];
            for (let j = 0; j < numberOfPlayers; j++) {
                line.push(0);
            }
            this._table.push(line);
        }
    }
    get winnerPlayerID() {
        return this._winnerPlayerID;
    }
    get table() {
        return this._table;
    }
    get alivePlayerID() {
        return this._alivePlayerID;
    }
    set table(table) {
        this._table = table;
    }
    addPointToPlayer(round, playerID) {
        this._table[round][playerID]++;
    }
    summarizeScore() {
        let rows = this._table.length;
        let columns = this._table[0].length;
        for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows - 1; i++) {
                this._table[rows - 1][j] += this._table[i][j];
            }
        }
    }
    whoIsWinner() {
        let rows = this._table.length;
        let columns = this._table[0].length;
        let amount_cards = 0;
        for (let j = 0; j < columns; j++) {
            if (amount_cards <= this._table[rows - 1][j]) {
                if (amount_cards == this._table[rows - 1][j]) {
                    this._winnerPlayerID = 0;
                }
                else {
                    amount_cards = this._table[rows - 1][j];
                    this._winnerPlayerID = j + 1;
                }
            }
        }
    }
}
class Settings {
    constructor(numberOfPlayers, numberOfRounds, theme) {
        this._isBlock = false;
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfPlayers - 1;
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
    updateSettings(numberOfPlayers, numberOfRounds, numberOfCardsInRound, theme) {
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfCardsInRound;
        this._theme = theme;
    }
}
class Stats {
    constructor(numberOfGames, numberOfRounds, numberOfCards, numberWins) {
        this.numberOfGames = numberOfGames;
        this.numberOfRounds = numberOfRounds;
        this.numberOfCards = numberOfCards;
        this.cardsPerRound = numberOfCards / numberOfRounds;
        this.cardsPerGame = numberOfCards / numberOfGames;
        this.numberWins = numberWins;
    }
    updateStats(scoreTable) {
        let table = scoreTable.table;
        let rows = table.length;
        let alivePlayerID = scoreTable.alivePlayerID;
        this.numberOfGames++;
        this.numberOfRounds += (rows - 1);
        this.numberOfCards += (table[rows - 1][alivePlayerID - 1] - 1);
        this.cardsPerRound = this.numberOfCards / this.numberOfRounds;
        this.cardsPerGame = this.numberOfCards / this.numberOfGames;
        this.numberWins += (scoreTable.alivePlayerID == scoreTable.winnerPlayerID ? 1 : 0);
    }
}
let settings = new Settings(3, 3, 1);
let stats = new Stats(4, 20, 23, 3);
let game = new GameField(settings, stats);

export default game;