const chalk = require('chalk');
const columnify = require('columnify');

function prefix(string) {
  return chalk.bgGrey.whiteBright('[aux]') + string;
}

function success(string) {
  return prefix(chalk.green('# ') + string);
}

function status(string) {
  return prefix(chalk.yellow('# ') + string);
}

function error(string) {
  return prefix(chalk.red('# ') + string);
}

function verbose(string) {
  return prefix(chalk.dim.gray('# ') + string);
}

function totpList(list) {
  return columnify(
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
  );
}

function listNameAndAlias(list) {
  return columnify(list, {
    columns: ['name', 'alias'],
    columnSplitter: ' : ',
    headingTransform: (heading) => chalk.underline(heading.toUpperCase()),
  });
}

function details(secret, unmask) {
  const convert = (buffer) => {
    let result = [];
    for (const val of buffer.values()) {
      result.push(val.toString(16).padStart(2, '0'));
    }
    return `[${result.join(', ')}]`;
  };

  const displayable = {
    ...secret,
    secret: unmask ? convert(secret.secret) : '<masked>',
  };

  return columnify(displayable);
}

function sqlLog(string) {
  return prefix(chalk.bold.cyanBright('# ') + 'SQLITE: ' + string);
}

module.exports = {
  success,
  status,
  error,
  verbose,
  totpList,
  listNameAndAlias,
  details,
  sqlLog,
};
