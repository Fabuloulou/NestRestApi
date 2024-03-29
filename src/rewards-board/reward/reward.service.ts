import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Reward } from './models/reward.interface';
import { RewardRepository } from './reward.repository';

@Injectable()
export class RewardService {
    private readonly _logger = new Logger(RewardService.name);
    public constructor(private _rewardRepository: RewardRepository) {}

    public getAll(): Reward[] {
        return this._rewardRepository.loadRewards();
    }

    public getById(id: number): Reward {
        const filtered: Reward[] = this.getAll().filter((reward) => id === reward.id);
        if (filtered.length === 0) throw new NotFoundException("La récompense d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }
}
