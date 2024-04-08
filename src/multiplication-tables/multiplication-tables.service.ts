import { Injectable, Logger } from '@nestjs/common';
import { MultiplicationTablesResultDto, OperationDto, TrainingSessionDto } from './models/multiplication-tables.dto';
import { MultiplicationTablesResult, Operation, TrainingSession } from './models/multiplication-tables.model';
import { MultiplicationTablesRepository } from './multiplication-tables.repository';

@Injectable()
export class MultiplicationTablesService {
    private readonly logger = new Logger(MultiplicationTablesService.name);
    constructor(private _repository: MultiplicationTablesRepository) {}

    loadAndComputeScore(person: string): MultiplicationTablesResultDto {
        const entity = this.loadOrDefault(person);
        const totalSuccess = entity.sessions
            .map((session) => session.results.reduce((previous, operation) => previous + (this.isOperationSuccess(operation) ? 1 : 0), 0))
            .reduce((previous, current) => previous + current, 0);
        const score = this.computeScore(totalSuccess, this.countTotalOperations(entity));

        this.logger.debug(`Datas of ${person} loaded. Score = ${score}/100`);

        return new MultiplicationTablesResultDto(
            entity.personName,
            entity.sessions.map((session) => this.mapTrainingSessionToDto(session)),
            score,
        );
    }

    addTrainingSession(person: string, training: TrainingSessionDto): void {
        this.logger.debug(`Adding training session for ${person}...`);
        const entity = this.loadOrDefault(person);
        entity.sessions.push({
            date: training.date,
            results: training.results,
        });
        this._repository.writeResults(entity);
        this.logger.debug(`Training session for ${person} added !`);
    }

    private loadOrDefault(person: string): MultiplicationTablesResult {
        this.logger.debug(`Loading datas of ${person} and computing scores...`);
        let entity: MultiplicationTablesResult;
        try {
            entity = this._repository.loadResults(person);
        } catch (err) {
            this.logger.log(`${person} doesn't exists. Creating one`);
            entity = { personName: person, sessions: [] };
        }
        this.logger.debug(`Data`, entity);
        return entity;
    }

    private isOperationSuccess(operation: Operation): boolean {
        return operation.table * operation.varient === operation.promptedResult;
    }

    private countSuccess(session: TrainingSession): number {
        return session.results.filter((op) => this.isOperationSuccess(op)).length;
    }

    private countTotalOperations(results: MultiplicationTablesResult): number {
        return results.sessions.reduce((previous, session) => previous + session.results.length, 0);
    }

    private computeScore(success: number, operationCount: number): number {
        return success > 0 ? (success * 100) / operationCount : 0;
    }

    private mapTrainingSessionToDto(session: TrainingSession): TrainingSessionDto {
        return new TrainingSessionDto(
            session.date,
            session.results.map((obj) => this.mapOperationToDto(obj)),
            this.computeScore(this.countSuccess(session), session.results.length),
        );
    }

    private mapOperationToDto(operation: Operation): OperationDto {
        return new OperationDto(operation.table, operation.varient, operation.promptedResult);
    }
}
