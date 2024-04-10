export class TrainerDto {
    constructor(public personName: string, public uuid: string, public sessions: TrainingSessionDto[], public trainerScore: TrainingScoreDto) {}
}

export class TrainingSessionDto {
    constructor(public date: Date, public uuid: string, public sessionScore: number) {}
}

export class TrainingSessionFullDto {
    constructor(
        public date: Date,
        public uuid: string,
        public duration: number,
        public sessionScore: number,
        public results: OperationDto[],
        public fullSessionScore: TrainingScoreFullDto,
    ) {}
}

export class OperationDto {
    constructor(public operators: [number, number], public promptedResult: number, public delay: number) {}
}

export class TrainingScoreDto {
    constructor(public totalScore: number, public count: number) {}
}

export class TrainingScoreFullDto {
    constructor(
        public totalScore: number,
        public count: number,
        public totalDuration: number,
        public tableResult: TableTrainingResultDto[],
        public detailedResult: DetailedTrainingResultDto[],
    ) {}
}

export class TableTrainingResultDto {
    constructor(public table: number, public score: number, public delay: number, public count: number) {}
}

export class DetailedTrainingResultDto {
    constructor(public operators: [number, number], public score: number, public delay: number, public count: number) {}
}
