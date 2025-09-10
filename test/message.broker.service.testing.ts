import { Item } from '../src/items/domain/item';

export class MessageBrokerServiceTesting {
  public readonly messages = { item_updated: [] };
  constructor() {}

  getEventWithDate(topic: string, date: Date) {
    return this.messages[topic].find((message) => {
      return message.date === date.toISOString();
    });
  }

  async emitItemUpdated(item: Item) {
    const message = {
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
    };

    this.messages['item_updated'].push(message);
  }
}
