// TODO: finsish creating class Player

class Player {
    private _playerID: number;
    private _isAlive: boolean;
    private _isMyTurn: boolean;
    constructor (
        playerID: number,
        isAlive: boolean,
        isMyTurn: boolean
    ) {
        this._playerID = playerID;
        this._isAlive = isAlive;
        this._isMyTurn = isMyTurn;
    }
    get playerID(): number {
        return this._playerID;
    }
    get isAlive(): boolean {
        return this._isAlive;
    }
    get isMyTurn(): boolean {
        return this._isMyTurn;
    }
    set isAlive(isAlive) {
        this._isAlive = isAlive;
    }
    set isMyTurn(isMyTurn) {
        this._isMyTurn = isMyTurn;
    }
}