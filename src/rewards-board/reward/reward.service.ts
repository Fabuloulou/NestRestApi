import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Reward } from './models/reward.interface';
import { RewardRepository } from './reward.repository';

@Injectable()
export class RewardService {
    private readonly _logger = new Logger(RewardService.name);
    public constructor(private _rewardRepository: RewardRepository) {}

    public getAll(): Reward[] {
        const rewards = this._rewardRepository.loadRewards();
        // Marquage des doublons
        rewards.forEach((rwd) => {
            if (rwd.mergeWith === undefined) {
                rewards.filter((tmp) => tmp.id !== rwd.id && tmp.name === rwd.name && tmp.mergeWith === undefined).map((tmp) => (tmp.mergeWith = rwd.id));
            }
        });
        return rewards;
    }

    public getById(id: number): Reward {
        const filtered: Reward[] = this.getAll().filter((reward) => id === reward.id);
        if (filtered.length === 0) throw new NotFoundException("La récompense d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }

    public migrateRewards() {
        this._logger.warn('Migration du fichier des récompenses : Suppression des valeurs de cout, et des doublons');
        this._rewardRepository.writeRewards(
            this.getAll()
                .filter((rwd) => rwd.mergeWith === undefined)
                .map((obj) => {
                    delete obj.cost;
                    return obj;
                }),
        );
        this._logger.log('Fichier des récompenses migré !');
    }
}
