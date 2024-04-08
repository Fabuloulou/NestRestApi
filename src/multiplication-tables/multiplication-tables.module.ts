import { Module } from '@nestjs/common';
import { MultiplicationTablesController } from './multiplication-tables.controller';
import { MultiplicationTablesRepository } from './multiplication-tables.repository';
import { MultiplicationTablesService } from './multiplication-tables.service';

@Module({
    providers: [MultiplicationTablesService, MultiplicationTablesRepository],
    controllers: [MultiplicationTablesController],
})
export class MultiplicationTablesModule {}
