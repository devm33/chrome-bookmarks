var gulp = require('gulp');
var _ = require('lodash');

var batch = require('gulp-batch');
var runSequence = require('run-sequence');
var rimraf = require('rimraf');
var watch = require('gulp-watch');

var src = 'src/';
var dest = 'dist/';
var config = {
    icons: {
        src: src + 'icon.svg',
        sizes: [16, 48, 128],
        svgSize: 16,
    }
};

gulp.task('icons', require('./gulp/icons')(gulp, dest, config.icons));

gulp.task('clean', function(cb) {
    rimraf(dest, cb);
});

gulp.task('build', _.reduce(config, function(result, opts, task) {
    if(Array.isArray(opts.tasks)) {
        return result.concat(opts.tasks);
    }
    result.push(task);
    return result;
}, []));

gulp.task('watch', ['default'], function() {
    _.each(config, function(opts, task) {
        if(opts.src) {
            watch(opts.src, batch(function(){
                if(opts.tasks) {
                    gulp.start.apply(gulp, opts.tasks);
                } else {
                    gulp.start(task);
                }
            }));
        }
    });
});

gulp.task('default', function(cb) {
    runSequence('clean', 'build', cb);
});
