import * as analyzer from './analyzer';
import * as git from './git';
import logger from './logger';

export default { analyze: analyzer.getCommitSummaries, logger, analyzer, git };
