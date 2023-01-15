import { UserHistory } from './user-history.interface';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    currentPoints: number;
    totalPoints: number;
    objectiveIds: number[];
    objectivesRiched: UserHistory[];
    rewardIds: number[];
    rewardsConsumed: UserHistory[];
    bonusHistory: {
        date: Date;
        bonus: number;
        comment?: string;
    }[];
    creationDate?: Date;
    lastModificationDate?: Date;
    lastReviewDate?: Date;
}
