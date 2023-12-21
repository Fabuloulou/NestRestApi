import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit {
    // private logger = new Logger(MqttService.name);
    private mqttClient;

    onModuleInit() {
        const host = '192.168.1.14';
        const port = '1883';
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

        const connectUrl = `mqtt://${host}:${port}`;

        this.mqttClient = connect(connectUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        // this.mqttClient.on('connect', function () {
        //     this.logger.log('Connected to MQTT Server');
        // });

        // this.mqttClient.on('error', function () {
        //     this.logger.error('Error in connecting to CloudMQTT');
        // });
    }

    publish(topic: string, payload: string): string {
        // this.logger.log('Publishing to ' + topic);
        this.mqttClient.publish(topic, payload);
        return `Publishing to ${topic}`;
    }
}
