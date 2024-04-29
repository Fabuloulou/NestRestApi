import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit {
    private mqttClient;

    onModuleInit() {
        const host = '192.168.1.47';
        const port = '1883';
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

        const connectUrl = `mqtt://${host}:${port}`;

        this.mqttClient = connect(connectUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });
    }

    publish(topic: string, payload: string): string {
        this.mqttClient.publish(topic, payload);
        return `Publishing to ${topic}`;
    }
}
