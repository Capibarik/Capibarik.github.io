class CardPattern {
    private pattern: CardMarble[];
    private isBuilt: boolean;
    constructor()  {
        this.isBuilt = false; // when a card is born, it won`t be built 
        this.pattern = [];
        for (let i = 0; i < 5; i++) { // generate card`s pattern
            this.pattern.push(new CardMarble(
                Math.ceil(Math.random() * (2 - 0) + 0) 
            ));
        }
    }
    public blockCard(): void {
        this.isBuilt = true; // a card has become blocked
    }
}