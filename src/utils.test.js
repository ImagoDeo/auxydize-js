const { arrayify /*noArraysExcept*/ } = require('./utils');

describe('utils', () => {
  describe('arrayify', () => {
    it('pass in an array, returns the same array', () => {
      const array = ['test', 'test'];

      const result = arrayify(array);

      expect(result).toBe(array);
    });

    it('pass in undefined, returns an empty array', () => {
      expect(arrayify()).toEqual([]);
    });

    it('pass in a non-array value, comes back in an array', () => {
      const value = 'test';

      const result = arrayify(value);

      expect(result).toEqual([value]);
    });
  });
});
