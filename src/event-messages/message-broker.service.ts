import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Partitioners, Producer } from 'kafkajs';

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ brokers: ['localhost:9094'] });
  private producer: Producer = this.kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendPageViewEvent(
    passportId: string,
    modelId: string,
    templateId: string,
    organizationId: string,
    page: string,
  ) {
    const message = JSON.stringify({
      id: passportId,
      modelId: modelId,
      templateId: templateId,
      ownedByOrganizationId: organizationId,
      page: page,
      date: new Date(Date.now()).toISOString(),
    });

    await this.producer.send({
      topic: 'page_viewed',
      messages: [{ value: message }],
    });
  }
}
