export interface MultiplicationTablesResult {
    personName: string;
    sessions: TrainingSession[];
}

export interface TrainingSession {
    date: Date;
    results: Operation[];
}

export interface Operation {
    table: number;
    varient: number;
    promptedResult: number;
}
