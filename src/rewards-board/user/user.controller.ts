import { Controller, Get, Logger, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { User } from './models/user.interface';
import { UserService } from './user.service';

@Controller('rewards-board/user')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    public constructor(private readonly _userService: UserService) {}

    @Get()
    public getAllUsers(): User[] {
        this.logger.log('GET request received. Loading all users...');
        return this._userService.getAll();
    }

    @Get(':userId')
    public getUser(@Param('userId', ParseIntPipe) userId: number): User {
        this.logger.log('GET request received. Loading user with ID=' + userId + '...');
        return this._userService.getUser(userId);
    }

    @Patch(':userId/achievement/:objectiveId')
    public addAchievement(@Param('userId', ParseIntPipe) userId: number, @Param('objectiveId', ParseIntPipe) objectiveId: number): User {
        this.logger.log('PATCH request received. Adding achievement of objective with ID=' + objectiveId + ' to user with ID=' + userId + '...');
        return this._userService.addAchievement(userId, objectiveId);
    }

    @Patch(':userId/reward/:rewardId')
    public consumeReward(@Param('userId', ParseIntPipe) userId: number, @Param('rewardId', ParseIntPipe) rewardId: number): User {
        this.logger.log('PATCH request received. Adding consumption of reward with ID=' + rewardId + ' to user with ID=' + userId + '...');
        return this._userService.consumeReward(userId, rewardId);
    }

    @Patch(':userId/review')
    public finalizeReview(@Param('userId', ParseIntPipe) userId: number): User {
        this.logger.log('PATCH request received. Update of last review date to user with ID=' + userId + '...');
        return this._userService.finalizeReview(userId);
    }
}
