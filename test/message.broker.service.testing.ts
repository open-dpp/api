export class MessageBrokerServiceTesting {
  public readonly messages = { page_viewed: [] };
  constructor() {}

  getLastEvent(topic: string) {
    return this.messages[topic][this.messages[topic].length - 1];
  }

  async sendPageViewEvent(
    passportId: string,
    modelId: string,
    templateId: string,
    organizationId: string,
    page: string,
  ) {
    const message = {
      id: passportId,
      modelId: modelId,
      templateId: templateId,
      ownedByOrganizationId: organizationId,
      page: page,
      date: new Date(Date.now()).toISOString(),
    };

    this.messages['page_viewed'].push(message);
  }
}
