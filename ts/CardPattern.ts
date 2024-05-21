// TODO: write method equals for two card patterns

class CardPattern {
    private _pattern: CardMarble[];
    private _isBuilt: boolean;
    constructor();
    constructor(pattern: CardMarble[]);
    constructor(pattern?: CardMarble[])  {
        this._isBuilt = false; // when a card is born, it isn`t built 
        this._pattern = [];
        for (let i = 0; i < 5; i++) { // generate card`s pattern
            this._pattern.push(new CardMarble(
                Math.floor(Math.random() * (2 + 1 - 0) + 0) 
            ));
        }
        this._pattern = pattern ?? this._pattern;
    }
    get isBuilt(): boolean {
        return this._isBuilt;
    }
    get pattern(): CardMarble[] {
        return this._pattern;
    }
    itIsbuilt(): void {
        this._isBuilt = true; // card is built
    }
    blockCard(): void {
        this._isBuilt = true; // a card has become blocked
    }
    getReversePattern(): CardMarble[] {
        let reverse_pattern: CardMarble[] = [];
        for (let i = this._pattern.length - 1; i >= 0; i--) {
            reverse_pattern.push(this._pattern[i]);
        } 
        return reverse_pattern;
    }
    equals(other: (CardPattern | null)): boolean {
        if (other == this) return true;
        if (other == null) return false;
        for (let i = 0; i < other.pattern.length; i++) {
            if (this.pattern[i].color !== other.pattern[i].color) return false;
        }
        return true;
    }
}