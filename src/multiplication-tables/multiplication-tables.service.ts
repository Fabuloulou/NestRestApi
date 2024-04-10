import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TrainerDto, TrainingScoreFullDto, TrainingSessionFullDto } from './models/multiplication-tables.dto';
import { Trainer, TrainingSession } from './models/multiplication-tables.model';
import { MultiplicationTablesRepository } from './multiplication-tables.repository';
import { TrainerHelper } from './trainer.helper';

@Injectable()
export class MultiplicationTablesService {
    private readonly logger = new Logger(MultiplicationTablesService.name);
    constructor(private _repository: MultiplicationTablesRepository) {}

    loadAndComputeScore(person: string): TrainerDto {
        this.logger.debug(`Loading ${person}...`);
        const entity: Trainer = this.loadOrDefaultByName(person);
        this.logger.debug(`${person} loaded. Computing scores...`);

        const helper = new TrainerHelper(entity);
        helper.fillTrainerScore();

        this.logger.debug(`Scores for ${person} computed : ${helper.trainerDto.trainerScore.totalScore}/100`);

        return helper.trainerDto;
    }

    loadAndComputeDetailedScore(person: string): TrainingScoreFullDto {
        this.logger.debug(`Loading ${person}...`);
        const entity: Trainer = this.loadOrDefaultByName(person);
        this.logger.debug(`${person} loaded. Computing scores...`);

        const helper = new TrainerHelper(entity);

        this.logger.debug(`Detailed scores loaded for ${person}`);
        return helper.getTrainerDetailedScore();
    }

    loadSession(person: string, sessionUuid: string): TrainingSessionFullDto {
        this.logger.debug(`Loading session with UUID=${sessionUuid} for ${person}...`);
        const entity: Trainer = this.loadOrDefaultByName(person);
        const helper = new TrainerHelper(entity);

        const session: TrainingSessionFullDto | null = helper.getSessionScore(sessionUuid);

        if (session) {
            this.logger.debug(`Session with UUID=${sessionUuid} for ${person} loaded !`);
            return session;
        }
        throw new NotFoundException(sessionUuid, `La session ${sessionUuid} n'existe pas pour la personne ${person}`);
    }

    addTrainingSession(person: string, training: TrainingSessionFullDto): void {
        if (!training || !training.results || training.results.length < 1) {
            this.logger.log(`Training session empty for ${person}. Nothing to do !`);
            return;
        }

        this.logger.debug(`Adding training session for ${person}...`);
        const trainer: Trainer = this.loadOrDefaultByName(person);

        const sessionEntity: TrainingSession = {
            uuid: training.uuid ?? randomUUID(),
            date: training.date,
            duration: training.duration,
            results: training.results.filter((res) => res.promptedResult),
        };
        trainer.sessions.push(sessionEntity);
        this._repository.writeResults(trainer);

        this.logger.debug(`Training session UUID=${sessionEntity.uuid} for ${person} added !`);
    }

    generateOperations(person: string, quantity: number): [number, number][] {
        this.logger.debug(`Loading ${person} to generated customized operations...`);
        const entity: Trainer = this.loadOrDefaultByName(person);
        this.logger.debug(`${person} loaded. Computing scores...`);

        const helper = new TrainerHelper(entity);
        const operations = helper.generateOperations(quantity);
        this.logger.debug(`Customized operations generated for ${person}`);

        return operations;
    }

    private loadOrDefaultByName(person: string): Trainer {
        this.logger.debug(`Loading datas of ${person} and computing scores...`);
        let entity: Trainer;
        try {
            entity = this._repository.loadPersonByName(person);
        } catch (err) {
            this.logger.log(`${person} doesn't exists. Creating one`);
            entity = { personName: person, uuid: randomUUID(), sessions: [] };
        }
        return entity;
    }
}
