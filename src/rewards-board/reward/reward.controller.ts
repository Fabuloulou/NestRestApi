import { Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Reward } from './models/reward.interface';
import { RewardService } from './reward.service';

@ApiTags('rewards-board')
@Controller('rewards-board/reward')
export class RewardController {
    private readonly logger = new Logger(RewardController.name);

    public constructor(private readonly _rewardService: RewardService) {}

    @Get()
    public getAll(): Reward[] {
        this.logger.log('GET request received. Loading all rewards...');
        return this._rewardService.getAll();
    }

    @Get(':rewardId')
    public getReward(@Param('rewardId', ParseIntPipe) rewardId: number): Reward {
        this.logger.log('GET request received. Loading reward with ID=' + rewardId + '...');
        return this._rewardService.getById(rewardId);
    }
}
