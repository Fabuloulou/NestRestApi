import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from './models/user.interface';
const fs = require('fs');

@Injectable()
export class UserRepository {
    private readonly _users_filepath = 'data/users.json';

    public loadUsers(): User[] {
        // TODO : logger
        const raw = fs.readFileSync(this._users_filepath, 'utf8');

        try {
            return JSON.parse(raw);
        } catch (err) {
            console.log('Content: ', raw);
            console.log('Error while loading users. ', err);
            throw new InternalServerErrorException('Erreur lors de la lecture des utilisateurs');
        }
    }

    public writeUsers(users: User[]): void {
        // TODO : logger
        try {
            fs.writeFileSync(this._users_filepath, JSON.stringify(users));
        } catch (err) {
            console.log('Error while writting users. ', err);
            throw new InternalServerErrorException("Erreur lors de l'écriture des utilisateurs");
        }
    }
}
