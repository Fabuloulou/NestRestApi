import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Reward } from './models/reward.interface';
import { RewardService } from './reward.service';

@Controller('/api/rewards-board/reward')
export class RewardController {
    public constructor(private readonly _rewardService: RewardService) {}

    @Get()
    public getAll(): Reward[] {
        return this._rewardService.getAll();
    }

    @Get(':rewardId')
    public getReward(@Param('rewardId', ParseIntPipe) rewardId: number): Reward {
        return this._rewardService.getById(rewardId);
    }
}
