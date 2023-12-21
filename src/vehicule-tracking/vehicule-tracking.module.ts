import { Module } from '@nestjs/common';
import { MqttService } from '../utils/mqtt-service';
import { VehiculeTrackingService } from './vehicule-tracking.service';
import { VehiculeTrackingController } from './vehicule-traking.controller';

@Module({
    providers: [MqttService, VehiculeTrackingService],
    controllers: [VehiculeTrackingController],
})
export class VehiculeTrackingModule {}
