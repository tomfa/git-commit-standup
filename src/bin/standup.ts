#!/usr/bin/env node

import { getConfig } from '../config';
import { getCommitSummaries } from '../analyzer';
import { printAsJSON } from '../print';
import logger from '../logger';
import { parseCommandLineArgs } from './args';

const printReport = () => {
  const commandLineArgs = parseCommandLineArgs();
  const { config, configFilePath } = getConfig(commandLineArgs);
  if (!config.debug) {
    logger.debug = () => {};
  }
  if (!config.verbose) {
    logger.verbose = () => {};
  }
  if (configFilePath) {
    logger.debug(
      `Using config file ${configFilePath}. Can be skipped with flag -i `,
    );
  }
  logger.debug('Config', config);

  getCommitSummaries(config).then(printAsJSON);
};

printReport();
