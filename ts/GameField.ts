// FIXME: 'get marblesOnField()' is used only for test
// FIXME: code repeats four times in checkCombs
// TODO: implement method that will check combinations, you should check combinations after there are 5 balls and more on the field
// DONE: create GameField, impelement constructor of class


class GameField {
    private _NUMBER_COLOR: Record<number, string> = {
        0: "yellow",
        1: "red",
        2: "blue",
    };
    private _COLOR_NUMBER: Record<string, number> = {
        "yellow": 0,
        "red": 1,
        "blue": 2
    }
    private _settings: Settings;
    private _currentRound: number;
    private _numberOfMarbles: Record<string, number>;
    private numberOfPlayers: number;
    private numberOfRounds: number;
    private numberOfCardsInRounds: number;
    private alivePlayerID: number;
    private players: Player[];
    private _playerIDTurn: number;
    private _stats: Stats;
    private _scoreTable: Score;
    private _deckOfPatterns: CardPattern[];
    private _marblesOnField: (null | GameMarble)[][][];

    constructor (settings: Settings, stats: Stats) {
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
            this.players.push(
                new Player(
                    i,
                    (i == this.alivePlayerID ? true : false),
                    (i == this._playerIDTurn ? true : false))
            );
        }
        this._stats = stats;
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
        this._marblesOnField = [];
        for (let i = 0; i < 4; i++) {
            let part_field: (null | GameMarble)[][] = [];
            for (let j = 0; j < 3; j++) {
                let line: (null | GameMarble)[] = []; // null - recess is free, CardMarble(color: number) - recess is occupied
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
    getColorOfNumber(num: number): string {
        return this._NUMBER_COLOR[num];
    }
    getNumberOfColor(color: string): number {
        return this._COLOR_NUMBER[color];
    }
    getNumberOfMarbles(color: string): number {
        return this._numberOfMarbles[color];
    }
    getLeftMarbles(): number {
        // are there all marbles on the field?
        // 0 - true
        // > 0 - false
        return this.getNumberOfMarbles("yellow") + this.getNumberOfMarbles("blue") + this.getNumberOfMarbles("red");
    }
    restoreMarbles(): void {
        this._numberOfMarbles["yellow"] = 9;
        this._numberOfMarbles["blue"] = 9;
        this._numberOfMarbles["red"] = 9;
    }
    getLeftCardPatterns(): number {
        // 0 - all cards are built
        // > 0 - not all cards are built
        let cnt = 0;
        for (let cardPattern of this.deckOfPatterns) {
            if (!cardPattern.isBuilt) cnt++;
        }
        return cnt;
    }
    get settings(): Settings {
        return this._settings;
    }
    get scoreTable(): Score {
        return this._scoreTable;
    }
    get deckOfPatterns(): CardPattern[] {
        return this._deckOfPatterns;
    }
    get marblesOnField(): (null | GameMarble)[][][] {
        return this._marblesOnField;
    }
    get currentRound(): number {
        return this._currentRound;
    }
    get playerIDTurn(): number {
        return this._playerIDTurn;
    }
    get stats(): Stats {
        return this._stats; 
    }
    runGame(): void {
        // run game and apply settings
        // game field always updates after game
        // imagine that a game goes again
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
            this.players.push(
                new Player(
                    i,
                    (i == this.alivePlayerID ? true : false),
                    (i == this._playerIDTurn ? true : false))
            );
        }
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
        this.clearField();
        this.genCards();
    }
    runRound(): void {
        this._numberOfMarbles = {
            "yellow": 9,
            "blue": 9,
            "red": 9
        };
        this._currentRound++;
        this.clearField();
        this.genCards();
    }
    placeMarble(index_field: number, index_row: number, index: number, color: string): void {
        // player uses this method to place marble on the field
        this._marblesOnField[index_field][index_row][index] = new GameMarble(this.getNumberOfColor(color));
        this._numberOfMarbles[color]--;
    }
    rotate(index_field: number, direction: string): void {
        // rotate part of field
        let part_field = this._marblesOnField[index_field];
        let new_part_field: (GameMarble | null)[][] = [];
        for (let i = 0; i < 3; i++) {
            let line: (GameMarble | null)[] = [];
            for (let j = 0; j < 3; j++) {
                line.push(null);
            }
            new_part_field.push(line);
        }
        // console.log(part_field);
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
        // console.log(new_part_field);
        this._marblesOnField[index_field] = new_part_field;
    }
    private toGeneralField(): (GameMarble | null)[][] {
        /*
        From parts ([][][]):
        [
            [first_part] [second_part][third_part] [fourth_part]
        ]
        To general field ([][])
        [
            first_part   second_part
            fourth_part  third_part
        ]
        */
        let general_field: (GameMarble | null)[][] = [];
        for (let i = 0; i < 3; i++) {
            let line: (GameMarble | null)[] = [];
            for (let j = 0; j < 6; j++) {
                line.push(this._marblesOnField[Math.floor(j / 3)][i][j % 3]);
            }
            general_field.push(line);
        }
        for (let i = 0; i < 3; i++) {
            let line: (GameMarble | null)[] = [];
            for (let j = 0; j < 6; j++) {
                line.push(this._marblesOnField[((j <= 2) ? 3 : 2)][i][j % 3]);
            }
            general_field.push(line);
        }
        // console.log(general_field); // DELETE
        return general_field;
    }
    checkCombs(): number[] {
        // check combinations of marbles on the field
        // console.log(this._deckOfPatterns);
        let gf = this.toGeneralField();
        let builtCardsIndexes: number[] = [];
        for (let index = 0; index < this._deckOfPatterns.length; index++) {
            let card_pattern: CardPattern = this._deckOfPatterns[index];
            if (!card_pattern.isBuilt) { // if card hasn`t built yet
                let reverse_card_pattern: CardPattern = new CardPattern(card_pattern.getReversePattern());
                for (let i = 0; i < 6; i++) {
                    let patterns: (CardMarble[] | null)[] = [[], [], [], []];
                    for (let j = 0; j < 5; j++) {
                        // horizontal
                        if (gf[i][j] !== null && patterns[0] !== null) patterns[0].push(new CardMarble(gf[i][j].color));
                        else patterns[0] = null;
                        // vertical
                        if (gf[j][i] !== null && patterns[1] !== null) patterns[1].push(new CardMarble(gf[j][i].color));
                        else patterns[1] = null;
                        // horizontal
                        if (gf[i][j + 1] !== null && patterns[2] !== null) patterns[2].push(new CardMarble(gf[i][j + 1].color));
                        else patterns[2] = null;
                        // vertical
                        if (gf[j + 1][i] !== null && patterns[3] !== null) patterns[3].push(new CardMarble(gf[j + 1][i].color));
                        else patterns[3] = null;
                    }
                    let card_patterns: (CardPattern | null)[] = [null, null, null, null];
                    for (let k = 0; k < 4; k++) {
                        if (patterns[k] !== null) card_patterns[k] = new CardPattern(patterns[k]);
                        if (card_pattern.equals(card_patterns[k]) || reverse_card_pattern.equals(card_patterns[k])) {
                            card_pattern.itIsbuilt();
                            builtCardsIndexes.push(index);
                        }
                    }
                }   
                // console.log("====================================");
                // console.log(card_pattern.pattern, card_pattern.isBuilt);
            }
        }
        return builtCardsIndexes;
    }
    changeTurn(): void {
        // change player turn
        this._playerIDTurn = (this._playerIDTurn + 1) % (this.players.length + 1);
        if (this._playerIDTurn == 0) this._playerIDTurn = 1;
    }
    clearField(): void {
        this._marblesOnField = [];
        for (let i = 0; i < 4; i++) {
            let part_field: (null | GameMarble)[][] = [];
            for (let j = 0; j < 3; j++) {
                let line: (null | GameMarble)[] = []; // null - recess is free, CardMarble(color: number) - recess is occupied
                for (let k = 0; k < 3; k++) {
                    line.push(null);
                }
                part_field.push(line);
            }
            this._marblesOnField.push(part_field);
        }
    }
    genCards(): void {
        this._deckOfPatterns = [];
        for (let i = 0; i < this.numberOfCardsInRounds; i++) {
            this.deckOfPatterns.push(new CardPattern());
        }
    }
}