import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Objective } from './models/objective.interface';
import { ObjectiveRepository } from './objective.repository';

@Injectable()
export class ObjectiveService {
    private readonly _logger = new Logger(ObjectiveService.name);
    public constructor(private _objectiveRepository: ObjectiveRepository) {}

    public getAll(): Objective[] {
        const objectives = this._objectiveRepository.loadObjectives();
        // Marquage des doublons
        objectives.forEach((obj) => {
            if (obj.mergeWith === undefined) {
                objectives.filter((tmp) => tmp.id !== obj.id && tmp.name === obj.name && tmp.mergeWith === undefined).map((tmp) => (tmp.mergeWith = obj.id));
            }
        });
        return objectives;
    }

    public getById(id: number): Objective {
        const filtered: Objective[] = this.getAll().filter((objective) => id === objective.id);
        if (filtered.length === 0) throw new NotFoundException("L'objectif d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }

    public migrateObjectives() {
        this._logger.warn('Migration du fichier des objectifs : Suppression des valeurs de récompense, et des doublons');
        this._objectiveRepository.writeObjectives(
            this.getAll()
                .filter((obj) => obj.mergeWith === undefined)
                .map((obj) => {
                    delete obj.reward;
                    return obj;
                }),
        );
        this._logger.log('Fichier des objectifs migré !');
    }
}
