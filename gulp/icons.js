var _ = require('lodash');
var lazypipe = require('lazy-pipe');
var raster = require('gulp-raster');
var rename = require('gulp-rename');
var merge = require('merge-stream');

module.exports = function(gulp, dest, config) {
    return function() {
        return merge(_.map(config.sizes, function(size) {
            return gulp.src(config.src)
            .pipe(raster({ size: (size / config.svgSize) }))
            .pipe(rename('icon-' + size + '.png'));
        }))
        .pipe(gulp.dest(dest));
    };
};
