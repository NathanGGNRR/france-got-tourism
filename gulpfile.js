'use-strict';
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function(){
    gulp.src('public/assets/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('scss', function(){
    return gulp.src('public/assets/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('watch', function (){
    gulp.watch('public/assets/sass/*.scss', gulp.series('sass'));
});