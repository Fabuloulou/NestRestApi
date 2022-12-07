import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RewardsBoardModule } from './rewards-board/rewards-board.module';

@Module({
    imports: [RewardsBoardModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
