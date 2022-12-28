import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Reward } from './models/reward.interface';
const fs = require('fs');

@Injectable()
export class RewardRepository {
    private readonly _logger = new Logger(RewardRepository.name);
    private readonly _rewards_filepath = 'data/rewards.json';

    public loadRewards(): Reward[] {
        this._logger.debug('Loading all rewards from ' + this._rewards_filepath + '...');
        const raw = fs.readFileSync(this._rewards_filepath, 'utf8');

        try {
            const rewards = JSON.parse(raw);
            this._logger.debug(rewards.length + ' rewards loaded !');
            return rewards;
        } catch (err) {
            throw new InternalServerErrorException('Erreur lors de la lecture des récompenses', err);
        }
    }

    public writeRewards(rewards: Reward[]): void {
        this._logger.debug('Writting rewards to ' + this._rewards_filepath + '...');
        try {
            fs.writeFileSync(this._rewards_filepath, JSON.stringify(rewards));
            this._logger.debug('Rewards writed !');
        } catch (err) {
            throw new InternalServerErrorException("Erreur lors de l'écriture des récompenses", err);
        }
    }
}
