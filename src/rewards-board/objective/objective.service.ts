import { Injectable, NotFoundException } from '@nestjs/common';
import { Objective } from './models/objective.interface';
import { ObjectiveRepository } from './objective.repository';

@Injectable()
export class ObjectiveService {
    public constructor(private _objectiveRepository: ObjectiveRepository) {}

    public getAll(): Objective[] {
        return this._objectiveRepository.loadObjectives();
    }

    public getById(id: number): Objective {
        const filtered: Objective[] = this.getAll().filter((objective) => id === objective.id);
        if (filtered.length === 0) throw new NotFoundException("L'objectif d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }
}
