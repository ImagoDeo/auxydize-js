const commands = require('./commands')

function parseArgs(command, args) {
  if (commands[command] === undefined)
    throw new Error(`Unknown command: ${command}`)

  const skipIndices = []

  const options = args.reduce((prev, current, index, args) => {
    if (skipIndices.includes(index)) return prev // This index was previously marked as a value for a prior option. Skip it.
    if (!/^-/.test(current))
      throw new Error(`ERROR: Invalid options syntax: ${current}`)

    const optName = current.replace(/^-/, '')
    if (!commands[command].validOptions.includes(optName))
      throw new Error(`ERROR: Invalid command option: ${optName}`)

    prev[optName] = args[index + 1]
    skipIndices.push(index + 1)
    return prev
  }, {})

  // If this command has required options, make sure they're all here.
  if (commands[command].requiredOptions.length) {
    for (const requiredOption of commands[command].requiredOptions) {
      if (options[requiredOption] === undefined)
        throw new Error(
          `ERROR: Missing required command option: ${requiredOption}`
        )
    }
  }
  return options
}

module.exports = { parseArgs }
