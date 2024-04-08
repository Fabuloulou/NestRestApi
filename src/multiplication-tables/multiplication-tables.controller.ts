import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common';
import { MultiplicationTablesResultDto, TrainingSessionDto } from './models/multiplication-tables.dto';
import { MultiplicationTablesService } from './multiplication-tables.service';

@Controller('multiplication-tables')
export class MultiplicationTablesController {
    private readonly logger = new Logger(MultiplicationTablesController.name);

    public constructor(private _service: MultiplicationTablesService) {}

    @Get(':person')
    public getResults(@Param('person') person: string): MultiplicationTablesResultDto {
        return this._service.loadAndComputeScore(person);
    }

    @Patch(':person')
    public addTrainingSession(@Param('person') person: string, @Body() body: TrainingSessionDto): MultiplicationTablesResultDto {
        this._service.addTrainingSession(person, body);
        return this._service.loadAndComputeScore(person);
    }
}
