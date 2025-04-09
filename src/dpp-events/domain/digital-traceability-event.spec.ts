import { DigitalTraceabilityEvent } from './digital-traceability-event';
import { CredentialIssuer } from './credential-issuer';
import { Event } from './event';
import { Identifier } from './identifier';

describe('DigitalTraceabilityEvent', () => {
  // Create mock data for testing
  const mockId = 'event123';
  const mockValidFrom = new Date('2023-01-01T00:00:00Z');

  // Create mock issuer
  const mockIssuer = new CredentialIssuer(
    'issuer123',
    'did:example:456',
    'Test Issuer',
    [new Identifier('identifier123', ['Identifier'])],
  );

  // Create mock events
  const mockEvents = [new Event('event1'), new Event('event2')];

  describe('constructor', () => {
    it('should create a DigitalTraceabilityEvent with required properties', () => {
      const traceabilityEvent = new DigitalTraceabilityEvent(
        mockId,
        mockIssuer,
        mockEvents,
      );

      expect(traceabilityEvent.id).toBe(mockId);
      expect(traceabilityEvent.issuer).toEqual(mockIssuer);
      expect(traceabilityEvent.credentialSubject).toEqual(mockEvents);
      expect(traceabilityEvent.type).toEqual([
        'DigitalTraceabilityEvent',
        'VerifiableCredential',
      ]);
      expect(traceabilityEvent.context).toEqual([
        'https://www.w3.org/ns/credentials/v2',
        'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
      ]);
      expect(traceabilityEvent.validFrom).toBeUndefined();
    });

    it('should create a DigitalTraceabilityEvent with all properties', () => {
      const customType = [
        'DigitalTraceabilityEvent',
        'VerifiableCredential',
        'CustomType',
      ];
      const customContext = ['https://custom-context.org'];

      const traceabilityEvent = new DigitalTraceabilityEvent(
        mockId,
        mockIssuer,
        mockEvents,
        mockValidFrom,
        customType,
        customContext,
      );

      expect(traceabilityEvent.id).toBe(mockId);
      expect(traceabilityEvent.issuer).toEqual(mockIssuer);
      expect(traceabilityEvent.credentialSubject).toEqual(mockEvents);
      expect(traceabilityEvent.validFrom).toEqual(mockValidFrom);
      expect(traceabilityEvent.type).toEqual(customType);
      expect(traceabilityEvent.context).toEqual(customContext);
    });
  });

  describe('getters', () => {
    it('should return immutable arrays and dates', () => {
      const traceabilityEvent = new DigitalTraceabilityEvent(
        mockId,
        mockIssuer,
        mockEvents,
        mockValidFrom,
      );

      // Attempt to modify returned arrays
      const typeArray = traceabilityEvent.type;
      typeArray.push('ShouldNotBeAdded');

      const contextArray = traceabilityEvent.context;
      contextArray.push('should-not-be-added');

      const eventsArray = traceabilityEvent.credentialSubject;
      eventsArray.push(new Event('should-not-be-added'));

      // Attempt to modify returned date
      const validFrom = traceabilityEvent.validFrom;
      validFrom?.setFullYear(2025);

      // Verify original values weren't modified
      expect(traceabilityEvent.type).toEqual([
        'DigitalTraceabilityEvent',
        'VerifiableCredential',
      ]);
      expect(traceabilityEvent.context).toEqual([
        'https://www.w3.org/ns/credentials/v2',
        'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
      ]);
      expect(traceabilityEvent.credentialSubject).toEqual(mockEvents);
      expect(traceabilityEvent.validFrom).toEqual(mockValidFrom);
    });
  });

  describe('toJSON', () => {
    it('should convert to a plain object without validFrom', () => {
      const traceabilityEvent = new DigitalTraceabilityEvent(
        mockId,
        mockIssuer,
        mockEvents,
      );

      const json = traceabilityEvent.toJSON();

      expect(json).toEqual({
        _id: mockId,
        type: ['DigitalTraceabilityEvent', 'VerifiableCredential'],
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
        ],
        issuer: mockIssuer.toJSON(),
        credentialSubject: mockEvents.map((event) => event.toJSON()),
      });
    });

    it('should convert to a plain object with validFrom', () => {
      const traceabilityEvent = new DigitalTraceabilityEvent(
        mockId,
        mockIssuer,
        mockEvents,
        mockValidFrom,
      );

      const json = traceabilityEvent.toJSON();

      expect(json).toEqual({
        _id: mockId,
        type: ['DigitalTraceabilityEvent', 'VerifiableCredential'],
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
        ],
        issuer: mockIssuer.toJSON(),
        credentialSubject: mockEvents.map((event) => event.toJSON()),
        validFrom: mockValidFrom,
      });
    });
  });

  describe('fromJSON', () => {
    it('should create an instance from JSON without validFrom', () => {
      const json = {
        _id: mockId,
        type: ['DigitalTraceabilityEvent', 'CustomType'],
        '@context': ['https://custom-context.org'],
        issuer: mockIssuer.toJSON(),
        credentialSubject: mockEvents.map((event) => event.toJSON()),
      };

      const traceabilityEvent = DigitalTraceabilityEvent.fromJSON(json);

      expect(traceabilityEvent.id).toBe(mockId);
      expect(traceabilityEvent.type).toEqual([
        'DigitalTraceabilityEvent',
        'CustomType',
      ]);
      expect(traceabilityEvent.context).toEqual(['https://custom-context.org']);
      expect(traceabilityEvent.issuer).toEqual(mockIssuer);
      expect(traceabilityEvent.credentialSubject.length).toBe(
        mockEvents.length,
      );
      expect(traceabilityEvent.validFrom).toBeUndefined();
    });

    it('should create an instance from JSON with validFrom', () => {
      const json = {
        _id: mockId,
        type: ['DigitalTraceabilityEvent', 'VerifiableCredential'],
        '@context': [
          'https://www.w3.org/ns/credentials/v2',
          'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
        ],
        issuer: mockIssuer.toJSON(),
        credentialSubject: mockEvents.map((event) => event.toJSON()),
        validFrom: mockValidFrom.toISOString(),
      };

      const traceabilityEvent = DigitalTraceabilityEvent.fromJSON(json);

      expect(traceabilityEvent.id).toBe(mockId);
      expect(traceabilityEvent.issuer).toEqual(mockIssuer);
      expect(traceabilityEvent.credentialSubject.length).toBe(
        mockEvents.length,
      );
      expect(traceabilityEvent.validFrom instanceof Date).toBe(true);
      expect(traceabilityEvent.validFrom?.toISOString()).toBe(
        mockValidFrom.toISOString(),
      );
    });

    it('should use default values if not provided', () => {
      const json = {
        _id: mockId,
        issuer: mockIssuer.toJSON(),
        credentialSubject: mockEvents.map((event) => event.toJSON()),
      };

      const traceabilityEvent = DigitalTraceabilityEvent.fromJSON(json);

      expect(traceabilityEvent.type).toEqual([
        'DigitalTraceabilityEvent',
        'VerifiableCredential',
      ]);
      expect(traceabilityEvent.context).toEqual([
        'https://www.w3.org/ns/credentials/v2',
        'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
      ]);
    });
  });
});
