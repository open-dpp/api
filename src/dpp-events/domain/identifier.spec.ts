import { Identifier } from './identifier'; // Update the import path as needed

describe('Identifier', () => {
  // Test basic constructor and getters
  describe('constructor and getters', () => {
    it('should create an identifier with default type', () => {
      const id = 'test-id';
      const identifier = new Identifier(id);

      expect(identifier.id).toBe(id);
      expect(identifier.type).toEqual(['Identifier']);

      // Ensure type is a copy to prevent modification
      const originalType = identifier.type;
      originalType.push('Modified');
      expect(identifier.type).toEqual(['Identifier']);
    });

    it('should create an identifier with custom types', () => {
      const id = 'test-id';
      const types = ['User', 'Admin'];
      const identifier = new Identifier(id, types);

      expect(identifier.id).toBe(id);
      expect(identifier.type).toEqual(types);

      // Ensure constructor makes a defensive copy
      types.push('Modified');
      expect(identifier.type).toEqual(['User', 'Admin']);
    });
  });

  // Test fromJSON static method
  describe('fromJSON', () => {
    it('should create an identifier from JSON with id and type', () => {
      const json = {
        _id: 'json-id',
        type: ['User', 'Admin'],
      };

      const identifier = Identifier.fromJSON(json);

      expect(identifier.id).toBe('json-id');
      expect(identifier.type).toEqual(['User', 'Admin']);
    });

    it('should create an identifier from JSON with default type when missing', () => {
      const json = {
        _id: 'json-id',
      };

      const identifier = Identifier.fromJSON(json);

      expect(identifier.id).toBe('json-id');
      expect(identifier.type).toEqual(['Identifier']);
    });
  });

  // Test toJSON method
  describe('toJSON', () => {
    it('should convert identifier to JSON correctly', () => {
      const id = 'test-id';
      const types = ['User', 'Admin'];
      const identifier = new Identifier(id, types);

      const json = identifier.toJSON();

      expect(json).toEqual({
        _id: 'test-id',
        type: ['User', 'Admin'],
      });

      // Ensure the returned object is a plain object
      expect(json).not.toBeInstanceOf(Identifier);
    });
  });

  // Test round-trip conversion
  describe('round-trip conversion', () => {
    it('should maintain identity through JSON conversion', () => {
      const original = new Identifier('round-trip-id', ['Special', 'Type']);
      const json = original.toJSON();
      const recreated = Identifier.fromJSON(json);

      expect(recreated.id).toBe(original.id);
      expect(recreated.type).toEqual(original.type);
    });
  });
});
