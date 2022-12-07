import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { User } from './models/user.interface';
import { UserService } from './user.service';

@Controller('api/rewards-board/user')
export class UserController {
    public constructor(private readonly _userService: UserService) {}

    @Get()
    public getAllUsers(): User[] {
        return this._userService.getAll();
    }

    @Get(':userId')
    public getUser(@Param('userId', ParseIntPipe) userId: number): User {
        return this._userService.getUser(userId);
    }

    @Patch(':userId/achievement/:objectiveId')
    public addAchievement(@Param('userId', ParseIntPipe) userId: number, @Param('objectiveId', ParseIntPipe) objectiveId: number): User {
        return this._userService.addAchievement(userId, objectiveId);
    }

    @Patch(':userId/reward/:rewardId')
    public consumeReward(@Param('userId', ParseIntPipe) userId: number, @Param('rewardId', ParseIntPipe) rewardId: number): User {
        return this._userService.consumeReward(userId, rewardId);
    }
}
