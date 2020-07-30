var assert = require('assert');
var exec = require('child_process').exec;

var totalHoursCount;

describe('git-hours', function () {
    it('should output json', function (done) {
        exec('node ./dist/bin/timesheet.js', function (err, stdout, stderr) {
            if (err !== null) {
                throw new Error(stderr);
            }

            console.log('stdout:', stdout);
            var work = JSON.parse(stdout);
            assert.notEqual(work.total.hours.length, 0);
            assert.notEqual(work.total.commits.length, 0);
            totalHoursCount = work.total.hours;
            done();
        });
    });

    it('Should analyse since today', function (done) {
        exec('node ./dist/bin/timesheet.js --since today', function (
            err,
            stdout,
            stderr,
        ) {
            assert.ifError(err);
            var work = JSON.parse(stdout);
            assert.strictEqual(typeof work.total.hours, 'number');
            done();
        });
    });

    it('Should analyse since yesterday', function (done) {
        exec('node ./dist/bin/timesheet.js --since yesterday', function (
            err,
            stdout,
            stderr,
        ) {
            assert.ifError(err);
            var work = JSON.parse(stdout);
            assert.strictEqual(typeof work.total.hours, 'number');
            done();
        });
    });

    it('Should analyse since last week', function (done) {
        exec('node ./dist/bin/timesheet.js --since lastweek', function (
            err,
            stdout,
            stderr,
        ) {
            assert.ifError(err);
            var work = JSON.parse(stdout);
            assert.strictEqual(typeof work.total.hours, 'number');
            done();
        });
    });

    it('Should analyse since a specific date', function (done) {
        exec('node ./dist/bin/timesheet.js --since 2015-01-01', function (
            err,
            stdout,
            stderr,
        ) {
            assert.ifError(err);
            var work = JSON.parse(stdout);
            assert.notEqual(work.total.hours, 0);
            done();
        });
    });

    it('Should analyse as without param', function (done) {
        exec('node ./dist/bin/timesheet.js --since always', function (
            err,
            stdout,
            stderr,
        ) {
            assert.ifError(err);
            var work = JSON.parse(stdout);
            assert.equal(work.total.hours, totalHoursCount);
            done();
        });
    });
});
