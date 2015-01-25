/**
 * + Gulpfile
 * https://github.com/gulpjs/gulp/blob/master/docs/API.md
 * https://github.com/gulpjs/gulp/tree/master/docs/recipes
 * =====================================================================
 */
'use strict';

// node modules
var path = require('path'),
    del  = require('del'),
    gulp = require('gulp'),
    autoprefixer = require('autoprefixer-core');

// external data
var config = require(process.cwd() + '/Config.js'),
    pkg    = require(process.cwd() + '/package.json');

// auto-require gulp plugins
var g = require('auto-plug')({
            config: pkg
        });


/**
 * + Error handling
 */
function handleError(err) {
    g.util.log(err.toString());
    this.emit('end');
}
/* = Error handling */


/**
 * + Stylus / CSS processing
 * =====================================================================
 */

gulp.task('build:css', function() {
    return gulp

        // grab all stylus files in stylus root folder
        .src(config.paths.src + '/*.styl')

        // pipe through stylus processor
        .pipe(g.stylus({
            paths: [
                path.join(config.paths.src, 'imports')
            ],
            sourcemap: {
                inline: true,
                sourceRoot: '.',
                basePath: '.'
            }
        }).on('error', handleError))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init({
            loadMaps: true
        }))

        // pipe through postcss processor
        .pipe(g.postcss([
            autoprefixer(config.autoprefixer)
        ]))

        // pipe through csslint if in development mode
        .pipe(g.csslint(config.csslint))
        .pipe(g.csslint.reporter())

        // write sourcemaps
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed styles
        .pipe(gulp.dest(config.paths.out));

});

/* = Stylus / CSS processing */


/**
 * + Watch Task
 * =====================================================================
 */

gulp.task('watch', function() {

    // show watch info in console
    function logWatchInfo(event) {
        var eventPath = path.relative(config.paths.root, event.path);
        g.util.log('File \'' + g.util.colors.cyan(eventPath) + '\' was ' + g.util.colors.yellow(event.type) + ', running tasks...');
    }

    // watch stylus files
    gulp.watch([
        '**/*.styl'
    ], {
        cwd: config.paths.src
    }, function(event) {
        logWatchInfo(event);
        gulp.start('build');
    });

    // watch package.json
    gulp.watch([
        'package.json'
    ], {
        cwd: config.paths.root
    }, function(event) {
        logWatchInfo(event);
        gulp.start('config-sync');
    });

});

/* = Watch Task */


/**
 * + Clean Tasks
 * =====================================================================
 */

// clean generated content
gulp.task('clean:out', function(done) {
    del(config.paths.out, done);
});

/* = Clean Tasks */


/**
 * + Config sync task
 * =====================================================================
 */

gulp.task('config-sync', function() {
    return gulp
        .src(path.join(config.paths.root, 'bower.json'))
        .pipe(g.configSync(config.configSync))
        .pipe(gulp.dest('.'));
});

/* = Config sync task */


/**
 * + Common tasks
 * =====================================================================
 */

// default task
gulp.task('default', ['build']);

// full build
gulp.task('build', ['build:css']);

// build, serve and watch
gulp.task('dev', ['build'], function() {
    gulp.start('watch');
});

/* = Common tasks */


/* = Gulpfile */
