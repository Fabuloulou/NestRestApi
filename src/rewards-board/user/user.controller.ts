import { Body, Controller, Get, Logger, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DayUserObjectivesDto, UserDto, UserMapper, UserReviewDto, UserRewardDto, UserSummaryDto } from './dtos/user.dto';
import { AddAchievementRequestBody } from './models/api-interface';
import { UserService } from './user.service';

@ApiTags('rewards-board')
@Controller('rewards-board/user')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    public constructor(private readonly _userService: UserService) {}

    @Get()
    public getAllUsers(): UserDto[] {
        this.logger.log('GET request received. Loading all users...');
        return this._userService.getAll().map((user) => UserMapper.toDto(user));
    }

    @Get(':userId')
    public getUser(@Param('userId', ParseIntPipe) userId: number): UserDto {
        this.logger.log('GET request received. Loading user with ID=' + userId + '...');
        return UserMapper.toDto(this._userService.getUser(userId));
    }

    @Get(':userId/objectives')
    public getObjectives(@Param('userId', ParseIntPipe) userId: number, @Query('date') date: Date[]): DayUserObjectivesDto[] {
        this.logger.log(`GET request received. Loading objectives of user with ID=${userId} for ${date?.length} dates...`);
        return this._userService.getObjectivesAt(userId, date);
    }

    @Get(':userId/rewards')
    public getRewards(@Param('userId', ParseIntPipe) userId: number, @Query('activeOnly') activeOnly?: boolean): UserRewardDto[] {
        this.logger.log(
            `GET request received. Loading rewards ${activeOnly === undefined ? '' : '(activeOnly=' + activeOnly + ') '}of user with ID=${userId}...`,
        );
        return this._userService.getRewards(userId, activeOnly);
    }

    @Get(':userId/wins')
    public getWins(@Param('userId', ParseIntPipe) userId: number): UserReviewDto {
        this.logger.log(`GET request received. Loading wins of user with ID=${userId} since last review...`);
        return this._userService.getWins(userId);
    }

    @Get(':userId/summary')
    public getSummary(@Param('userId', ParseIntPipe) userId: number): UserSummaryDto {
        this.logger.log(`GET request received. Loading summary of user with ID=${userId}...`);
        return this._userService.getSummary(userId);
    }

    @Patch(':userId/achievement')
    public addAchievement(@Param('userId', ParseIntPipe) userId: number, @Body() body: AddAchievementRequestBody): UserDto {
        this.logger.log(
            'PATCH request received. Adding achievement of objective with ID=' +
                body.objectiveId +
                ' to user with ID=' +
                userId +
                ' on date=' +
                body.date +
                ' ...',
        );
        return UserMapper.toDto(this._userService.addAchievement(userId, body.objectiveId, body.date));
    }

    @Patch(':userId/bonus/:bonusPoints')
    public addBonus(@Param('userId', ParseIntPipe) userId: number, @Param('bonusPoints', ParseIntPipe) bonusPoints: number): UserDto {
        this.logger.log('PATCH request received. Adding ' + bonusPoints + ' bonus points to user with ID=' + userId + '...');
        return UserMapper.toDto(this._userService.addBonus(userId, bonusPoints));
    }

    @Patch(':userId/reward/:rewardId')
    public consumeReward(@Param('userId', ParseIntPipe) userId: number, @Param('rewardId', ParseIntPipe) rewardId: number): UserDto {
        this.logger.log('PATCH request received. Adding consumption of reward with ID=' + rewardId + ' to user with ID=' + userId + '...');
        return UserMapper.toDto(this._userService.consumeReward(userId, rewardId));
    }

    @Patch(':userId/review')
    public finalizeReview(@Param('userId', ParseIntPipe) userId: number): UserDto {
        this.logger.log('PATCH request received. Update of last review date to user with ID=' + userId + '...');
        return UserMapper.toDto(this._userService.finalizeReview(userId));
    }
}
