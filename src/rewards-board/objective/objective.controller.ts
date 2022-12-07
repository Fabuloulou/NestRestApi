import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Objective } from './models/objective.interface';
import { ObjectiveService } from './objective.service';

@Controller('rewards-board/objective')
export class ObjectiveController {
    public constructor(private readonly _objectiveService: ObjectiveService) {}

    @Get()
    public getAll(): Objective[] {
        return this._objectiveService.getAll();
    }

    @Get(':objectiveId')
    public getObjective(@Param('objectiveId', ParseIntPipe) objectiveId: number): Objective {
        return this._objectiveService.getById(objectiveId);
    }
}
