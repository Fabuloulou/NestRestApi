export interface Reward {
    id: number;
    name: string;
    cost: number;
    reservedTo: number[];
    forbidenTo: number[];
    limit: RewardLimit;
    mergeWith?: number;
}

export interface RewardLimit {
    frequency: string;
    limit: number;
}
