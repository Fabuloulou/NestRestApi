import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from './models/user.interface';
const fs = require('fs');

@Injectable()
export class UserRepository {
    private readonly _logger = new Logger(UserRepository.name);
    private readonly _users_filepath = 'data/users.json';

    public loadUsers(): User[] {
        this._logger.debug('Loading all user from ' + this._users_filepath + '...');
        const raw = fs.readFileSync(this._users_filepath, 'utf8');

        try {
            const users = JSON.parse(raw);
            this._logger.debug(users.length + ' users loaded !');
            return users;
        } catch (err) {
            throw new InternalServerErrorException('Erreur lors de la lecture des utilisateurs', err);
        }
    }

    public writeUsers(users: User[]): void {
        this._logger.debug('Writting users to ' + this._users_filepath + '...');
        try {
            fs.writeFileSync(this._users_filepath, JSON.stringify(users, this.replacer));
            this._logger.debug('Users writed !');
        } catch (err) {
            throw new InternalServerErrorException("Erreur lors de l'écriture des utilisateurs", err);
        }
    }

    private replacer(key, value) {
        // Delete calculated values
        if (key == 'totalPoints') return undefined;
        else if (key == 'currentPoints') return undefined;
        else return value;
    }
}
