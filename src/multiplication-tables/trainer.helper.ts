import {
    DetailedTrainingResultDto,
    OperationDto,
    TableTrainingResultDto,
    TrainerDto,
    TrainingScoreFullDto,
    TrainingSessionDto,
    TrainingSessionFullDto,
} from './models/multiplication-tables.dto';
import { Operation, Trainer, TrainingSession } from './models/multiplication-tables.model';

export class TrainerHelper {
    private _trainerDto: TrainerDto;

    public get trainerDto(): TrainerDto {
        return this._trainerDto;
    }

    constructor(private _trainer: Trainer) {
        this._trainerDto = this.mapToTrainerDto(_trainer);
    }

    public fillTrainerScore(): void {
        const operations: Operation[] = this._trainer.sessions.flatMap((session) => session.results);
        this._trainerDto.trainerScore = {
            count: this._trainer.sessions.flatMap((session) => session.results).length,
            totalScore: this.computeOperationsScore(operations),
        };
    }

    public getTrainerDetailedScore(): TrainingScoreFullDto {
        const operations: OperationDto[] = this._trainer.sessions.flatMap((sessions) => sessions.results).map((op) => this.mapOperationToDto(op));
        const score = this.computeOperationsScore(operations);
        return {
            detailedResult: this.getDetailedResult(operations),
            tableResult: this.getTableResult(operations),
            count: operations.length,
            totalScore: score,
            totalDuration: this._trainer.sessions.map((session) => session.duration).reduce((previous, current) => previous + current, 0),
        };
    }

    public getSessionScore(sessionUuid: string): TrainingSessionFullDto | null {
        const session = this._trainer.sessions.find((session) => session.uuid === sessionUuid);
        if (session) {
            const score = this.computeOperationsScore(session.results);
            return {
                uuid: session.uuid,
                date: session.date,
                duration: session.duration,
                sessionScore: score,
                results: session.results.map((op) => this.mapOperationToDto(op)),
                fullSessionScore: {
                    detailedResult: this.getDetailedResult(session.results),
                    tableResult: this.getTableResult(session.results),
                    count: session.results.length,
                    totalScore: score,
                    totalDuration: session.duration,
                },
            };
        } else return null;
    }

    public generateOperations(quantity = 20): [number, number][] {
        const score = [...this.getDetailedResult(this._trainer.sessions.flatMap((sessions) => sessions.results).map((op) => this.mapOperationToDto(op)))];
        this.shuffleArray(score);

        const operations: [number, number][] = [];

        // Adding all operations never prompted
        operations.push(
            ...score
                .filter((res) => res.count === 0)
                .map((elem) => elem.operators)
                .splice(0, quantity - 1),
        );

        // Adding very bad score
        if (operations.length < quantity) {
            operations.push(
                ...score
                    .sort((a, b) => a.score - b.score)
                    .filter((elem) => elem.score < 70)
                    .map((elem) => elem.operators)
                    .splice(0, quantity - operations.length),
            );
        }

        // Avg prompted
        const avgCount = score.reduce((sum, cur) => sum + cur.count, 0) / score.length;

        // Adding operations least prompted
        if (operations.length < quantity) {
            operations.push(
                ...score
                    .sort((a, b) => a.count - b.count)
                    .filter((elem) => elem.count < avgCount)
                    .map((elem) => elem.operators)
                    .splice(0, quantity - operations.length),
            );
        }

        return operations;
    }

    /* mapper */
    private mapToTrainerDto(trainer: Trainer): TrainerDto {
        const allOperations = trainer.sessions.flatMap((sess) => sess.results);
        return {
            personName: trainer.personName,
            uuid: trainer.uuid,
            sessions: trainer.sessions.map((session) => this.mapTrainingSessionToDto(session)),
            trainerScore: {
                totalScore: this.computeOperationsScore(allOperations),
                count: allOperations.length,
            },
        };
    }

    private mapTrainingSessionToDto(session: TrainingSession): TrainingSessionDto {
        return {
            date: session.date,
            uuid: session.uuid,
            sessionScore: this.computeOperationsScore(session.results),
        };
    }

    private mapOperationToDto(operation: Operation): OperationDto {
        return {
            operators: operation.operators,
            promptedResult: operation.promptedResult,
            delay: operation.delay,
        };
    }
    /* END mapper */

    private getTableResult(operations: Operation[]): TableTrainingResultDto[] {
        const result: TableTrainingResultDto[] = [];

        let filteredOperations: Operation[];
        for (let table = 0; table <= 9; table++) {
            filteredOperations = operations.filter((op) => op.operators.includes(table));

            if (filteredOperations.length > 0) {
                result.push({
                    table: table,
                    count: filteredOperations.length,
                    score: this.computeOperationsScore(filteredOperations),
                    delay: this.computeOperationsDelay(filteredOperations),
                });
            }
        }

        return result;
    }

    private getDetailedResult(operations: Operation[]): DetailedTrainingResultDto[] {
        const result: DetailedTrainingResultDto[] = [];

        let filteredOperations: Operation[];
        let exactMatches: Operation[];
        for (let firstOperand = 1; firstOperand <= 9; firstOperand++) {
            filteredOperations = operations.filter((op) => op.operators[0] === firstOperand);
            for (let secondOperand = 1; secondOperand <= 9; secondOperand++) {
                exactMatches = filteredOperations.filter((op) => op.operators[1] === secondOperand);

                result.push({
                    operators: [firstOperand, secondOperand],
                    count: exactMatches.length,
                    score: this.computeOperationsScore(exactMatches),
                    delay: this.computeOperationsDelay(exactMatches),
                });
            }
        }
        return result;
    }

    private computeOperationsDelay(operations: Operation[]): number {
        if (operations.length === 0) return 0;
        else return operations.map((op) => op.delay).reduce((sum, value) => sum + value) / operations.length;
    }

    private computeOperationsScore(operations: Operation[]): number {
        if (operations.length === 0) return 0;
        else return this.computeScore(operations.filter((op) => this.isOperationSuccess(op)).length, operations.length);
    }

    private isOperationSuccess(operation: Operation): boolean {
        return operation.operators[0] * operation.operators[1] === operation.promptedResult;
    }

    private computeScore(success: number, operationCount: number): number {
        return success > 0 ? (success * 100) / operationCount : 0;
    }

    private shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
