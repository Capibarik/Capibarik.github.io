class CardPattern {
    private _pattern: CardMarble[];
    private isBuilt: boolean;
    constructor()  {
        this.isBuilt = false; // when a card is born, it won`t be built 
        this._pattern = [];
        for (let i = 0; i < 5; i++) { // generate card`s pattern
            this._pattern.push(new CardMarble(
                Math.floor(Math.random() * (2 + 1 - 0) + 0) 
            ));
        }
    }
    get pattern(): CardMarble[] {
        return this._pattern;
    }
    public blockCard(): void {
        this.isBuilt = true; // a card has become blocked
    }
}