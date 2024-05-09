// TODO: create class Stats

class Stats {
    private alivePlayerID: number;
    private numberOfGames: number;
    private cardsPerRound: number;
    private cardsPerGame: number;
    private numberWins: number;
    constructor (
        alivePlayerID: number,
        numberOfGames: number,
        cardsPerRound: number,
        cardsePerGame: number,
        numberWins: number
    ) {
        this.alivePlayerID = alivePlayerID;
        this.numberOfGames = numberOfGames;
        this.cardsPerRound = cardsPerRound;
        this.cardsPerGame = cardsePerGame;
        this.numberWins = numberWins;
    }
}