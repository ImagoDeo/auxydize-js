jest.mock('../generator', () => ({ generateTOTP: jest.fn() }));
const { generateTOTP } = require('../generator');

jest.mock('../printer', () => ({ verbose: jest.fn(), totpList: jest.fn() }));
const printer = require('../printer');

jest.mock('../fetcher', () => ({ fetchSecrets: jest.fn() }));
const { fetchSecrets } = require('../fetcher');

const { handler } = require('./cmdGet');

let consoleLogSpy;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  consoleLogSpy.mockRestore();
});

describe('cmdGet', () => {
  it('should call console.log three times when verbose = true', () => {
    fetchSecrets.mockImplementation(() => [{ name: 'test', issuer: 'TEST' }]);
    generateTOTP.mockImplementation(({ name }) => ({
      totp: name + 'TOTP',
      validFor: name + 'validFor',
    }));

    const options = {
      alias: 'test',
      partial: false,
      verbose: true,
    };

    handler(options);

    expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    expect(printer.totpList).toHaveBeenCalledWith([
      {
        name: 'test',
        issuer: 'TEST',
        totp: 'testTOTP',
        validFor: 'testvalidFor',
      },
    ]);
  });

  it('should call console.log once when verbose = false', () => {
    fetchSecrets.mockImplementation(() => [{ name: 'test', issuer: 'TEST' }]);
    generateTOTP.mockImplementation(({ name }) => ({
      totp: name + 'TOTP',
      validFor: name + 'validFor',
    }));

    const options = {
      alias: 'test',
      partial: false,
      verbose: false,
    };

    handler(options);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(printer.totpList).toHaveBeenCalledWith([
      {
        name: 'test',
        issuer: 'TEST',
        totp: 'testTOTP',
        validFor: 'testvalidFor',
      },
    ]);
  });
});
