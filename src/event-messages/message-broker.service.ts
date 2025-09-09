import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Partitioners, Producer } from 'kafkajs';
import { Item } from '../items/domain/item';

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

  async emitItemUpdated(item: Item) {
    const message = JSON.stringify({
      modelId: item.modelId,
      templateId: item.templateId,
      organizationId: item.ownedByOrganizationId,
      fieldValues: item.dataValues.map((value) => ({
        dataSectionId: value.dataSectionId,
        dataFieldId: value.dataFieldId,
        value: value.value,
        row: value.row,
      })),
      date: new Date(Date.now()).toISOString(),
    });

    await this.producer.send({
      topic: 'item_updated',
      messages: [{ value: message }],
    });
  }
}
