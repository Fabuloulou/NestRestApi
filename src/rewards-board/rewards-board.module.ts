import { Module } from '@nestjs/common';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
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
    providers: [LoginService, UserService, RewardService, ObjectiveService, UserRepository, RewardRepository, ObjectiveRepository],
    controllers: [LoginController, UserController, ObjectiveController, RewardController],
})
export class RewardsBoardModule {}
