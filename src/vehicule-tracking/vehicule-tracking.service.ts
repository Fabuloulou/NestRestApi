import { Injectable, Logger } from '@nestjs/common';
import { MqttService } from '../utils/mqtt-service';
import { Vehicule } from './models/vehicule.interface';

@Injectable()
export class VehiculeTrackingService {
    private readonly logger = new Logger(VehiculeTrackingService.name);
    private _vehicules: Vehicule[] = [
        {
            ident: 'CN-337-MB',
            brand: 'Renault',
            model: 'Laguna 2',
            name: 'Laguna 2',
            engineType: 'diesel',
        },
        {
            ident: 'FE-129-JR',
            brand: 'Renault',
            model: 'Talisman Estate',
            name: 'Talisman',
            engineType: 'diesel',
        },
        {
            ident: 'GH-935-DD',
            brand: 'eBroh',
            model: 'Bravo GLS',
            name: 'Moto',
            engineType: 'electric',
        },
    ];

    constructor(private _mqttService: MqttService) {}

    public fillUp(vehiculeId: string, fillUpData: { key: string; value: string }[]) {
        const payload = JSON.stringify({
            vehicule: vehiculeId,
            data: fillUpData,
        });
        this.logger.log(`Sending fill-up for ${vehiculeId} to MQTT with payload=${payload}`);

        this._mqttService.publish('vehicule-tracking/fill-up', payload);
    }

    public getVehicules(): Vehicule[] {
        return this._vehicules;
    }
}
