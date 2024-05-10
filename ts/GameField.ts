// TODO: CREATE ONLY LOGIC, WITHOUT GRAPHIC
// DONE: create GameField, impelement constructor of class


class GameField {
    private _settings: Settings;
    private currentRound: number;
    private numberOfLeftMarbles: number;
    private numberOfMarbleOnField: number;
    private numberOfPlayers: number;
    private numberOfRounds: number;
    private numberOfCardsInRounds: number;
    private alivePlayerID: number;
    private players: Player[];
    private playerIDTurn: number;
    private stats: Stats;
    private _scoreTable: Score;
    private deckOfPatterns: CardPattern[];
    private marblesOnField: (null | CardMarble)[][];

    constructor (settings: Settings, stats: Stats) {
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
            this.players.push(
                new Player(
                    i,
                    (i == this.alivePlayerID ? true : false),
                    (i == this.playerIDTurn ? true : false))
            );
        }
        this.stats = stats;
        this._scoreTable = new Score(this.numberOfRounds, this.numberOfPlayers, this.alivePlayerID);
        this.marblesOnField = [];
        for (let i = 0; i < 6; i++) {
            let line: (null | CardMarble)[] = []; // null - recess is free, CardMarble(color: number) - recess is occupied
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
    get settings(): Settings {
        return this._settings;
    }
    get scoreTable(): Score {
        return this._scoreTable;
    }
}