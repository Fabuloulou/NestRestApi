import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Objective } from '../objective/models/objective.interface';
import { ObjectiveService } from '../objective/objective.service';
import { RewardService } from '../reward/reward.service';
import { User } from './models/user.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    public constructor(
        private readonly _userRepository: UserRepository,
        private readonly _objectiveService: ObjectiveService,
        private readonly _rewardService: RewardService,
    ) {}

    public getAll(): User[] {
        // TODO logger
        return this._userRepository.loadUsers();
    }

    public getUser(id: number): User {
        // TODO logger
        const filtered: User[] = this.getAll().filter((user) => id === user.id);
        if (filtered.length === 0) throw new NotFoundException("L'utilisateur d'ID=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }

    public addAchievement(userId: number, objectiveId: number): User {
        // TODO logger
        const user: User = this.getUser(userId);
        const objective: Objective = this._objectiveService.getById(objectiveId);
        const start = user.currentPoints;

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

        user.currentPoints -= reward.cost;
        user.rewardsConsumed.push({ date: new Date(), id: reward.id });
        this.update(user);

        return this.getUser(user.id);
    }

    private update(userToUpdate: User): void {
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
}
