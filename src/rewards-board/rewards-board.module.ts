import { Module } from '@nestjs/common';
import { ObjectiveController } from './objective/objective.controller';
import { ObjectiveRepository } from './objective/objective.repository';
import { ObjectiveService } from './objective/objective.service';
import { RewardController } from './reward/reward.controller';
import { RewardRepository } from './reward/reward.repository';
import { RewardService } from './reward/reward.service';
import { UserController } from './user/user.controller';
import { UserRepository } from './user/user.repository';
import { UserService } from './user/user.service';

@Module({
    providers: [UserService, RewardService, ObjectiveService, UserRepository, RewardRepository, ObjectiveRepository],
    controllers: [UserController, ObjectiveController, RewardController],
})
export class RewardsBoardModule {}
