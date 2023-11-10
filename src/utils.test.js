const { arrayify, expandHome /*, noArraysExcept*/ } = require('./utils');

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

  describe('expandHome', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('pass in undefined, returns undefined', () => {
      expect(expandHome()).toBe(undefined);
    });

    it('pass in a single string, expands home on that string', () => {
      process.env = Object.assign(process.env, {
        HOME: '/test/stuff',
      });

      expect(expandHome('~/more/stuff')).toEqual('/test/stuff/more/stuff');
    });

    it('pass in a single string without anything to expand, returns string', () => {
      process.env = Object.assign(process.env, {
        HOME: '/test/stuff',
      });

      expect(expandHome('/more/stuff/and/things')).toEqual(
        '/more/stuff/and/things',
      );
    });

    it('pass in a couple strings, expands home on all of them', () => {
      process.env = Object.assign(process.env, {
        HOME: '/test/stuff',
      });

      expect(expandHome(['~/more/stuff', '~/other/stuff'])).toEqual([
        '/test/stuff/more/stuff',
        '/test/stuff/other/stuff',
      ]);
    });

    it('pass in a couple strings without anything to expand, returns strings', () => {
      process.env = Object.assign(process.env, {
        HOME: '/test/stuff',
      });

      expect(expandHome(['/more/stuff', '/other/stuff'])).toEqual([
        '/more/stuff',
        '/other/stuff',
      ]);
    });

    // Error behavior?
  });
});
