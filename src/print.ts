import { Commit, CommitSummary, CompleteSummary } from './types';
import logger from './logger';

type PrintArgs = { [email: string]: CommitSummary };

export const printAsJSON = (summary: PrintArgs) => {
  logger.output(JSON.stringify(summary, undefined, 2));
};

export const print = (summary: PrintArgs) => {
  const authors = Object.keys(summary);
  authors.forEach((a) => printAuthor(a, summary[a]));
};

const printAuthor = (author: string, summary: CommitSummary) => {
  const repos = new Set(summary.commits.map((s) => s.repo));
  const newestLastSorter = (a: Commit, b: Commit) =>
    b.date.getTime() - a.date.getTime();
  repos.forEach((repo) => {
    const commits = summary.commits
      .filter((c) => c.repo === repo)
      .sort(newestLastSorter);
    if (commits.length > 0) {
      logger.output(`\n:: ${repo}`);
      commits.forEach((commit) => {
        const shortSha = commit.sha.substr(0, 7);
        const shortMsg = commit.message.split('\n')[0];
        logger.output(`${shortSha} ${shortMsg}`);
      });
    }
  });
};

const getAuthors = (summary: CompleteSummary): string[] => {
  const authorSet = Object.values(summary).reduce((authors, authorSummary) => {
    Object.keys(authorSummary).forEach((author) => authors.add(author));
    return authors;
  }, new Set<string>());
  return Array.from(authorSet);
};
