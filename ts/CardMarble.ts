class CardMarble {
    private _color: number;
    constructor(color: number) {
        this._color = color;
    }
    get color(): number {
        return this._color;
    }
}