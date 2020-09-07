import * as moment from 'moment';

import { Config, HomeDirectoryConfig } from './types';
import { readHomeDirectoryConfig } from './files';

const DATE_FORMAT = 'YYYY-MM-DD';

export const HOMEDIR_CONFIG_FILE_NAME = '.standuprc';

export const defaultConfig: Config = {
  // Include commits since time x
  since: 'lastworkday',
  until: 'now',

  // Include merge requests
  countMerges: true,

  // Git repo
  repositories: ['.'],

  // Aliases of emails for grouping the same activity as one person
  emailAliases: {},

  // Filters authors from output
  authors: [],

  // Ignores .timesheetrc config files
  ignoreConfigFile: false,

  // Logs stats found under parsing
  verbose: false,

  // Report with JSON instead of csv
  json: false,

  // Logs debug information
  debug: false,
};

function parseInputDate(inputDate: string | Date): Date | 'always' {
  if (inputDate instanceof Date) {
    return inputDate;
  }
  switch (inputDate) {
    case 'today':
      return moment().startOf('day').toDate();
    case 'yesterday':
      return moment().startOf('day').subtract(1, 'day').toDate();
    case 'thisweek':
      return moment().startOf('week').toDate();
    case 'lastweek':
      return moment().startOf('week').subtract(1, 'week').toDate();
    case 'thismonth':
      return moment().startOf('month').toDate();
    case 'lastmonth':
      return moment().startOf('month').subtract(1, 'month').toDate();
    case 'lastworkday':
      // eslint-disable-next-line no-case-declarations
      const isMonday = moment().day() === 1;
      if (isMonday) {
        return moment().subtract(72, 'hours').toDate();
      }
      return moment().subtract(24, 'hours').toDate();
    case 'now':
      return moment().toDate();
    case 'always':
      return 'always';
    default:
      // XXX: Moment tries to parse anything, results might be weird
      return moment(inputDate, DATE_FORMAT).toDate();
  }
}

function getHomeDirectoryConfig(): {
  fileConfig: Partial<HomeDirectoryConfig>;
  path: string | null;
} {
  try {
    return {
      fileConfig: readHomeDirectoryConfig(HOMEDIR_CONFIG_FILE_NAME),
      path: `~/${HOMEDIR_CONFIG_FILE_NAME}}`,
    };
  } catch (error) {
    return { fileConfig: {}, path: null };
  }
}

export function getConfig(
  overrides: Partial<Config>,
): { config: Config; configFilePath: string | null } {
  const ignoreConfigFile =
    overrides.ignoreConfigFile === true ||
    (overrides.ignoreConfigFile === undefined &&
      defaultConfig.ignoreConfigFile === true);
  const { fileConfig = {}, path = undefined } =
    (!ignoreConfigFile && getHomeDirectoryConfig()) || {};
  const config = { ...defaultConfig, ...fileConfig, ...overrides };
  config.since = parseInputDate(config.since);
  config.until = parseInputDate(config.until);

  // TODO: Verify that each gitPath is a valid repository
  return { config, configFilePath: path };
}
