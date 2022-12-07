import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RewardsBoardModule } from './rewards-board/rewards-board.module';

@Module({
    imports: [
        RewardsBoardModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'ui'),
            exclude: ['/api*'],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
