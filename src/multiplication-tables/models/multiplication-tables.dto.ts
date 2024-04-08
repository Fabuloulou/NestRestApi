export class MultiplicationTablesResultDto {
    constructor(public personName: string, public sessions: TrainingSessionDto[], public totalScore: number) {}
}

export class TrainingSessionDto {
    constructor(public date: Date, public results: OperationDto[], public score: number) {}
}

export class OperationDto {
    constructor(public table: number, public varient: number, public promptedResult: number) {}
}
