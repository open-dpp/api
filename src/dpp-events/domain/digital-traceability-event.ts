import { CredentialIssuer } from './credential-issuer';
import { Event } from './event';

/**
 * Domain class representing a verifiable credential for traceability events
 */
export class DigitalTraceabilityEvent {
  private readonly _id: string;
  private readonly _type: string[];
  private readonly _context: string[];
  private readonly _issuer: CredentialIssuer;
  private readonly _validFrom?: Date;
  private readonly _credentialSubject: Event[];

  constructor(
    id: string,
    issuer: CredentialIssuer,
    credentialSubject: Event[],
    validFrom?: Date,
    type: string[] = ['DigitalTraceabilityEvent', 'VerifiableCredential'],
    context: string[] = [
      'https://www.w3.org/ns/credentials/v2',
      'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
    ],
  ) {
    this._id = id;
    this._issuer = issuer;
    this._credentialSubject = [...credentialSubject];
    this._validFrom = validFrom;
    this._type = type;
    this._context = context;
  }

  get id(): string {
    return this._id;
  }

  get type(): string[] {
    return [...this._type];
  }

  get context(): string[] {
    return [...this._context];
  }

  get issuer(): CredentialIssuer {
    return this._issuer;
  }

  get validFrom(): Date | undefined {
    return this._validFrom ? new Date(this._validFrom.getTime()) : undefined;
  }

  get credentialSubject(): Event[] {
    return [...this._credentialSubject];
  }

  /**
   * Creates a DigitalTraceabilityEvent from a plain object
   */
  static fromJSON(json: Record<string, any>): DigitalTraceabilityEvent {
    const issuer = CredentialIssuer.fromJSON(json.issuer);
    const credentialSubject = json.credentialSubject.map(
      (eventJson: Record<string, any>) => Event.fromJSON(eventJson),
    );

    return new DigitalTraceabilityEvent(
      json._id,
      issuer,
      credentialSubject,
      json.validFrom ? new Date(json.validFrom) : undefined,
      json.type || ['DigitalTraceabilityEvent', 'VerifiableCredential'],
      json['@context'] || [
        'https://www.w3.org/ns/credentials/v2',
        'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
      ],
    );
  }

  /**
   * Creates a plain object representation of the digital traceability event
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      _id: this.id,
      type: this.type,
      '@context': this.context,
      issuer: this.issuer.toJSON(),
      credentialSubject: this.credentialSubject.map((event) => event.toJSON()),
    };

    if (this.validFrom) {
      json.validFrom = this.validFrom;
    }

    return json;
  }
}
