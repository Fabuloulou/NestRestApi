import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MqttService } from '../utils/mqtt-service';
import { TrainerDto, TrainingScoreFullDto, TrainingSessionFullDto } from './models/multiplication-tables.dto';
import { MultiplicationTablesService } from './multiplication-tables.service';

@ApiTags('multiplication-tables')
@Controller('multiplication-tables')
export class MultiplicationTablesController {
    private readonly logger = new Logger(MultiplicationTablesController.name);

    public constructor(private _service: MultiplicationTablesService, private _mqttService: MqttService) {}

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
        const trainer = this._service.loadAndComputeScore(person);

        this._mqttService.publish(
            'multiplication-tables',
            `${person} a terminé une session.\nScore : ${Math.round(trainer.trainerScore.totalScore)}\nScore de la session : ${Math.round(
                trainer.sessions.pop().sessionScore,
            )}.\nErreurs : ${body.results
                .filter((res) => res.promptedResult !== res.operators[0] * res.operators[1])
                .map((res) => `${res.operators[0]} x ${res.operators[1]} : ${res.promptedResult}`)
                .join('\n')}`,
        );

        return trainer;
    }
}
