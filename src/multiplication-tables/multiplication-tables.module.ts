import { Module } from '@nestjs/common';
import { MqttService } from '../utils/mqtt-service';
import { MultiplicationTablesController } from './multiplication-tables.controller';
import { MultiplicationTablesRepository } from './multiplication-tables.repository';
import { MultiplicationTablesService } from './multiplication-tables.service';

@Module({
    providers: [MqttService, MultiplicationTablesService, MultiplicationTablesRepository],
    controllers: [MultiplicationTablesController],
})
export class MultiplicationTablesModule {}
