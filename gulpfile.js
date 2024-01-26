//дефолтные переменные gulp
const { src, dest, watch, parallel, series } = require('gulp');

//объявление переменных пакетов
const gulp         = require('gulp');
const pug          = require('gulp-pug');
const sass         = require('gulp-sass')(require('sass'));
const imagemin     = require('gulp-imagemin');
const server       = require('gulp-server-livereload');
const clean        = require('gulp-clean');
const fs           = require('fs');
const concat       = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const minCss       = require('gulp-minify-css')
const rename       = require('gulp-rename')
const sourceMaps   = require('gulp-sourcemaps')
const plumber      = require('gulp-plumber')
const notify      = require('gulp-notify')
// открыть при финальной сборке (пакет группировки медиа-запросов, который ломает сурс-мапс):
// const groupMedia   = require('gulp-group-css-media-queries')

// конфиг файлы
var config = {
    srcCss   : './app/src/sass/*.sass',
    srcPug   : './app/index.pug',
    destCss  : './app/css',
    destCssMin  : './app/css-min',
    srcImage : './app/src/images/**/*',
    destImage: 'dist/images',
    anySass  : './app/src/sass/**/*.sass',
    anyPug   : './app/**/*.pug',
    srcFonts : './app/fonts/**/*',
    destFonts : './dist/fonts',
    srcFiles : './app/files/**/*',
    destFiles : './dist/files'
}

// настройки сервера
const serverOptions = {
			livereload: true,
			open: true
	}

// функция настроек plumber
const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
    }),
    };
};

// функция pug (преобразует index.pug файл)
gulp.task('pug', function() {
    return gulp
        .src(config.srcPug)
        .pipe(plumber(plumberNotify('Pug')))
        .pipe(pug({pretty: true}))
        .pipe(dest('./app/'))
//        .pipe(browserSync.stream())
});

// функция sass (конвертирует все sass файлы)
gulp.task('sass', function() {
    return gulp
        .src(config.srcCss)
        .pipe(plumber(plumberNotify('Sass')))
        .pipe(sourceMaps.init())
//        вывод экспандед версии css файла:
        .pipe(sass({
            outputStyle : 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourceMaps.write())
//        следующий пакет ломает sourceMaps, но группирует медиа-запросы:
//        .pipe(groupMedia())
        .pipe(dest(config.destCss))
        // вывод минифицированной версии css файла:
        .pipe(minCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourceMaps.write())
        .pipe(dest(config.destCssMin))
})


// функция лайв-сервера
gulp.task('server', function() {
	return gulp.src('./app/')
		.pipe(server(serverOptions));
});

// функция watch (слежение за sass и pug файлами)
gulp.task('watch', function() {
	gulp.watch(config.anySass, gulp.parallel('sass'));
	gulp.watch(config.anyPug, gulp.parallel('pug'));
//    gulp.watch('./src/**/*', gulp.parallel('images));
});

// функция clean (очищает папку "dist")
gulp.task('clean', function(done) {
    if (fs.existsSync('./dist/')) {
	   return gulp.src('./dist/', {read: false})
           .pipe(clean({ force: true }));
    }
    done();
});

// функция default (clean, pug, sass, server, watch)
gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass'),
    gulp.parallel('server', 'watch')
));

//функция сжатия изображений
gulp.task('images', function() {
    return src(config.srcImage)
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest(config.destImage))
});

// функция копирования шрифтов в готовую папку dist
gulp.task('fonts', function() {
    return gulp
        .src(config.srcFonts)
        .pipe(dest(config.destFonts));
});

// функция копирования файлов в готовую папку dist
gulp.task('files', function() {
    return gulp
        .src(config.srcFiles)
        .pipe(dest(config.destFiles));
});

// функция копирования index.html в готовую папку dist
gulp.task('html', function() {
    return gulp
        .src('./app/index.html')
        .pipe(dest('./dist'));
});

// функция копирования css файлов в готовую папку dist
gulp.task('css', function() {
    return gulp
        .src('./app/css-min/**/*')
        .pipe(dest('./dist/css-min'));
});


// функция build
gulp.task('build', gulp.series(
    'clean',
    'html',
    'css',
    'files',
    'fonts',
    'images'
));