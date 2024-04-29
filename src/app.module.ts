import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { MultiplicationTablesModule } from './multiplication-tables/multiplication-tables.module';
import { RewardsBoardModule } from './rewards-board/rewards-board.module';
import { VehiculeTrackingModule } from './vehicule-tracking/vehicule-tracking.module';

@Module({
    imports: [
        RewardsBoardModule,
        MultiplicationTablesModule,
        VehiculeTrackingModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'ui'),
            exclude: ['/api*'],
        }),
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}
