const { series, src, dest } = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var shell = require('shelljs');

const tsProject = ts.createProject('tsconfig.json');

function compile(cb) {
    let errorCount = 0;

    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .on('error', () => {
            ++errorCount;
        })
        .pipe(sourcemaps.mapSources(function(sourcePath, file) {
            let relativePath = '../../';
            let index = sourcePath.indexOf('/');
            while (index > -1) {
                relativePath += '../';
                index = sourcePath.indexOf('/', index + 1);
            }
            return relativePath + 'src/' + sourcePath;
        }))
        .pipe(sourcemaps.write('../sourcemaps'));

    tsResult.pipe(dest('./dist'))
        .on('finish', () => {
            if (errorCount > 0) {
                let error = new Error('Typescript compile failed with ' + errorCount + ' errors!');
                error['showStack'] = false;
                cb(error);
            } else {
                cb();
            }
        });
}
exports.compile = compile;

function compileTests(cb) {
    let errorCount = 0;

    let result = src('./test/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            module: 'commonjs',
            target: 'es6'
        }))
        .on('error', () => {
            ++errorCount;
        })
        .pipe(sourcemaps.mapSources(function(sourcePath, file) {
            let relativePath = '../../';
            let index = sourcePath.indexOf('/');
            while (index > -1) {
                relativePath += '../';
                index = sourcePath.indexOf('/', index + 1);
            }
            return relativePath + 'test/' + sourcePath;
        }))
        .pipe(sourcemaps.write('../sourcemaps'));

    result.pipe(dest('testrun/test'))
        .on('finish', () => {
            if (errorCount > 0) {
                let error = new Error('Typescript compile failed with ' + errorCount + ' errors!');
                error['showStack'] = false;
                cb(error);
            } else {
                cb();
            }
        });
}
exports.compileTests = compileTests;

function prepareTest(cb) {
    src('./dist/**/*.js')
    .pipe(dest('testrun/src'))
    .on('finish', () => {
        src('./sourcemaps/**/*.map')
            .pipe(dest('testrun/sourcemaps'))
            .on('finish', () => cb());
    });
}
exports.prepareTest = series(this.compile, this.compileTests, prepareTest);

function test(cb) {
    if (shell.exec('node ./node_modules/nyc/bin/nyc.js -t ./testrun/.nyc_output --report-dir ./testrun/coverage -a -x gulpfile.js -x test/** -x testrun/coverage/** -r cobertura -r text -r html ./node_modules/.bin/mocha --recursive ./testrun/test').code != 0) {
            let err = new Error('Tests failed!');
        err['showStack'] = false;
        cb(err);
    } else {
        cb();
    }
}
exports.test = series(this.prepareTest, test);

exports.default = this.test;