"use strict";
class CardMarble {
    constructor(color) {
        this._color = color;
    }
    get color() {
        return this._color;
    }
}
class CardPattern {
    constructor(pattern) {
        this._isBuilt = false;
        this._pattern = [];
        for (let i = 0; i < 5; i++) {
            this._pattern.push(new CardMarble(Math.floor(Math.random() * (2 + 1 - 0) + 0)));
        }
        this._pattern = pattern !== null && pattern !== void 0 ? pattern : this._pattern;
    }
    get isBuilt() {
        return this._isBuilt;
    }
    get pattern() {
        return this._pattern;
    }
    itIsbuilt() {
        this._isBuilt = true;
    }
    blockCard() {
        this._isBuilt = true;
    }
    getReversePattern() {
        let reverse_pattern = [];
        for (let i = this._pattern.length - 1; i >= 0; i--) {
            reverse_pattern.push(this._pattern[i]);
        }
        return reverse_pattern;
    }
    equals(other) {
        if (other == this)
            return true;
        if (other == null)
            return false;
        for (let i = 0; i < other.pattern.length; i++) {
            if (this.pattern[i].color !== other.pattern[i].color)
                return false;
        }
        return true;
    }
}
class GameField {
    constructor(settings, stats) {
        this._NUMBER_COLOR = {
            0: "yellow",
            1: "red",
            2: "blue",
        };
        this._COLOR_NUMBER = {
            "yellow": 0,
            "red": 1,
            "blue": 2
        };
        this._settings = settings;
        this._currentRound = 1;
        this._numberOfMarbles = {
            "yellow": 9,
            "blue": 9,
            "red": 9
        };
        this.numberOfPlayers = settings.numberOfPlayers;
        this.numberOfRounds = settings.numberOfRounds;
        this.numberOfCardsInRounds = settings.numberOfCardsInRound;
        this.alivePlayerID = Math.ceil(Math.random() * (this.numberOfPlayers - 1) + 1);
        this._playerIDTurn = this.alivePlayerID;
        this.players = [];
        for (let i = 1; i <= this.numberOfPlayers; i++) {
            this.players.push(new Player(i, (i == this.alivePlayerID ? true : false), (i == this._playerIDTurn ? true : false)));
        }
        this._stats = stats;
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
        this._marblesOnField = [];
        for (let i = 0; i < 4; i++) {
            let part_field = [];
            for (let j = 0; j < 3; j++) {
                let line = [];
                for (let k = 0; k < 3; k++) {
                    line.push(null);
                }
                part_field.push(line);
            }
            this._marblesOnField.push(part_field);
        }
        this._deckOfPatterns = [];
        for (let i = 0; i < this.numberOfCardsInRounds; i++) {
            this._deckOfPatterns.push(new CardPattern());
        }
    }
    getColorOfNumber(num) {
        return this._NUMBER_COLOR[num];
    }
    getNumberOfColor(color) {
        return this._COLOR_NUMBER[color];
    }
    getNumberOfMarbles(color) {
        return this._numberOfMarbles[color];
    }
    getLeftMarbles() {
        return this.getNumberOfMarbles("yellow") + this.getNumberOfMarbles("blue") + this.getNumberOfMarbles("red");
    }
    restoreMarbles() {
        this._numberOfMarbles["yellow"] = 9;
        this._numberOfMarbles["blue"] = 9;
        this._numberOfMarbles["red"] = 9;
    }
    getLeftCardPatterns() {
        let cnt = 0;
        for (let cardPattern of this.deckOfPatterns) {
            if (!cardPattern.isBuilt)
                cnt++;
        }
        return cnt;
    }
    get settings() {
        return this._settings;
    }
    get scoreTable() {
        return this._scoreTable;
    }
    get deckOfPatterns() {
        return this._deckOfPatterns;
    }
    get marblesOnField() {
        return this._marblesOnField;
    }
    get currentRound() {
        return this._currentRound;
    }
    get playerIDTurn() {
        return this._playerIDTurn;
    }
    get stats() {
        return this._stats;
    }
    runGame() {
        this._currentRound = 1;
        this._numberOfMarbles = {
            "yellow": 9,
            "blue": 9,
            "red": 9
        };
        this.numberOfPlayers = settings.numberOfPlayers;
        this.numberOfRounds = settings.numberOfRounds;
        this.numberOfCardsInRounds = settings.numberOfCardsInRound;
        this.alivePlayerID = Math.ceil(Math.random() * (this.numberOfPlayers - 1) + 1);
        this._playerIDTurn = this.alivePlayerID;
        this.players = [];
        for (let i = 1; i <= this.numberOfPlayers; i++) {
            this.players.push(new Player(i, (i == this.alivePlayerID ? true : false), (i == this._playerIDTurn ? true : false)));
        }
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
        this.clearField();
        this.genCards();
    }
    runRound() {
        this._numberOfMarbles = {
            "yellow": 9,
            "blue": 9,
            "red": 9
        };
        this._currentRound++;
        this.clearField();
        this.genCards();
    }
    placeMarble(index_field, index_row, index, color) {
        this._marblesOnField[index_field][index_row][index] = new GameMarble(this.getNumberOfColor(color));
        this._numberOfMarbles[color]--;
    }
    rotate(index_field, direction) {
        let part_field = this._marblesOnField[index_field];
        let new_part_field = [];
        for (let i = 0; i < 3; i++) {
            let line = [];
            for (let j = 0; j < 3; j++) {
                line.push(null);
            }
            new_part_field.push(line);
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (direction === "cw") {
                    new_part_field[i][j] = part_field[3 - j - 1][i];
                }
                else {
                    new_part_field[i][j] = part_field[j][3 - i - 1];
                }
            }
        }
        this._marblesOnField[index_field] = new_part_field;
    }
    toGeneralField() {
        let general_field = [];
        for (let i = 0; i < 3; i++) {
            let line = [];
            for (let j = 0; j < 6; j++) {
                line.push(this._marblesOnField[Math.floor(j / 3)][i][j % 3]);
            }
            general_field.push(line);
        }
        for (let i = 0; i < 3; i++) {
            let line = [];
            for (let j = 0; j < 6; j++) {
                line.push(this._marblesOnField[((j <= 2) ? 3 : 2)][i][j % 3]);
            }
            general_field.push(line);
        }
        return general_field;
    }
    checkCombs() {
        let gf = this.toGeneralField();
        let builtCardsIndexes = [];
        for (let index = 0; index < this._deckOfPatterns.length; index++) {
            let card_pattern = this._deckOfPatterns[index];
            if (!card_pattern.isBuilt) {
                let reverse_card_pattern = new CardPattern(card_pattern.getReversePattern());
                for (let i = 0; i < 6; i++) {
                    let patterns = [[], [], [], []];
                    for (let j = 0; j < 5; j++) {
                        if (gf[i][j] !== null && patterns[0] !== null)
                            patterns[0].push(new CardMarble(gf[i][j].color));
                        else
                            patterns[0] = null;
                        if (gf[j][i] !== null && patterns[1] !== null)
                            patterns[1].push(new CardMarble(gf[j][i].color));
                        else
                            patterns[1] = null;
                        if (gf[i][j + 1] !== null && patterns[2] !== null)
                            patterns[2].push(new CardMarble(gf[i][j + 1].color));
                        else
                            patterns[2] = null;
                        if (gf[j + 1][i] !== null && patterns[3] !== null)
                            patterns[3].push(new CardMarble(gf[j + 1][i].color));
                        else
                            patterns[3] = null;
                    }
                    let card_patterns = [null, null, null, null];
                    for (let k = 0; k < 4; k++) {
                        if (patterns[k] !== null)
                            card_patterns[k] = new CardPattern(patterns[k]);
                        if (card_pattern.equals(card_patterns[k]) || reverse_card_pattern.equals(card_patterns[k])) {
                            card_pattern.itIsbuilt();
                            builtCardsIndexes.push(index);
                        }
                    }
                }
            }
        }
        return builtCardsIndexes;
    }
    changeTurn() {
        this._playerIDTurn = (this._playerIDTurn + 1) % (this.players.length + 1);
        if (this._playerIDTurn == 0)
            this._playerIDTurn = 1;
    }
    clearField() {
        this._marblesOnField = [];
        for (let i = 0; i < 4; i++) {
            let part_field = [];
            for (let j = 0; j < 3; j++) {
                let line = [];
                for (let k = 0; k < 3; k++) {
                    line.push(null);
                }
                part_field.push(line);
            }
            this._marblesOnField.push(part_field);
        }
    }
    genCards() {
        this._deckOfPatterns = [];
        for (let i = 0; i < this.numberOfCardsInRounds; i++) {
            this.deckOfPatterns.push(new CardPattern());
        }
    }
}
class GameMarble {
    constructor(color) {
        this._color = color;
    }
    get color() {
        return this._color;
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
    getResultRow() {
        let result = [];
        for (let i = 0; i < this._table.length; i++) {
            result.push(this._table[this._table.length - 1][i]);
        }
        return result;
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
        this.whoIsWinner();
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
    get numberOfCardsInRound() {
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
    updateSettings(numberOfPlayers, numberOfRounds, theme) {
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfPlayers - 1;
        this._theme = theme;
    }
}
class Stats {
    constructor(numberOfGames, numberOfRounds, numberOfCards, numberWins) {
        this._numberOfGames = numberOfGames;
        this.numberOfRounds = numberOfRounds;
        this.numberOfCards = numberOfCards;
        this._cardsPerRound = numberOfCards / numberOfRounds;
        this._cardsPerGame = numberOfCards / numberOfGames;
        this._numberWins = numberWins;
    }
    get numberOfGames() {
        return this._numberOfGames;
    }
    get cardsPerRound() {
        return this._cardsPerRound;
    }
    get cardsPerGame() {
        return this._cardsPerGame;
    }
    get numberWins() {
        return this._numberWins;
    }
    updateStats(scoreTable) {
        let table = scoreTable.table;
        let rows = table.length;
        let alivePlayerID = scoreTable.alivePlayerID;
        this._numberOfGames++;
        this.numberOfRounds += (rows - 1);
        this.numberOfCards += (table[rows - 1][alivePlayerID - 1]);
        this._cardsPerRound = this.numberOfCards / this.numberOfRounds;
        this._cardsPerGame = this.numberOfCards / this._numberOfGames;
        this._numberWins += (scoreTable.alivePlayerID == scoreTable.winnerPlayerID ? 1 : 0);
    }
}
let settings = new Settings(3, 3, "light");
let stats = new Stats(0, 0, 0, 0);
let game = new GameField(settings, stats);

export default game;