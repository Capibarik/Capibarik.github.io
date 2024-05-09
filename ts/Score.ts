// TODO: create class Score

class Score {
    private table: number[][];
    constructor (numberOfRounds: number, numberOfPlayers: number) {
        this.table = [];
        for (let i = 0; i < numberOfRounds + 1; i++) { // + 1 - results
            let line: number[] = [];
            for (let j = 0; j < numberOfPlayers; j++) {
                line.push(0);
            }
            this.table.push(line);
        }
    }
    addPointToPlayer(round: number, playerID: number) {
        this.table[round][playerID]++;
    }
    summarizeScore() {
        let rows = this.table.length;
        let columns = this.table[0].length;
        console.log("Rounds:", rows, "\n", "Players:", columns);
        console.log(this.table);
    }
}