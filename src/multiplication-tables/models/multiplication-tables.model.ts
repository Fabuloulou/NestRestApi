export interface Trainer {
    personName: string;
    uuid: string;
    sessions: TrainingSession[];
    excludedTable?: number;
}

export interface TrainingSession {
    date: Date;
    uuid: string;
    duration: number;
    results: Operation[];
}

export interface Operation {
    operators: [number, number];
    promptedResult: number;
    delay: number;
}
