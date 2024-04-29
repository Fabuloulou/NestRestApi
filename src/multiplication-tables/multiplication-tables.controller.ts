import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common';
import { TrainerDto, TrainingScoreFullDto, TrainingSessionFullDto } from './models/multiplication-tables.dto';
import { MultiplicationTablesService } from './multiplication-tables.service';

@Controller('multiplication-tables')
export class MultiplicationTablesController {
    private readonly logger = new Logger(MultiplicationTablesController.name);

    public constructor(private _service: MultiplicationTablesService) {}

    @Get(':person')
    public getTrainer(@Param('person') person: string): TrainerDto {
        return this._service.loadAndComputeScore(person);
    }
    @Get(':person/fullscore')
    public getTrainerFullResult(@Param('person') person: string): TrainingScoreFullDto {
        return this._service.loadAndComputeDetailedScore(person);
    }

    @Get(':person/session/:sessionUuid')
    public getTrainerSession(@Param('person') person: string, @Param('sessionUuid') sessionUuid: string): TrainingSessionFullDto {
        return this._service.loadSession(person, sessionUuid);
    }

    @Get(':person/operations/:quantity')
    public getTrainerOperations(@Param('person') person: string, @Param('quantity') quantity: number): [number, number][] {
        return this._service.generateOperations(person, quantity);
    }

    @Patch(':person')
    public addTrainingSession(@Param('person') person: string, @Body() body: TrainingSessionFullDto): TrainerDto {
        this._service.addTrainingSession(person, body);
        return this._service.loadAndComputeScore(person);
    }
}
