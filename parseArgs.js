function parseArgs(args) {
  if (!args.length) return { mode: 'all' };
  if (!/^--/.test(args[0]))
    throw new Error(`ERROR: Invalid mode argument: ${args[0]}`);
  const mode = args[0].replace(/^--/, '');
  const identifier = args.length === 2 ? args[1] : undefined;
  return { mode, identifier };
}

module.exports = { parseArgs };
