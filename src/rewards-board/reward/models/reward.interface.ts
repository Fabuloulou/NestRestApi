export interface Reward {
    id: number;
    name: string;
    cost: number;
    reservedTo: number[];
    forbidenTo: number[];
}
