import { Identifier } from './identifier';

/**
 * Domain class representing the issuer of a verifiable credential
 */
export class CredentialIssuer {
  private readonly _id: string;
  private readonly _type: string[];
  private readonly _identifierId: string;
  private readonly _name: string;
  private readonly _otherIdentifiers?: Identifier[];

  constructor(
    id: string,
    identifierId: string,
    name: string,
    otherIdentifiers?: Identifier[],
    type: string[] = ['CredentialIssuer'],
  ) {
    this._id = id;
    this._identifierId = identifierId;
    this._name = name;
    this._otherIdentifiers = otherIdentifiers
      ? [...otherIdentifiers]
      : undefined;
    this._type = type;
  }

  get id(): string {
    return this._id;
  }

  get type(): string[] {
    return [...this._type];
  }

  get identifierId(): string {
    return this._identifierId;
  }

  get name(): string {
    return this._name;
  }

  get otherIdentifiers(): Identifier[] | undefined {
    return this._otherIdentifiers ? [...this._otherIdentifiers] : undefined;
  }

  /**
   * Creates a CredentialIssuer from a plain object
   */
  static fromJSON(json: Record<string, any>): CredentialIssuer {
    const otherIdentifiers = json.otherIdentifier
      ? json.otherIdentifier.map((identifierJson: Record<string, any>) =>
          Identifier.fromJSON(identifierJson),
        )
      : undefined;

    return new CredentialIssuer(
      json._id,
      json.id,
      json.name,
      otherIdentifiers,
      json.type || ['CredentialIssuer'],
    );
  }

  /**
   * Creates a plain object representation of the credential issuer
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      _id: this.id,
      type: this.type,
      id: this.identifierId,
      name: this.name,
    };

    if (this.otherIdentifiers) {
      json.otherIdentifier = this.otherIdentifiers.map((identifier) =>
        identifier.toJSON(),
      );
    }

    return json;
  }
}
