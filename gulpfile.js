var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');

gulp.task('compress', function(cb) {
  pump([
    gulp.src('lib-es5/*.js'),
    uglify(),
    rename({ suffix: '.min'}),
    gulp.dest('lib-es5-min')
    ],
    cb
  );
});
