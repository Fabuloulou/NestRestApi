import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Objective } from './models/objective.interface';
const fs = require('fs');

@Injectable()
export class ObjectiveRepository {
    private readonly _logger = new Logger(ObjectiveRepository.name);
    private readonly _objectives_filepath = 'data/objectives.json';

    public loadObjectives(): Objective[] {
        this._logger.debug('Loading all objectives from ' + this._objectives_filepath + '...');
        const raw = fs.readFileSync(this._objectives_filepath, 'utf8');

        try {
            const objectives = JSON.parse(raw);
            this._logger.debug(objectives.length + ' objectives loaded !');
            return objectives;
        } catch (err) {
            throw new InternalServerErrorException('Erreur lors de la lecture des objectifs', err);
        }
    }

    public writeObjectives(objectives: Objective[]): void {
        this._logger.debug('Writting objectives to ' + this._objectives_filepath + '...');
        try {
            fs.writeFileSync(this._objectives_filepath, JSON.stringify(objectives));
            this._logger.debug('Objectives writed !');
        } catch (err) {
            throw new InternalServerErrorException("Erreur lors de l'écriture des objectifs", err);
        }
    }
}
