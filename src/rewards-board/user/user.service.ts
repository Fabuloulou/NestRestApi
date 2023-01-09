import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Objective } from '../objective/models/objective.interface';
import { ObjectiveService } from '../objective/objective.service';
import { Reward } from '../reward/models/reward.interface';
import { RewardService } from '../reward/reward.service';
import { UserHistory } from './models/user-history.interface';
import { User } from './models/user.interface';
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
        return this._userRepository.loadUsers();
    }

    public getUser(id: number): User {
        const filtered: User[] = this.getAll().filter((user) => id === user.id);
        if (filtered.length === 0) throw new NotFoundException("L'utilisateur d'ID=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }

    public addAchievement(userId: number, objectiveId: number): User {
        const user: User = this.getUser(userId);
        const objective: Objective = this._objectiveService.getById(objectiveId);

        if (!user.objectiveIds.includes(objectiveId)) {
            throw new BadRequestException("L'objectif " + objective.name + " n'est pas un objectif de " + user.lastName);
        }

        user.currentPoints += objective.reward;
        user.totalPoints += objective.reward;
        user.objectivesRiched.push({ date: new Date(), id: objective.id });

        this.update(user);

        return this.getUser(userId);
    }

    public consumeReward(userId: number, rewardId: number): User {
        const user: User = this.getUser(userId);
        const reward = this._rewardService.getById(rewardId);

        if (!user.rewardIds.includes(reward.id)) {
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

            if (nextUsageDateMin.getTime() > new Date().getTime()) {
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

    private getNextAuthorizedUsageDate(reward: Reward, lastUsage: Date): Date {
        if (!lastUsage) lastUsage = new Date(1900, 0, 1);
        else lastUsage = new Date(lastUsage);

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
        } else {
            // No limit, let's return a past date
            nextAuthorizedUsageDate = new Date(lastUsage);
        }
        return nextAuthorizedUsageDate;
    }
}
