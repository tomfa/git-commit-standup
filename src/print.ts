import { CommitSummary, CompleteSummary } from './types';
import logger from './logger';

type PrintArgs = { [email: string]: CommitSummary };

export const printAsJSON = (summary: PrintArgs) => {
  logger.output(JSON.stringify(summary, undefined, 2));
};

const getAuthors = (summary: CompleteSummary): string[] => {
  const authorSet = Object.values(summary).reduce((authors, authorSummary) => {
    Object.keys(authorSummary).forEach((author) => authors.add(author));
    return authors;
  }, new Set<string>());
  return Array.from(authorSet);
};
