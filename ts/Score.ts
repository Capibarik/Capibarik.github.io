// FIXME: delete 'set table()', use only for tests

class Score {
    private _winnerPlayerID: number; // 0 - draw, -1 - no one at the beginning of the game is winner
    private _alivePlayerID: number;
    private _table: number[][];
    constructor (numberOfRounds: number, numberOfPlayers: number, alivePlayerID: number) {
        this._winnerPlayerID = -1;
        this._alivePlayerID = alivePlayerID;
        this._table = [];
        for (let i = 0; i < numberOfRounds + 1; i++) { // + 1 - results
            let line: number[] = [];
            for (let j = 0; j < numberOfPlayers; j++) {
                line.push(0); 
            }
            this._table.push(line);
        }
    }
    get winnerPlayerID(): number {
        return this._winnerPlayerID;
    }
    get table(): number[][] {
        return this._table;
    }
    get alivePlayerID(): number {
        return this._alivePlayerID;
    }
    getResultRow(): number[] {
        let result = [];
        for (let i = 0; i < this._table[0].length; i++) {
            result.push(this._table[this._table.length - 1][i]);
        }
        return result;
    }
    set table(table: number[][]) {
        this._table = table;
    } 
    addPointToPlayer(round: number, playerID: number): void {
        this._table[round][playerID]++;
    }
    summarizeScore(): void {
        let rows = this._table.length; // number of rounds with result
        let columns = this._table[0].length; // number of players
        for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows - 1; i++) {
                this._table[rows - 1][j] += this._table[i][j]; 
            }
        }
        this.whoIsWinner();
    }
    private whoIsWinner(): void {
        let rows = this._table.length; // number of rounds with result
        let columns = this._table[0].length; // number of players
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