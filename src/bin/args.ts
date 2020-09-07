import * as program from 'commander';

import { Config } from '../types';
import { defaultConfig } from '../config';
import logger from '../logger';

export function parseCommandLineArgs(): Partial<Config> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const programVersion = '0.1.5';
  program
    .version(programVersion)
    .usage('[options]')
    .option(
      '-a, --authors [email@gmail.com]',
      'Only care about commits from these emails.' +
        wrapInDefault(defaultConfig.authors),
      parseArrayArg(','),
    )
    .option(
      '-s, --since [date]',
      'Analyze data since date (including). \n' +
        '[today|lastweek|thismonth|yyyy-mm-dd]' +
        wrapInDefault(defaultConfig.since),
      String,
    )
    .option(
      '-u, --until [date]',
      'Analyze data until date (excluding). \n' +
        '[today|lastweek|thismonth|yyyy-mm-dd]' +
        wrapInDefault(defaultConfig.until),
      String,
    )
    .option(
      '-r, --repositories [path,other-path]',
      'Git repositories to analyze.' +
        wrapInDefault(defaultConfig.repositories.join(',')),
      parseArrayArg(','),
    )
    .option(
      '-e, --email [emailOther=emailMain]',
      'Group person by email.',
      parseDictArg(',', '='),
    )
    .option(
      '-m, --merge-request [false|true]',
      'Include merge requests into calculation.' +
        wrapInDefault(defaultConfig.countMerges),
      parseBooleanArg,
    )
    .option(
      '-i, --ignore-standuprc',
      'Ignores .standuprc from home directory.' +
        wrapInDefault(defaultConfig.ignoreConfigFile),
      parseArgTrueIfSpecified,
    )
    .option(
      '-j, --json',
      'Reports in JSON format.' + wrapInDefault(defaultConfig.json),
      parseArgTrueIfSpecified,
    )
    .option(
      '-v --verbose',
      'Prints extra stats' + wrapInDefault(defaultConfig.verbose),
      parseArgTrueIfSpecified,
    )
    .option(
      '-D --debug',
      'Prints debug information' + wrapInDefault(defaultConfig.debug),
      parseArgTrueIfSpecified,
    );

  program.on('--help', function () {
    logger.output(`
Examples:

  - Show commits made last workday until today (author taken from git config)

   $ timesheet

  - Show commits from last workday by me@example.com

   $ timesheet -a me@example.com

  For more details, visit https://github.com/tomfa/git-commit-standup
  `);
  });

  program.parse(process.argv);

  const confArgs: Config = {
    since: program.since,
    until: program.until,
    repositories: program.repositories,
    countMerges: program.countMerges,
    emailAliases: program.email,
    ignoreConfigFile: program.ignoreStanduprc,
    authors: program.authors,
    json: program.json,
    verbose: program.verbose,
    debug: program.debug,
  };

  Object.entries(confArgs).forEach(([key, value]) => {
    if (value === undefined) {
      delete confArgs[key];
    }
  });

  return confArgs;
}

const parseBooleanArg = (value: string) =>
  value ? value.trim() === 'true' : undefined;
const parseArrayArg = (separator: string) => (value: string) =>
  value.trim() ? value.split(',').map((v) => v.trim()) : undefined;
const parseDictArg = (separator: string, keyValueSeparator: string) => (
  argumentValue: string,
) => {
  if (!argumentValue) {
    return undefined;
  }
  const map = argumentValue.split(separator).reduce((aliasMap, singleAlias) => {
    const [key, value] = singleAlias.split(keyValueSeparator);
    if (!value) {
      logger.error(
        `Argument ${argumentValue} is invalid.`,
        `Part "${singleAlias}" is missing a "${keyValueSeparator}".`,
      );
      return aliasMap;
    }
    return { ...aliasMap, [key]: value };
  }, {});

  if (Object.keys(map).length === 0) {
    return undefined;
  }
  return map;
};
const parseArgTrueIfSpecified = () => true;
const wrapInDefault = (value: any): string => {
  if (value === undefined) {
    return '';
  }
  if (value instanceof Array) {
    if (value.length === 0) {
      return '';
    }
    // eslint-disable-next-line no-param-reassign
    value = value.join(',');
  }
  return `\n[default: ${value}]`;
};
