var gulp = require('gulp');
var _ = require('lodash');

var $ = require('gulp-load-plugins')();

var src = 'extension/src/';
var dest = 'extension/built/';
var config = {
    icons: {
        src: src + 'icon.svg',
        sizes: [16, 48, 128],
        svgSize: 16,
        tasks: [] // populated by task def loop
    }
};

// icons tasks
_.forEach(config.icons.sizes, function(size) {
    var task = 'icon-' + size;
    config.icons.tasks.push(task);
    gulp.task(task, function() {
        return gulp.src(config.icons.src)
        .pipe($.raster({ scale: size / config.icons.svgSize }))
        .pipe($.rename(task + '.png'))
        .pipe(gulp.dest(dest));
    });
});

gulp.task('build', _.reduce(config, function(result, opts, task) {
    if(Array.isArray(opts.tasks)) {
        return result.concat(opts.tasks);
    }
    result.push(task);
    return result;
}, []));

gulp.task('default', ['build']);
