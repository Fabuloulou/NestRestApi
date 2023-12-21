import { Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Objective } from './models/objective.interface';
import { ObjectiveService } from './objective.service';

@ApiTags('rewards-board')
@Controller('rewards-board/objective')
export class ObjectiveController {
    private readonly logger = new Logger(ObjectiveController.name);

    public constructor(private readonly _objectiveService: ObjectiveService) {}

    @Get()
    public getAll(): Objective[] {
        this.logger.log('GET request received. Loading all objectives...');
        return this._objectiveService.getAll();
    }

    @Get(':objectiveId')
    public getObjective(@Param('objectiveId', ParseIntPipe) objectiveId: number): Objective {
        this.logger.log('GET request received. Loading objective with ID=' + objectiveId + '...');
        return this._objectiveService.getById(objectiveId);
    }
}
