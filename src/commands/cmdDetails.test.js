jest.mock('../db', () => ({ getSecretByAlias: jest.fn() }));
const { getSecretByAlias } = require('../db');

jest.mock('../printer', () => ({ details: jest.fn(), verbose: jest.fn() }));
const { details, verbose } = require('../printer');

const { handler } = require('./cmdDetails');

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

describe('cmdDetails', () => {
  it('should call console.log twice when verbose = true', () => {
    getSecretByAlias.mockImplementation((a) => a);
    details.mockImplementationOnce((s, u) => `${s}, ${u}`);

    const options = {
      alias: 'test',
      unmask: false,
      verbose: true,
    };

    handler(options);

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(verbose).toHaveBeenCalledWith(
      `Fetching secret by alias: ${options.alias}`,
    );
    expect(getSecretByAlias).toHaveBeenCalledWith(options.alias);
    expect(details).toHaveBeenCalledWith(options.alias, options.unmask);
  });

  it('should call console.log once when verbose = false', () => {
    getSecretByAlias.mockImplementation((a) => a);
    details.mockImplementationOnce((s, u) => `${s}, ${u}`);

    const options = {
      alias: 'test',
      unmask: false,
      verbose: false,
    };

    handler(options);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(verbose).not.toHaveBeenCalled();
    expect(getSecretByAlias).toHaveBeenCalledWith(options.alias);
    expect(details).toHaveBeenCalledWith(options.alias, options.unmask);
  });
});
