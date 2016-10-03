// Base gulp based on https://github.com/christianalfoni/react-app-boilerplate

var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var glob = require('glob');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var copy = require('gulp-copy');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
  'react'
];

var browserifyTask = function (options) {

  // Our app bundler
  var appBundler = browserify({
    entries: [options.src], // Only need initial file, browserify finds the rest
    transform: [[babelify, {presets: ['react']}]], // We want to convert JSX to normal javascript
    debug: options.development, // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: options.development // Requirement of watchify
  });

  // The rebundle process
  var rebundle = function () {
    var start = Date.now();
    console.log('Building APP bundle');
    appBundler.bundle()
      .on('error', gutil.log)
      .pipe(source('main.js'))
      .pipe(gulpif(!options.development, streamify(uglify())))
      .pipe(gulp.dest(options.dest))
      .pipe(gulpif(options.development, livereload()))
      .pipe(notify(function () {
        console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
      }));
  };

  // Fire up Watchify when developing
  if (options.development) {
    appBundler = watchify(appBundler);
    appBundler.on('update', rebundle);
  }

  rebundle();

  // We create a separate bundle for our dependencies as they
  // should not rebundle on file changes.
  var vendorsBundler = browserify({
    debug: options.development, // Gives us sourcemapping
    require: dependencies
  });

  // Run the vendor bundle
  var start = new Date();
  console.log('Building VENDORS bundle');
  vendorsBundler.bundle()
    .on('error', gutil.log)
    .pipe(source('vendors.js'))
    .pipe(gulpif(!options.development, streamify(uglify())))
    .pipe(gulp.dest(options.dest))
    .pipe(notify(function () {
      console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
    }));

}

var cssTask = function (options) {
    if (options.development) {
      var run = function () {
        console.log(arguments);
        var start = new Date();
        console.log('Building CSS bundle');
        gulp.src(options.src)
          .pipe(concat('main.css'))
          .pipe(gulp.dest(options.dest))
          .pipe(notify(function () {
            console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
          }));
      };
      run();
      gulp.watch(options.src, run);
    } else {
      gulp.src(options.src)
        .pipe(concat('main.css'))
        .pipe(cssmin())
        .pipe(gulp.dest(options.dest));
    }
}

// Starts our development workflow
gulp.task('default', function () {
  livereload.listen();

  browserifyTask({
    development: true,
    src: './src/main.js',
    dest: './build'
  });

  cssTask({
    development: true,
    src: './styles/**/*.css',
    dest: './build'
  });

  gulp.src(["src/index.html"]).pipe(copy("./build", {prefix: 1}));

  connect.server({
    root: 'build/',
    port: 8889
  });

});

gulp.task('deploy', function () {

  browserifyTask({
    development: false,
    src: './src/main.js',
    dest: './dist'
  });

  cssTask({
    development: false,
    src: './styles/**/*.css',
    dest: './dist'
  });

  gulp.src(["src/index.html"]).pipe(copy("./dist", {prefix: 1}));
});
