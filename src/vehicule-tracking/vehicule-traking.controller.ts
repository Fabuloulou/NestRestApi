import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Vehicule } from './models/vehicule.interface';
import { VehiculeTrackingService } from './vehicule-tracking.service';

@ApiTags('vehicule-tracking')
@Controller('vehicule-tracking')
export class VehiculeTrackingController {
    private readonly logger = new Logger(VehiculeTrackingController.name);

    constructor(private _vehiculeTrackingService: VehiculeTrackingService) {}

    @Get('vehicules')
    public getVehicules(): Vehicule[] {
        this.logger.log('GET request received.');
        return this._vehiculeTrackingService.getVehicules();
    }

    @Post('fill-up/:vehiculeId')
    public fillUp(@Param('vehiculeId') vehiculeId: string, @Body() fillUpData: [{ key: string; value: string }]) {
        this.logger.log(`Fill-up received for ${vehiculeId}`);
        return this._vehiculeTrackingService.fillUp(vehiculeId, fillUpData);
    }
}
