import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Objective } from '../objective/models/objective.interface';
import { ObjectiveService } from '../objective/objective.service';
import { Reward } from '../reward/models/reward.interface';
import { RewardService } from '../reward/reward.service';
import { User, UserHistory } from './models/user.interface';
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
        return this._userRepository.loadUsers().map((user) => {
            this.initHistories(user);
            this.computeTotalPoints(user);
            this.computeCurrentPoints(user);
            this.migrateToNewModel(user);
            return user;
        });
    }

    public getUser(id: number): User {
        const filtered: User[] = this.getAll().filter((user) => id === user.id);
        if (filtered.length === 0) throw new NotFoundException("L'utilisateur d'ID=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }

    public addAchievement(userId: number, objectiveId: number): User {
        const user: User = this.getUser(userId);
        const objective: Objective = this._objectiveService.getById(objectiveId);

        if (!user.objectives.map((obj) => obj.id).includes(objectiveId)) {
            throw new BadRequestException("L'objectif " + objective.name + " n'est pas un objectif de " + user.lastName);
        }

        user.currentPoints += objective.reward;
        user.totalPoints += objective.reward;
        user.objectivesRiched.push({ date: new Date(), id: objective.id });

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

        if (!user.rewards.map((rwd) => rwd.id).includes(reward.id)) {
            throw new BadRequestException(user.lastName + ' ne peut pas utiliser la récompense ' + reward.name);
        }

        if (user.currentPoints < reward.cost)
            throw new BadRequestException(
                user.lastName +
                    " n'a pas assez de point pour utiliser la récompense " +
                    reward.name +
                    '. ' +
                    user.currentPoints +
                    ' point(s) possédé(s) / ' +
                    reward.cost +
                    ' point(s) requis',
            );

        const lastUsage: UserHistory = [...user.rewardsConsumed]
            .sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .find((hist) => hist.id === rewardId);
        if (lastUsage !== undefined) {
            const nextUsageDateMin = this.getNextAuthorizedUsageDate(reward, lastUsage.date);

            if (nextUsageDateMin !== null && nextUsageDateMin.getTime() > new Date().getTime()) {
                throw new BadRequestException(
                    user.lastName +
                        ' a déjà utilisé la récompense ' +
                        reward.name +
                        ' le ' +
                        new Date(lastUsage.date).toLocaleDateString() +
                        '. Elle ne peut être utilisée de nouveau avant le ' +
                        nextUsageDateMin.toLocaleDateString(),
                );
            }
        }

        user.currentPoints -= reward.cost;
        user.rewardsConsumed.push({ date: new Date(), id: reward.id });
        this.update(user);

        return this.getUser(user.id);
    }

    public finalizeReview(userId: number): User {
        const user: User = this.getUser(userId);

        user.lastReviewDate = new Date();
        this.update(user);

        return this.getUser(userId);
    }

    private update(userToUpdate: User): void {
        this._logger.debug('Updating user ' + userToUpdate.id);
        const users = this.getAll();

        // Vérification que l'utilisateur existe
        if (users.filter((user) => user.id === userToUpdate.id).length === 0)
            throw new NotFoundException("L'utilisateur d'ID=" + userToUpdate.id + " n'a pas été trouvé");

        userToUpdate.lastModificationDate = new Date();

        // Remplacement
        const tmp = users.filter((user) => user.id !== userToUpdate.id);
        tmp.push(userToUpdate);
        this._userRepository.writeUsers(tmp);
    }

    private getNextAuthorizedUsageDate(reward: Reward, lastUsage: Date): Date | null {
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
        const objectives = this._objectiveService.getAll();

        const objectivesPoints = user.objectivesRiched
            .map((hist) => {
                const objective = objectives.find((obj) => obj.id === hist.id);
                return objective === undefined ? 0 : objective.reward;
            })
            .reduce((previous, current) => previous + current, 0);
        const bonusPoints = user.bonusHistory.map((hist) => hist.bonus).reduce((previous, current) => previous + current, 0);
        user.totalPoints = objectivesPoints + bonusPoints;
    }

    private computeCurrentPoints(user: User) {
        const rewards = this._rewardService.getAll();

        const totalUsedPoints = user.rewardsConsumed
            .map((hist) => {
                const reward = rewards.find((rwd) => rwd.id === hist.id);
                return reward === undefined ? 0 : reward.cost;
            })
            .reduce((previous, current) => previous + current, 0);
        user.currentPoints = user.totalPoints - totalUsedPoints;
    }

    private migrateToNewModel(user: User) {
        if (user.objectives?.length > 0) return user;

        this._logger.log('Migration des objectifs de ' + user.lastName);
        user.objectives = user.objectiveIds.map((id) => ({
            id: id,
            start: new Date(2023, 0, 1),
            end: new Date(2023, 1, 1),
        }));
        this._logger.log('Migration des récompenses de ' + user.lastName);
        user.rewards = user.rewardIds.map((id) => ({
            id: id,
            start: new Date(2023, 0, 1),
            end: new Date(2023, 1, 1),
        }));
        delete user.objectiveIds;
        delete user.rewardIds;
    }
}
