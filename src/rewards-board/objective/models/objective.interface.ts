export interface Objective {
    id: number;
    name: string;
    description: string;
    reward: number;
    dayOfWeek: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
    mergeWith?: number;
}
