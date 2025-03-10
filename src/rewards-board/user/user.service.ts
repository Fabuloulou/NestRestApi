import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DateUtils } from '../../utils/DateUtils';
import { Objective } from '../objective/models/objective.interface';
import { ObjectiveService } from '../objective/objective.service';
import { Reward } from '../reward/models/reward.interface';
import { RewardService } from '../reward/reward.service';
import { UserObjectiveDto, UserReviewDto, UserRewardDto } from './dtos/user.dto';
import { DayUserObjectives, Period, User, UserHistory, UserSummary } from './models/user.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    private readonly _logger = new Logger(UserService.name);

    public constructor(
        private readonly _userRepository: UserRepository,
        private readonly _objectiveService: ObjectiveService,
        private readonly _rewardService: RewardService,
    ) {}

    public getAll(): User[] {
        const users = this._userRepository.loadUsers().map((user) => {
            this.initHistories(user);
            this.computeTotalPoints(user);
            this.computeCurrentPoints(user);
            this.computePendingPoints(user);
            return user;
        });

        return users;
    }

    public getUser(id: number): User {
        const filtered: User[] = this.getAll().filter((user) => id === user.id);
        if (filtered.length === 0) throw new NotFoundException(`L'utilisateur d'ID=${id} n'a pas été trouvé`);
        else return filtered[0];
    }

    public addAchievement(userId: number, objectiveId: number, date?: Date): User {
        const user: User = this.getUser(userId);
        const objective: Objective = this._objectiveService.getById(objectiveId);

        const userObj = this.findCurrentObjective(user.objectives, objectiveId, date !== undefined ? date : new Date());
        if (userObj === undefined) {
            throw new BadRequestException(`L'objectif ${objective.name} n'est pas un objectif actif de ${user.lastName}`);
        }

        user.objectivesRiched.push({ date: date ?? new Date(), id: objective.id, value: userObj.value });

        this.update(user);

        return this.getUser(userId);
    }

    public removeAchievement(userId: number, objectiveId: number, date?: Date): User {
        const user: User = this.getUser(userId);
        const objective: Objective = this._objectiveService.getById(objectiveId);

        const userObj = this.findCurrentObjective(user.objectives, objectiveId, date !== undefined ? date : new Date());
        if (userObj === undefined) {
            throw new BadRequestException(`L'objectif ${objective.name} n'est pas un objectif actif de ${user.lastName}`);
        }

        // Remove the last occurence of hit of the day
        const lastHit: UserHistory = user.objectivesRiched
            .filter((elem) => elem.id === objectiveId && DateUtils.sameDay(elem.date, date ?? new Date()) && elem.value === userObj.value)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .shift();
        const indexToRemove = user.objectivesRiched.indexOf(lastHit);
        user.objectivesRiched.splice(indexToRemove, 1);

        this.update(user);

        return this.getUser(userId);
    }

    public addBonus(userId: number, bonusPoints: number, comment?: string): User {
        const user: User = this.getUser(userId);

        user.currentPoints += bonusPoints;
        user.totalPoints += bonusPoints;
        user.bonusHistory.push({
            date: new Date(),
            bonus: bonusPoints,
            comment: comment,
        });
        this.update(user);

        return this.getUser(userId);
    }

    public consumeReward(userId: number, rewardId: number): User {
        const user: User = this.getUser(userId);
        const reward = this._rewardService.getById(rewardId);

        const userReward = this.findCurrentReward(user.rewards, rewardId, new Date());
        if (userReward === undefined) {
            throw new BadRequestException(`${user.lastName} ne peut pas utiliser la récompense ${reward.name}`);
        }

        if (user.currentPoints < reward.cost)
            throw new BadRequestException(`
                ${user.lastName} n'a pas assez de point pour utiliser la récompense. ${user.currentPoints} point(s) possédé(s) / ${reward.cost} point(s) requis`);

        const lastUsage: UserHistory = [...user.rewardsConsumed]
            .sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .find((hist) => hist.id === rewardId);
        if (lastUsage !== undefined) {
            const nextUsageDateMin = this.getNextAuthorizedUsageDate(reward, lastUsage.date);

            if (nextUsageDateMin !== null && nextUsageDateMin.getTime() > new Date().getTime()) {
                throw new BadRequestException(
                    `${user.lastName} a déjà utilisé la récompense  ${reward.name} le 
                    ${new Date(lastUsage.date).toLocaleDateString()}. 
                    Elle ne peut être utilisée de nouveau avant le ${nextUsageDateMin.toLocaleDateString()}`,
                );
            }
        }

        user.currentPoints -= reward.cost;
        user.rewardsConsumed.push({ date: new Date(), id: reward.id, value: userReward.value });
        this.update(user);

        return this.getUser(user.id);
    }

    public finalizeReview(userId: number): User {
        const user: User = this.getUser(userId);

        user.lastReviewDate = new Date();
        this.update(user);

        return this.getUser(userId);
    }

    public getObjectivesAt(userId: number, dates: Date[]): DayUserObjectives[] {
        const user: User = this.getUser(userId);
        const objectives = this._objectiveService.getAll();
        return dates.map((day) => this.getDayObjectives(user, objectives, day));
    }

    public getRewards(userId: number, activeOnly = true): UserRewardDto[] {
        console.log(`getRewards with activeOnly=${activeOnly}`);

        const user: User = this.getUser(userId);
        const rewards = this._rewardService.getAll();

        const periods = activeOnly
            ? user.rewards.filter((period) => DateUtils.isAfter(new Date(), period.start) && DateUtils.isBefore(new Date(), period.end))
            : user.rewards;

        return periods.map((period) => {
            const reward = rewards.find((rw) => rw.id === period.id);
            const nextDate = this.getNextAuthorizedUsageDate(reward, this.getLastRewardUsage(user.rewardsConsumed, period.id));
            return {
                id: period.id,
                name: reward?.name ?? 'Inconnu',
                value: period.value,
                limit: reward?.limit,
                count: user.rewardsConsumed.filter((use) => use.id === period.id).length ?? 0,
                progress: this.getRewardProgress(user, period.value),
                status: activeOnly ? 'OPEN' : DateUtils.isBefore(new Date(), period.start) ? 'CLOSED' : 'PENDING',
                start: period.start,
                end: period.end,
                nextUseAuthorized: DateUtils.isBefore(nextDate, new Date()) ? null : nextDate,
            };
        });
    }

    private groupHistories(histories: UserHistory[] | undefined | null): Map<string, Date[]> {
        if (histories === null || histories === undefined) return new Map();
        else {
            const map = new Map<string, Date[]>();
            histories.forEach((item) => {
                const key = `id:${item.id},value:${item.value}`;
                const dates = map.get(key);

                if (!dates) {
                    map.set(key, [item.date]);
                } else {
                    dates.push(item.date);
                }
            });
            return map;
        }
    }

    public getWins(userId: number): UserReviewDto {
        const user: User = this.getUser(userId);
        const allObjectives = this._objectiveService.getAll();

        const hits: UserObjectiveDto[] = [];

        if (allObjectives.length > 0) {
            this.groupHistories(user.objectivesRiched.filter((hist) => DateUtils.isAfter(hist.date, user.lastReviewDate))).forEach((value, key) => {
                const keyId = key.split(',')[0];
                const keyValue = key.split(',')[1];

                const id = +keyId.split(':')[1];
                const histValue = +keyValue.split(':')[1];
                hits.push({
                    id: id,
                    name: allObjectives.find((obj) => obj.id === id)?.name ?? 'Inconnu',
                    value: histValue,
                    success: value.length,
                });
            });

            // Push all bonus won
            hits.push(
                ...user.bonusHistory
                    .filter((history) => DateUtils.isAfter(history.date, user.lastReviewDate))
                    .map((history) => ({
                        id: -1,
                        name: `Bonus +${history.bonus}`,
                        value: history.bonus,
                        success: 1,
                    })),
            );
        }

        return {
            previousReviewDate: user.lastReviewDate,
            totalPoints: hits.reduce((previous, hit) => previous + hit.success * hit.value, 0),
            wins: hits,
        };
    }

    public getSummary(userId: number): UserSummary {
        const user: User = this.getUser(userId);
        this._logger.debug(`Computing activity summary for ${user.lastName}...`);
        const allObjectives = this._objectiveService.getAll();
        const allRewards = this._rewardService.getAll();

        const rawDatas = this.getSummurayRawDatas(user);
        const result = {
            currentWeek: {
                totalWon: rawDatas.currentWeek.hits.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                totalUsed: rawDatas.currentWeek.rewards.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                objectives: rawDatas.currentWeek.objectiveIds.map((objId) => {
                    const count = rawDatas.currentWeek.hits.filter((item) => item.id === objId).length;
                    return {
                        name: allObjectives.find((item) => objId === item.id)?.name ?? 'Inconnu',
                        success: count,
                        total: rawDatas.currentWeek.hits
                            .filter((hist) => hist.id === objId)
                            .map((hist) => hist.value)
                            .reduce((previous, current) => previous + current, 0),
                    };
                }),
                rewards: user.rewards
                    .map((userReward) => {
                        return {
                            name: allRewards.find((reward) => reward.id === userReward.id)?.name ?? 'Inconnu',
                            totalUse: rawDatas.currentWeek.rewards.filter((tmp) => userReward.id === tmp.id).length,
                        };
                    })
                    .filter((item) => item.totalUse > 0),
            },
            previousWeek: {
                totalWon: rawDatas.lastWeek.hits.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                totalUsed: rawDatas.lastWeek.rewards.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                objectives: rawDatas.lastWeek.objectiveIds.map((objId) => {
                    const count = rawDatas.lastWeek.hits.filter((item) => item.id === objId).length;
                    return {
                        name: allObjectives.find((item) => objId === item.id)?.name ?? 'Inconnu',
                        success: count,
                        total: rawDatas.lastWeek.hits
                            .filter((hist) => hist.id === objId)
                            .map((hist) => hist.value)
                            .reduce((previous, current) => previous + current, 0),
                    };
                }),
                rewards: user.rewards
                    .map((userReward) => {
                        return {
                            name: allRewards.find((reward) => reward.id === userReward.id)?.name ?? 'Inconnu',
                            totalUse: rawDatas.lastWeek.rewards.filter((tmp) => userReward.id === tmp.id).length,
                        };
                    })
                    .filter((item) => item.totalUse > 0),
            },
            currentMonth: {
                totalWon: rawDatas.currentMonth.hits.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                totalUsed: rawDatas.currentMonth.rewards.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                objectives: rawDatas.currentMonth.objectiveIds.map((objId) => {
                    const count = rawDatas.currentMonth.hits.filter((item) => item.id === objId).length;
                    return {
                        name: allObjectives.find((item) => objId === item.id)?.name ?? 'Inconnu',
                        success: count,
                        total: rawDatas.currentMonth.hits
                            .filter((hist) => hist.id === objId)
                            .map((hist) => hist.value)
                            .reduce((previous, current) => previous + current, 0),
                    };
                }),
                rewards: user.rewards
                    .map((userReward) => {
                        return {
                            name: allRewards.find((reward) => reward.id === userReward.id)?.name ?? 'Inconnu',
                            totalUse: rawDatas.currentMonth.rewards.filter((tmp) => userReward.id === tmp.id).length,
                        };
                    })
                    .filter((item) => item.totalUse > 0),
            },
            previousMonth: {
                totalWon: rawDatas.lastMonth.hits.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                totalUsed: rawDatas.lastMonth.rewards.map((hist) => hist.value).reduce((previous, current) => previous + current, 0),
                objectives: rawDatas.lastMonth.objectiveIds.map((objId) => {
                    const count = rawDatas.lastMonth.hits.filter((item) => item.id === objId).length;
                    return {
                        name: allObjectives.find((item) => objId === item.id)?.name ?? 'Inconnu',
                        success: count,
                        total: rawDatas.lastMonth.hits
                            .filter((hist) => hist.id === objId)
                            .map((hist) => hist.value)
                            .reduce((previous, current) => previous + current, 0),
                    };
                }),
                rewards: user.rewards
                    .map((userReward) => {
                        return {
                            name: allRewards.find((reward) => reward.id === userReward.id)?.name ?? 'Inconnu',
                            totalUse: rawDatas.lastMonth.rewards.filter((tmp) => userReward.id === tmp.id).length,
                        };
                    })
                    .filter((item) => item.totalUse > 0),
            },
        };
        this._logger.debug(`Activity summary computing for ${user.lastName} finished !`);
        return result;
    }

    private update(userToUpdate: User): void {
        this._logger.debug(`Updating user ${userToUpdate.id}`);
        const users = this.getAll();

        // Vérification que l'utilisateur existe
        if (users.filter((user) => user.id === userToUpdate.id).length === 0)
            throw new NotFoundException(`L'utilisateur d'ID=${userToUpdate.id} n'a pas été trouvé`);

        userToUpdate.lastModificationDate = new Date();

        // Remplacement
        const tmp = users.filter((user) => user.id !== userToUpdate.id);
        tmp.push(userToUpdate);
        this._userRepository.writeUsers(tmp);
    }

    private getDayObjectives(user: User, objectives: Objective[], date: Date): DayUserObjectives {
        this._logger.debug(`Computing objectives of ${user.lastName} for ${new Date(date).toLocaleDateString()}`);
        const userPeriods = user.objectives.filter((period) => DateUtils.isAfter(date, period.start) && DateUtils.isBefore(date, period.end));
        // Charger les objectifs pour avoir le nom
        const userObjectives = userPeriods.map((obj) => obj.id).map((objId) => objectives.find((obj) => obj.id === objId));

        return {
            day: date,
            objectives: userPeriods.map((period) => ({
                id: period.id,
                name: userObjectives.find((obj) => obj.id === period.id).name,
                value: period.value,
                success: user.objectivesRiched.filter((hit) => hit.id === period.id && DateUtils.sameDay(hit.date, date)).length ?? 0,
            })),
        };
    }

    private getLastRewardUsage(history: UserHistory[], rewardId: number): Date | undefined {
        const descOrdered = [...history]
            .filter((hist) => hist.id === rewardId)
            .sort((hist1, hist2) => new Date(hist2.date).getTime() - new Date(hist1.date).getTime());
        return descOrdered.length === 0 ? undefined : descOrdered[0].date;
    }

    private getNextAuthorizedUsageDate(reward: Reward, lastUsage: Date | null | undefined): Date | null {
        let value: Date | null = null;

        if (lastUsage !== null && lastUsage !== undefined) {
            lastUsage = new Date(lastUsage);

            let nextAuthorizedUsageDate = new Date(lastUsage);
            if (reward.limit) {
                let diff = 0;
                const next = new Date(lastUsage);

                switch (reward.limit.frequency) {
                    case 'day':
                        next.setDate(next.getDate() + 1);
                        diff = next.getTime() - lastUsage.getTime();
                        break;
                    case 'week':
                        next.setDate(next.getDate() + 7);
                        diff = next.getTime() - lastUsage.getTime();
                        break;
                    case 'month':
                        next.setMonth(next.getMonth() + 1);
                        diff = next.getTime() - lastUsage.getTime();
                        break;
                    case 'year':
                        next.setFullYear(next.getFullYear() + 1);
                        diff = next.getTime() - lastUsage.getTime();
                        break;
                    default:
                        nextAuthorizedUsageDate = new Date(2100, 0, 1);
                }
                nextAuthorizedUsageDate.setTime(nextAuthorizedUsageDate.getTime() + diff / reward.limit.limit);
                // Let's authorized the reward from midnight
                nextAuthorizedUsageDate.setHours(0);
                nextAuthorizedUsageDate.setMinutes(0);
                nextAuthorizedUsageDate.setSeconds(0);
                value = nextAuthorizedUsageDate;
            }
        }
        return value;
    }

    private initHistories(user: User) {
        if (user.objectivesRiched === undefined) user.objectivesRiched = [];
        if (user.rewardsConsumed === undefined) user.rewardsConsumed = [];
        if (user.bonusHistory === undefined) user.bonusHistory = [];
    }

    private computeTotalPoints(user: User) {
        const objectivesPoints = user.objectivesRiched.reduce((previous, current) => previous + current.value, 0);
        const bonusPoints = user.bonusHistory.map((hist) => hist.bonus).reduce((previous, current) => previous + current, 0);
        user.totalPoints = objectivesPoints + bonusPoints;
    }

    private computeCurrentPoints(user: User) {
        const totalUsedPoints = user.rewardsConsumed.reduce((previous, current) => previous + current.value, 0);
        user.currentPoints = user.totalPoints - totalUsedPoints;
    }

    private computePendingPoints(user: User) {
        user.pendingPoints = user.objectivesRiched
            .filter((hit) => DateUtils.isAfter(hit.date, user.lastReviewDate))
            .reduce((previous, current) => previous + current.value, 0);
    }

    private getRewardProgress(user: User, cost: number): number {
        const progess = (user.currentPoints / cost) * 100;
        return progess > 100 ? 100 : progess;
    }

    private getSummurayRawDatas(user: User): CumulativeSummaryRawData {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        return {
            currentWeek: {
                objectiveIds: [
                    ...new Set(
                        user.objectives
                            .filter(
                                (obj) =>
                                    DateUtils.between(DateUtils.startOfWeek(today), obj.start, obj.end) ||
                                    DateUtils.between(DateUtils.endOfWeek(today), obj.start, obj.end),
                            )
                            .map((obj) => obj.id),
                    ),
                ],
                hits: user.objectivesRiched.filter((hist) => DateUtils.sameWeek(hist.date, today)),
                rewards: user.rewardsConsumed.filter((hist) => DateUtils.sameWeek(hist.date, today)),
            },
            lastWeek: {
                objectiveIds: [
                    ...new Set(
                        user.objectives
                            .filter(
                                (obj) =>
                                    DateUtils.between(DateUtils.startOfWeek(lastWeek), obj.start, obj.end) ||
                                    DateUtils.between(DateUtils.endOfWeek(lastWeek), obj.start, obj.end),
                            )
                            .map((obj) => obj.id),
                    ),
                ],
                hits: user.objectivesRiched.filter((hist) => DateUtils.sameWeek(hist.date, lastWeek)),
                rewards: user.rewardsConsumed.filter((hist) => DateUtils.sameWeek(hist.date, lastWeek)),
            },
            currentMonth: {
                objectiveIds: [
                    ...new Set(
                        user.objectives
                            .filter(
                                (obj) =>
                                    DateUtils.between(DateUtils.startOfMonth(today), obj.start, obj.end) ||
                                    DateUtils.between(DateUtils.endOfMonth(today), obj.start, obj.end),
                            )
                            .map((obj) => obj.id),
                    ),
                ],
                hits: user.objectivesRiched.filter((hist) => DateUtils.sameMonth(hist.date, today)),
                rewards: user.rewardsConsumed.filter((hist) => DateUtils.sameMonth(hist.date, today)),
            },
            lastMonth: {
                objectiveIds: [
                    ...new Set(
                        user.objectives
                            .filter(
                                (obj) =>
                                    DateUtils.between(DateUtils.startOfMonth(lastMonth), obj.start, obj.end) ||
                                    DateUtils.between(DateUtils.endOfMonth(lastMonth), obj.start, obj.end),
                            )
                            .map((obj) => obj.id),
                    ),
                ],
                hits: user.objectivesRiched.filter((hist) => DateUtils.sameMonth(hist.date, lastMonth)),
                rewards: user.rewardsConsumed.filter((hist) => DateUtils.sameMonth(hist.date, lastMonth)),
            },
        };
    }

    private findCurrentInPeriods(periods: Period[], periodId: number, date = new Date()): Period | null {
        const time = new Date(date).getTime();
        return periods.find(
            (period) => period.id === periodId && new Date(period.start).getTime() <= time && (!period.end || new Date(period.end).getTime() > time),
        );
    }

    private findCurrentObjective(userObjectives: Period[], objectiveId: number, date = new Date()): Period | null {
        return this.findCurrentInPeriods(userObjectives, objectiveId, date);
    }

    private findCurrentReward(userRewards: Period[], rewardId: number, date = new Date()): Period | null {
        return this.findCurrentInPeriods(userRewards, rewardId, date);
    }
}
interface SummaryRawData {
    objectiveIds: number[];
    hits: UserHistory[];
    rewards: UserHistory[];
}
interface CumulativeSummaryRawData {
    currentWeek: SummaryRawData;
    lastWeek: SummaryRawData;
    currentMonth: SummaryRawData;
    lastMonth: SummaryRawData;
}
