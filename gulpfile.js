var gulp = require('gulp')
  , babel = require('gulp-babel')
  , connect = require('gulp-connect')
  , rename = require('gulp-rename')
  , browserify = require('gulp-browserify')
  , nodemon = require('gulp-nodemon')

gulp.task('babel', function () {
  gulp.src('src/index.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('browsify', function() {
  gulp.src('src/example-frontend.js')
    .pipe(browserify())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('example/frontend'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  connect.server({
    root: 'example/frontend',
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch('src/**.js', ['babel', 'browsify']);
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'example/backend/index.js'
  , watch: 'src/index.js'
  , ext: 'js'
  , execMap: {
      js: 'babel-node --stage 0'
    }
  })
});

gulp.task('default', ['connect', 'nodemon', 'watch']);