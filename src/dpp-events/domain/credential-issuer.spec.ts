import { CredentialIssuer } from './credential-issuer';
import { Identifier } from './identifier';

describe('CredentialIssuer', () => {
  const mockId = '123456';
  const mockIdentifierId = 'did:example:123';
  const mockName = 'Test Issuer';
  const mockOtherIdentifiers = [
    new Identifier('id1', ['Identifier', 'CustomType']),
    new Identifier('id2'),
  ];

  describe('constructor', () => {
    it('should create a CredentialIssuer with required properties', () => {
      const issuer = new CredentialIssuer(mockId, mockIdentifierId, mockName);

      expect(issuer.id).toBe(mockId);
      expect(issuer.identifierId).toBe(mockIdentifierId);
      expect(issuer.name).toBe(mockName);
      expect(issuer.type).toEqual(['CredentialIssuer']);
      expect(issuer.otherIdentifiers).toBeUndefined();
    });

    it('should create a CredentialIssuer with all properties', () => {
      const issuer = new CredentialIssuer(
        mockId,
        mockIdentifierId,
        mockName,
        mockOtherIdentifiers,
        ['CredentialIssuer', 'CustomType'],
      );

      expect(issuer.id).toBe(mockId);
      expect(issuer.identifierId).toBe(mockIdentifierId);
      expect(issuer.name).toBe(mockName);
      expect(issuer.type).toEqual(['CredentialIssuer', 'CustomType']);
      expect(issuer.otherIdentifiers).toEqual(mockOtherIdentifiers);
      expect(issuer.otherIdentifiers).not.toBe(mockOtherIdentifiers); // Check defensive copy
    });
  });

  describe('getters', () => {
    it('should return immutable arrays', () => {
      const issuer = new CredentialIssuer(
        mockId,
        mockIdentifierId,
        mockName,
        mockOtherIdentifiers,
      );

      // Attempt to modify returned arrays
      const typeArray = issuer.type;
      typeArray.push('ShouldNotBeAdded');

      const identifiersArray = issuer.otherIdentifiers;
      identifiersArray?.push(new Identifier('shouldNotBeAdded'));

      // Verify original arrays weren't modified
      expect(issuer.type).toEqual(['CredentialIssuer']);
      expect(issuer.otherIdentifiers).toEqual(mockOtherIdentifiers);
    });
  });

  describe('toJSON', () => {
    it('should convert to a plain object without otherIdentifiers', () => {
      const issuer = new CredentialIssuer(mockId, mockIdentifierId, mockName);
      const json = issuer.toJSON();

      expect(json).toEqual({
        _id: mockId,
        id: mockIdentifierId,
        name: mockName,
        type: ['CredentialIssuer'],
      });
    });

    it('should convert to a plain object with otherIdentifiers', () => {
      const issuer = new CredentialIssuer(
        mockId,
        mockIdentifierId,
        mockName,
        mockOtherIdentifiers,
      );
      const json = issuer.toJSON();

      expect(json).toEqual({
        _id: mockId,
        id: mockIdentifierId,
        name: mockName,
        type: ['CredentialIssuer'],
        otherIdentifier: mockOtherIdentifiers.map((id) => id.toJSON()),
      });
    });
  });

  describe('fromJSON', () => {
    it('should create an instance from JSON without otherIdentifiers', () => {
      const json = {
        _id: mockId,
        id: mockIdentifierId,
        name: mockName,
        type: ['CredentialIssuer', 'CustomType'],
      };

      const issuer = CredentialIssuer.fromJSON(json);

      expect(issuer.id).toBe(mockId);
      expect(issuer.identifierId).toBe(mockIdentifierId);
      expect(issuer.name).toBe(mockName);
      expect(issuer.type).toEqual(['CredentialIssuer', 'CustomType']);
      expect(issuer.otherIdentifiers).toBeUndefined();
    });

    it('should create an instance from JSON with otherIdentifiers', () => {
      const json = {
        _id: mockId,
        id: mockIdentifierId,
        name: mockName,
        type: ['CredentialIssuer'],
        otherIdentifier: [
          { _id: 'id1', type: ['Identifier', 'CustomType'] },
          { _id: 'id2', type: ['Identifier'] },
        ],
      };

      const issuer = CredentialIssuer.fromJSON(json);

      expect(issuer.id).toBe(mockId);
      expect(issuer.identifierId).toBe(mockIdentifierId);
      expect(issuer.name).toBe(mockName);
      expect(issuer.type).toEqual(['CredentialIssuer']);
      expect(issuer.otherIdentifiers?.length).toBe(2);
      expect(issuer.otherIdentifiers?.[0].id).toBe('id1');
      expect(issuer.otherIdentifiers?.[0].type).toEqual([
        'Identifier',
        'CustomType',
      ]);
      expect(issuer.otherIdentifiers?.[1].id).toBe('id2');
    });

    it('should use default type if not provided', () => {
      const json = {
        _id: mockId,
        id: mockIdentifierId,
        name: mockName,
      };

      const issuer = CredentialIssuer.fromJSON(json);

      expect(issuer.type).toEqual(['CredentialIssuer']);
    });
  });
});
