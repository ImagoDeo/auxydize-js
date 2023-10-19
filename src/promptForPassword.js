// Code taken from https://github.com/jdx/password-prompt
// Modified to prohibit all-whitespace passwords,
// to remove unnecessary functionality, and to
// do some general cleanup and modernization.

'use strict';

const ansi = require('ansi-escapes');

const { stdin, stderr } = process;

const getInput = (ask) => {
  // masking isn't available without setRawMode
  if (!stdin.setRawMode || process.env.TERM === 'dumb') return notty(ask);
  return new Promise((resolve, _reject) => {
    let input = '';
    stderr.write(ansi.eraseLine);
    stderr.write(ansi.cursorLeft);
    stderr.write(ask);
    stdin.resume();
    stdin.setRawMode(true);

    function stop() {
      stderr.write('\n');
      stdin.removeListener('data', fn);
      stdin.setRawMode(false);
      stdin.pause();
    }

    function enter() {
      stop();
      input = input.replace(/\r$/, '');
      resolve(input);
    }

    function ctrlc() {
      stop();
      process.emit('SIGINT');
    }

    function backspace() {
      if (input.length === 0) return;
      input = input.slice(0, input.length - 1);
      stderr.write(ansi.cursorBackward(1));
      stderr.write(ansi.eraseEndLine);
    }

    function newchar(c) {
      input += c;
      stderr.write('*'.repeat(c.length));
    }

    const fn = function (c) {
      switch (c) {
        case '\u0004': // Ctrl-d
        case '\r':
        case '\n':
          return enter();
        case '\u0003': // Ctrl-c
          return ctrlc();
        default:
          // backspace
          if (c.charCodeAt(0) === 127) return backspace();
          else return newchar(c);
      }
    };
    stdin.on('data', fn);
  });
};

const notty = (ask) => {
  return new Promise((resolve, reject) => {
    const spawn = require('cross-spawn');
    stderr.write(ask);
    const output = spawn.sync('sh', ['-c', 'read -s PASS && echo $PASS'], {
      stdio: ['inherit', 'pipe', 'inherit'],
      encoding: 'utf8',
    });
    stderr.write('\n');
    if (output.error) return reject(output.error);
    resolve(output.stdout.trim());
  });
};

function prompt(ask) {
  stdin.setEncoding('utf8');

  return getInput(ask).then((input) => input.trim() || prompt(ask));
}

module.exports = { prompt };
