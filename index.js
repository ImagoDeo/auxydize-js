const readline = require('node:readline/promises')
const { stdin: input, stdout: output } = require('node:process')
const { parseArgs } = require('./parseArgs')
const commands = require('./commands')
const {
  connectDB,
  createAndConnectDB,
  cleanup,
  isDBEncrypted,
  accessDB
} = require('./db')

function gracefulShutdown() {
  console.log(
    '\nClosing any open DB connections and I/O streams and shutting down.'
  )
  cleanup()
  rl.close()
}

const rl = readline.createInterface({ input, output })
rl.on('SIGINT', gracefulShutdown)

process.on('SIGINT', gracefulShutdown)

async function main() {
  try {
    const [_execPath, _filePath, command, ...args] = process.argv
    const options = parseArgs(command, args)

    const init = connectDB()
    if (!init) createAndConnectDB()

    if (isDBEncrypted()) {
      do {
        const password = await rl.question(
          'Secrets database is encrypted. Please enter the password: '
        )
        accessDB(password)
      } while (isDBEncrypted())
    }

    commands[command](options)
  } catch (error) {
    cleanup()
    rl.close()
    console.error(error.message)
    process.exit(1)
  } finally {
    cleanup()
    rl.close()
  }
}

main()
