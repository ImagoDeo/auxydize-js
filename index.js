const readline = require('node:readline')
const { stdin: input, stdout: output } = require('node:process')

const rl = readline.createInterface({ input, output })

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(`Thank you for your valuable feedback: ${JSON.stringify(answer)}`)

  rl.close()
})

/*
 * Interface thoughts:
 * All modes will check if the db is encrypted
 * Default mode will spit out all TOTPs, one per line, with validFor time
 * aux -n <name> will spit out just that TOTP with validFor time
 */
