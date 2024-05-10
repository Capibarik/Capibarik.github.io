// DONE: create class Settings

class Settings {
    private _isBlock: boolean;
    private _numberOfPlayers: number;
    private _numberOfRounds: number;
    private _numberOfCardsInRound: number;
    private _theme: number;
    constructor(
        numberOfPlayers: number,
        numberOfRounds: number,
        theme: number,
    ) {
        this._isBlock = false; // false - we can`t change settings except theme, game hasn`t started yet
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfPlayers - 1;
        this._theme = theme;
    }
    get isBlock(): boolean {
        return this._isBlock;
    }
    get numberOfPlayers(): number {
        return this._numberOfPlayers;
    }
    get numberOfRounds(): number {
        return this._numberOfRounds;
    }
    get numberOfCardsInRounds(): number {
        return this._numberOfCardsInRound;
    }
    get theme(): number {
        return this._theme;
    }
    set isBlock(isBlock: boolean) {
        this._isBlock = isBlock;
    }
    set numberOfPlayers(number: number) {
        if (!this.isBlock) {
            this._numberOfPlayers = number;
        }
    }
    set numberOfRounds(number: number) {
        if (!this.isBlock) {
            this._numberOfPlayers = number;
        }
    }
    set numberOfCardsInRound(number: number) {
        if (!this.isBlock) {
            this._numberOfCardsInRound = number;
        }
    }
    set theme(theme: number) {
        this._theme = theme;
    }
    updateSettings(
        numberOfPlayers: number,
        numberOfRounds: number,
        numberOfCardsInRound: number,
        theme: number
    ): void {
        this._numberOfPlayers = numberOfPlayers;
        this._numberOfRounds = numberOfRounds;
        this._numberOfCardsInRound = numberOfCardsInRound;
        this._theme = theme;
    }
}