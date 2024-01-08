export interface User {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    currentPoints: number;
    totalPoints: number;
    objectives: Period[];
    objectivesRiched?: UserHistory[];
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
    value: number;
}

export interface BonusHistory {
    date: Date;
    bonus: number;
    comment?: string;
}

export interface Period {
    id: number;
    start: Date;
    end?: Date;
    value: number;
}

export interface UserObjective {
    id: number;
    name: string;
    value: number;
    success: number;
}

export interface DayUserObjectives {
    day: Date;
    objectives: UserObjective[];
}

export interface UserSummary {
    currentWeek: PeriodSummary;
    previousWeek: PeriodSummary;
    currentMonth: PeriodSummary;
    previousMonth: PeriodSummary;
}

export interface PeriodSummary {
    totalWon: number;
    totalUsed: number;
    objectives: {
        name: string;
        success: number;
        total: number;
    }[];
    rewards: {
        name: string;
        totalUse: number;
    }[];
}
