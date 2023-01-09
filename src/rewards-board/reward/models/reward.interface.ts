export interface Reward {
    id: number;
    name: string;
    cost: number;
    reservedTo: number[];
    forbidenTo: number[];
    limit: {
        frequency: string;
        limit: number;
    };
}