// DONE: create class Stats

class Stats {
    private numberOfGames: number;
    private numberOfRounds: number;
    private numberOfCards: number;
    private cardsPerRound: number;
    private cardsPerGame: number;
    private numberWins: number;
    constructor (
        numberOfGames: number,
        numberOfRounds: number,
        numberOfCards: number,
        numberWins: number
    ) {
        this.numberOfGames = numberOfGames;
        this.numberOfRounds = numberOfRounds;
        this.numberOfCards = numberOfCards;
        this.cardsPerRound = numberOfCards / numberOfRounds;
        this.cardsPerGame = numberOfCards / numberOfGames;
        this.numberWins = numberWins;
    }
    updateStats(scoreTable: Score): void {
        let table = scoreTable.table;
        let rows = table.length; // number of rounds with result
        let alivePlayerID = scoreTable.alivePlayerID; // need minus 1, because we enumerate players from 1
        this.numberOfGames++;
        this.numberOfRounds += (rows - 1);
        this.numberOfCards += (table[rows - 1][alivePlayerID - 1] - 1);
        this.cardsPerRound = this.numberOfCards / this.numberOfRounds;
        this.cardsPerGame = this.numberOfCards / this.numberOfGames;
        this.numberWins += (scoreTable.alivePlayerID == scoreTable.winnerPlayerID ? 1 : 0);
    }
}