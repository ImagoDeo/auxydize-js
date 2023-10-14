const chalk = require('chalk');
const columnify = require('columnify');

function success(string) {
  console.log(chalk.green('SUCCESS: ') + string);
}

function status(string) {
  console.log(chalk.yellow('STATUS: ') + string);
}

function totpList(list) {
  console.log(
    columnify(
      list.map(({ name, totp, validFor = null, index = 0 }) => {
        const indexString =
          index < 0
            ? `previous ${index}`
            : index > 0
            ? `next +${index}`
            : 'current';
        const validForString = validFor ? `${validFor}s` : undefined;
        return {
          name: chalk.bold(name),
          code: chalk.yellowBright(totp),
          lifetime: chalk.greenBright(validForString),
          index: chalk.dim(indexString),
        };
      }),
      {
        columns: ['code', 'name', 'lifetime', 'index'],
        config: {
          index: {
            showHeaders: false,
          },
        },
        headingTransform: (heading) => chalk.underline(heading.toUpperCase()),
      },
    ),
  );
}

function listNameAndAlias(list) {
  console.log(
    columnify(list, {
      columns: ['name', 'alias'],
      columnSplitter: ' : ',
      headingTransform: (heading) => chalk.underline(heading.toUpperCase()),
    }),
  );
}

function details(secret, mask) {
  const convert = (buffer) => {
    let result = [];
    for (const val of buffer.values()) {
      result.push(val);
    }
    return `[${result.join(', ')}]`;
  };

  const displayable = {
    ...secret,
    secret: mask ? '<masked>' : convert(secret.secret),
  };

  console.log(columnify(displayable));
}

function verboseSQLiteLogger(string) {
  console.log(chalk.bold().cyanBright('SQLITE: ') + string);
}

module.exports = {
  success,
  status,
  totpList,
  listNameAndAlias,
  details,
  verboseSQLiteLogger,
};
