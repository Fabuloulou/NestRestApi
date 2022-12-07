import { Injectable, NotFoundException } from '@nestjs/common';
import * as filedatas_rewards from 'data/rewards.json';
import { Reward } from './models/reward.interface';

@Injectable()
export class RewardService {
    public getAll(): Reward[] {
        return filedatas_rewards;
    }

    public getById(id: number): Reward {
        const filtered: Reward[] = filedatas_rewards.filter((reward) => id === reward.id);
        if (filtered.length === 0) throw new NotFoundException("La récompense d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }
}
