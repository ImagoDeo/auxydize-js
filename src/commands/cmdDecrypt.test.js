jest.mock('../db', () => ({ decryptDB: jest.fn() }));
const { decryptDB } = require('../db');

const printer = require('../printer');

const { handler } = require('./cmdDecrypt');

let consoleLogSpy;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  consoleLogSpy.mockReset();
});

afterAll(() => {
  consoleLogSpy.mockRestore();
});

describe('cmdDecrypt', () => {
  describe('on success', () => {
    it('should call console.log twice when verbose = true', () => {
      decryptDB.mockImplementationOnce(() => true);

      handler({ verbose: true });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should call console.log with a success message when verbose = false', () => {
      decryptDB.mockImplementationOnce(() => true);

      handler({ verbose: false });

      expect(consoleLogSpy).toHaveBeenCalledWith(printer.success('DB decrypted.'));
    });
  });

  describe('on failure', () => {
    it('should call console.log twice when verbose = true', () => {
      decryptDB.mockImplementationOnce(() => false);

      handler({ verbose: true });

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should call console.log with a failure message when verbose = false', () => {
      decryptDB.mockImplementationOnce(() => false);

      handler({ verbose: false });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        printer.error('DB decryption failed.'),
      );
    });
  });
});
