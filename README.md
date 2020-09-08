# git-commit-standup

> Hard to remember yesterday when it's standup time. Always be prepared with > standup 

![Photo by Paolo Nicolello on Unsplash](https://github.com/tomfa/git-commit-standup/raw/master/docs/splash.jpg)

## Install

```
yarn global add git-commit-standup

# or with npm

npm install -g git-commit-standup
```

## Basic usage

```bash
$ standup --authors me@example.com

~/repos/frontend
d25b960 #9 Support --since thismonth|lastmonth
d12f92e #7 Support repositories key in config file
7c5da83 #7 Add support for multiple repos

~/repos/backend
964bd3f #7 Add typing to report output
4f589ee #7 Add ability to filter by author
99817d0 #8 Read and use config from ~/.timesheetrc
fa2889a #8 Add type for HomeDirectoryConfig
fdda89c #8 Add code to read json config from home directory
```

The script will automatically assume a 5 day workweek, Monday - Friday. 
If the script is run on Monday, it will show any commits since Friday (last 72 hours). 
Otherwise, it'll show commits from the last 24 hours.  

_Clean commit messages is obviously an advantage._ 

## Options

```
Usage: standup [options]

Options:
  -V, --version                         output the version number
  -a, --authors [email@gmail.com]       Only care about commits from these
                                        emails.
  -s, --since [date]                    Analyze data since date (including).
                                        [today|lastweek|thismonth|yyyy-mm-dd]
                                        [default: lastworkday]
  -u, --until [date]                    Analyze data until date (excluding).
                                        [today|lastweek|thismonth|yyyy-mm-dd]
                                        [default: now]
  -r, --repositories [path,other-path]  Git repositories to analyze.
                                        [default: .]
  -e, --email [emailOther=emailMain]    Group person by email.
  -m, --merge-request [false|true]      Include merge requests into
                                        calculation.
                                        [default: true]
  -i, --ignore-standuprc                Ignores .standuprc from home
                                        directory.
                                        [default: false]
  -j, --json                            Reports in JSON format.
                                        [default: false]
  -v --verbose                          Prints extra stats
                                        [default: false]
  -D --debug                            Prints debug information
                                        [default: false]
  -h, --help                            display help for command

  Examples:

  - Show commits made last workday until today (author taken from git config)

   $ timesheet

  - Show commits from last workday by me@example.com

   $ timesheet -a me@example.com
```

## Config

### .standup config

By default, the repository parameter will check the current git repository.
You can also summarize multiple repositories by adding a config file to your home folder.

The config has the following structure:

```json
{
  "repositories": [
    "/Users/tomfa/repos/notes",
    "/Users/tomfa/repos/app",
    "/Users/tomfa/repos/backend"
  ],
  "authors": ["me@companymail.com"],
  "emailAliases": {
    "me@gmail.com": "me@companymail.com",
    "me@oldworkplace.com": "me@companymail.com"
  }
}
```

The config above will look for commits in three different locations, made
by me@companymail.com, me@gmail.com and me@oldworkplace.com.

## Roadmap

####  [#1: Pulling down issue info from issue tracker](https://github.com/tomfa/git-commit-standup/issues/1)

If you commit with references to an issue tracker, e.g. `#1 my commit message`,
the script can connect and pull down information on those

For more, see [issues labeled roadmap](https://github.com/tomfa/git-commit-standup/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap)
