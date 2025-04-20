/**
 * Domain class representing an event in the system
 */
export class Event {
  private readonly _id: string;

  constructor(id: string) {
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Creates an Event from a plain object
   */
  static fromJSON(json: Record<string, any>): Event {
    return new Event(json._id);
  }

  /**
   * Creates a plain object representation of the event
   */
  toJSON(): Record<string, any> {
    return {
      _id: this.id,
    };
  }
}
