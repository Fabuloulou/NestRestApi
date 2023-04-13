import { RewardLimit } from '../../reward/models/reward.interface';
import { User } from '../models/user.interface';

export interface UserDto {
    id: number;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    currentPoints: number;
    totalPoints: number;
    creationDate?: Date;
    lastModificationDate?: Date;
    lastReviewDate?: Date;
}

export interface UserObjectiveDto {
    id: number;
    name: string;
    value: number;
    success: number;
}

export interface DayUserObjectivesDto {
    day: Date;
    objectives: UserObjectiveDto[];
}

export interface UserRewardDto {
    id: number;
    name: string;
    value: number;
    limit: RewardLimit;
    status: 'PENDING' | 'OPEN' | 'CLOSED';
    start: Date;
    end: Date;
    count: number;
    nextUseAuthorized: Date;
    progress: number;
}

export interface UserReviewDto {
    previousReviewDate: Date;
    totalPoints: number;
    wins: UserObjectiveDto[];
}

export interface UserSummaryDto {
    currentWeek: PeriodSummaryDto;
    previousWeek: PeriodSummaryDto;
    currentMonth: PeriodSummaryDto;
    previousMonth: PeriodSummaryDto;
}

export interface PeriodSummaryDto {
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

export class UserMapper {
    public static toDto(user: User): UserDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            currentPoints: user.currentPoints,
            totalPoints: user.totalPoints,
            creationDate: user.creationDate,
            lastModificationDate: user.lastModificationDate,
            lastReviewDate: user.lastReviewDate,
        };
    }
}
