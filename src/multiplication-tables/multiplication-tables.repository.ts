import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Trainer } from './models/multiplication-tables.model';
const fs = require('fs');

@Injectable()
export class MultiplicationTablesRepository {
    private readonly _logger = new Logger(MultiplicationTablesRepository.name);
    private readonly path = 'data/';
    private readonly baseFileName = 'multiplication-tables.json';

    public loadPersonByName(person: string): Trainer {
        const file = `${this.path}${person}-${this.baseFileName}`;
        this._logger.debug(`Loading datas for ${person} from ${file}...`);
        const raw = fs.readFileSync(file, 'utf8');

        try {
            const results = JSON.parse(raw);
            this._logger.debug(`Data loaded for ${results.personName}. ${results.sessions.length} sessions`);
            return results;
        } catch (err) {
            throw new InternalServerErrorException(`Erreur lors de la lecture des données de ${person}`, err);
        }
    }

    public writeResults(results: Trainer): void {
        const file = `${this.path}${results.personName}-${this.baseFileName}`;
        this._logger.debug(`Writting ${results.personName}'s results to ${file}`);
        try {
            fs.writeFileSync(file, JSON.stringify(results));
            this._logger.debug(`${results.personName}'s results writted !`);
        } catch (err) {
            throw new InternalServerErrorException(`Erreur lors de l'écriture des données de ${results.personName}`, err);
        }
    }
}
