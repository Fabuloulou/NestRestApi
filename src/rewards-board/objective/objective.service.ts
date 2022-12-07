import { Injectable, NotFoundException } from '@nestjs/common';
import * as filedatas_objectives from 'data/objectives.json';
import { Objective } from './models/objective.interface';

@Injectable()
export class ObjectiveService {
    public getAll(): Objective[] {
        return filedatas_objectives;
    }

    public getById(id: number): Objective {
        const filtered: Objective[] = filedatas_objectives.filter((objective) => id === objective.id);
        if (filtered.length === 0) throw new NotFoundException("L'objectif d'id=" + id + " n'a pas été trouvé");
        else return filtered[0];
    }
}
