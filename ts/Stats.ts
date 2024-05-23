// DONE: create class Stats

class Stats {
    private _numberOfGames: number;
    private numberOfRounds: number;
    private numberOfCards: number;
    private _cardsPerRound: number;
    private _cardsPerGame: number;
    private _numberWins: number;
    constructor (
        numberOfGames: number,
        numberOfRounds: number,
        numberOfCards: number,
        numberWins: number
    ) {
        this._numberOfGames = numberOfGames;
        this.numberOfRounds = numberOfRounds;
        this.numberOfCards = numberOfCards;
        this._cardsPerRound = numberOfCards / numberOfRounds;
        this._cardsPerGame = numberOfCards / numberOfGames;
        this._numberWins = numberWins;
    }
    get numberOfGames(): number {
        return this._numberOfGames;
    }
    get cardsPerRound(): number {
        return this._cardsPerRound;
    }
    get cardsPerGame(): number {
        return this._cardsPerGame;
    }
    get numberWins(): number {
        return this._numberWins;
    }
    updateStats(scoreTable: Score): void {
        let table = scoreTable.table;
        let rows = table.length; // number of rounds with result
        let alivePlayerID = scoreTable.alivePlayerID; // after need minus 1, because we enumerate players from 1
        this._numberOfGames++;
        this.numberOfRounds += (rows - 1);
        this.numberOfCards += (table[rows - 1][alivePlayerID - 1] - 1);
        this._cardsPerRound = this.numberOfCards / this.numberOfRounds;
        this._cardsPerGame = this.numberOfCards / this._numberOfGames;
        this._numberWins += (scoreTable.alivePlayerID == scoreTable.winnerPlayerID ? 1 : 0);
    }
}