export interface Rate {
    amount: {
        amount: number;
        dollarAmount: number;
    };
    changer: string;
    changerTitle: string;
    from: string;
    fromTitle: string;
    to: string;
    toTitle: string;
    give: number;
    receive: number;
    calcSum?: number;
}
