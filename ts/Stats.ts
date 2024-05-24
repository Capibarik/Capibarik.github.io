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
        this.numberOfCards += (table[rows - 1][alivePlayerID - 1]);
        this._cardsPerRound = Stats.roundToFixed(this.numberOfCards / this.numberOfRounds, 2);
        this._cardsPerGame = Stats.roundToFixed(this.numberOfCards / this._numberOfGames, 2);
        this._numberWins += (scoreTable.alivePlayerID == scoreTable.winnerPlayerID ? 1 : 0);
    }
    private static roundToFixed(num: number, fixed: number): number {
        let ans = Math.round(num * Math.pow(10, fixed)) / Math.pow(10, fixed);
        return ans;
    }
}