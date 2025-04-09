/**
 * Domain class representing various identifiers used in the system
 */
export class Identifier {
  private readonly _id: string;
  private readonly _type: string[];

  constructor(id: string, type: string[] = ['Identifier']) {
    this._id = id;
    this._type = type;
  }

  get id(): string {
    return this._id;
  }

  get type(): string[] {
    return [...this._type];
  }

  /**
   * Creates an Identifier from a plain object
   */
  static fromJSON(json: Record<string, any>): Identifier {
    return new Identifier(json._id, json.type || ['Identifier']);
  }

  /**
   * Creates a plain object representation of the identifier
   */
  toJSON(): Record<string, any> {
    return {
      _id: this.id,
      type: this.type,
    };
  }
}
