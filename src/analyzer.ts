import * as git from './git';
import logger from './logger';

import {
  Commit,
  CommitSummary,
  Config,
  CompleteSummary,
  RepoAuthorContribution,
} from './types';

export async function getCommitSummaries(
  config: Config,
): Promise<{ [email: string]: CommitSummary }> {
  const { repositories, countMerges, since, until } = config;
  const allCommits = await git.getCommits({
    gitPaths: repositories.map((r) => (typeof r === 'string' ? r : r.path)),
    countMerges,
    since,
    until,
  });

  const commitsByEmail = allCommits.reduce((map, commit) => {
    let email: string = commit.author.email || 'unknown';
    if (config.emailAliases[email] !== undefined) {
      email = config.emailAliases[email];
    }
    if (!map[email]) {
      // eslint-disable-next-line no-param-reassign
      map[email] = [];
    }
    map[email].push(commit);
    return map;
  }, {});
  if (config.authors.length > 0) {
    Object.keys(commitsByEmail).forEach((email) => {
      if (!config.authors.includes(email)) {
        delete commitsByEmail[email];
      }
    });
  }
  Object.keys(commitsByEmail).forEach((email) => {
    const commits = commitsByEmail[email];
    commitsByEmail[email] = {
      commits,
    };
  });
  return commitsByEmail;
}

export function getUserContribution({
  commits,
  firstCommitAdditionInMinutes,
  maxCommitDiffInMinutes,
}: {
  commits: Commit[];
  firstCommitAdditionInMinutes: number;
  maxCommitDiffInMinutes: number;
}): {
  [repository: string]: RepoAuthorContribution;
} {
  if (commits.length === 0) {
    return {};
  }
  if (commits.length === 1) {
    const commit = commits[0];
    return {
      [commit.repo]: {
        [asISOday(commit.date)]: {
          hours: firstCommitAdditionInMinutes / 60,
          commits: 1,
        },
      },
    };
  }

  const sortedCommits = commits.sort(oldestLastSorter);

  const repoSummary: { [repository: string]: RepoAuthorContribution } = {};
  const isoDaySet = new Set<string>();

  const addCommitData = (
    timeInMinutes: number,
    repository: string,
    date: Date,
  ) => {
    const isoDay = asISOday(date);
    isoDaySet.add(isoDay);
    if (!repoSummary[repository]) {
      repoSummary[repository] = {};
    }
    if (!repoSummary[repository][isoDay]) {
      repoSummary[repository][isoDay] = {
        commits: 0,
        hours: 0,
      };
    }
    repoSummary[repository][isoDay].commits += 1;
    repoSummary[repository][isoDay].hours += timeInMinutes / 60;
  };

  let lastTimeStamp = null;

  let numSessionsDetected = 0;
  const repoSet = new Set<string>();
  sortedCommits.forEach((commit) => {
    let diffInMinutes =
      lastTimeStamp && getDiffInMinutes(commit.date, lastTimeStamp);
    lastTimeStamp = commit.date;
    if (diffInMinutes === null || diffInMinutes > maxCommitDiffInMinutes) {
      const { date, time } = getDateInfo(lastTimeStamp);
      const pauseLength = Math.round(diffInMinutes);
      numSessionsDetected += 1;
      logger.verbose(
        `${pauseLength} minutes diff until ${date} ${time}`,
        `– session starts.`,
      );
      diffInMinutes = firstCommitAdditionInMinutes;
    }
    repoSet.add(commit.repo);
    addCommitData(diffInMinutes, commit.repo, commit.date);
  });

  const { author } = sortedCommits[0];
  logger.verbose(
    `\n ${author.name} (${author.email}) had\n`,
    `${numSessionsDetected} sessions constructed using\n`,
    `${sortedCommits.length} commits, made in\n`,
    `${repoSet.size} repositories, done on\n`,
    `${isoDaySet.size} different days.\n`,
  );

  return repoSummary;
}

const oldestLastSorter = (a: Commit, b: Commit) =>
  a.date.getTime() - b.date.getTime();
const getDiffInMinutes = (a: Date, b: Date) => {
  return Math.abs(a.getTime() - b.getTime()) / 1000 / 60;
};
const getDateInfo = (d: Date): { date: string; time: string } => ({
  date: d.toISOString().substr(0, 10),
  time: d.toISOString().substr(11, 5),
});
const asISOday = (d: Date) => d.toISOString().substr(0, 10);
