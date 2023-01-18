export interface User {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    currentPoints: number;
    totalPoints: number;
    objectiveIds: number[];
    objectives: Period[];
    objectivesRiched?: UserHistory[];
    rewardIds: number[];
    rewards: Period[];
    rewardsConsumed?: UserHistory[];
    bonusHistory?: BonusHistory[];
    creationDate?: Date;
    lastModificationDate?: Date;
    lastReviewDate?: Date;
}

export interface UserHistory {
    date: Date;
    id: number;
}

export interface BonusHistory {
    date: Date;
    bonus: number;
    comment?: string;
}

export interface Period {
    id: number;
    start: Date;
    end: Date;
}
