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
const minCss       = require('gulp-minify-css');
const rename       = require('gulp-rename');
const sourceMaps   = require('gulp-sourcemaps');
const plumber      = require('gulp-plumber');
const notify      = require('gulp-notify');

const webpack = require('webpack-stream');
// открыть при финальной сборке (пакет группировки медиа-запросов, который ломает сурс-мапс):
// const groupMedia   = require('gulp-group-css-media-queries')

// конфиг файлы
var sources = {
    // css
    css          : './app/src/sass/*.sass',
    destCss      : './app/css',
    // css min
    cssMin       : './app/css-min/**/*',
    destCssMin   : './app/css-min',
    // sass
    anySass      : './app/src/sass/**/*.sass',
    // pug
    pug          : './app/index.pug',
    anyPug       : './app/pages/*.pug',
    // html
    html         : './app/**/*.html',
    // image
    image        : './app/src/images/**/*',
    destImage    : 'dist/images',
    // fonts
    fonts        : './app/fonts/**/*',
    destFonts    : './dist/fonts',
    // files
    files        : './app/files/**/*',
    destFiles    : './dist/files',
    // js
    js           : './app/src/js/*.js',
    destJs       : './app/src/js-bundle',
    anyJs        : './app/src/js/**/*.js',
    // webpack config
    webpackConfig: './webpack.config.js',
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

// функция pug (преобразует index.pug)
gulp.task('pug', function() {
    return src(sources.pug)
        .pipe(plumber(plumberNotify('Pug')))
        .pipe(pug({pretty: true}))
        .pipe(dest('./app/'))
});

// функция anyPug (преобразует все pug файлы)
gulp.task('anyPug', function() {
    return src(sources.anyPug)
        .pipe(plumber(plumberNotify('Pug')))
        .pipe(pug({pretty: true}))
        .pipe(dest('./app/'))
});

// функция sass (конвертирует все sass файлы)
gulp.task('sass', function() {
    return src(sources.css)
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
        .pipe(dest(sources.destCss))
        // вывод минифицированной версии css файла:
        .pipe(minCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourceMaps.write())
        .pipe(dest(sources.destCssMin))
});

// функция js webpack
gulp.task('js', function() {
    return src(sources.js)
        .pipe(plumber(plumberNotify('Js')))
        .pipe(webpack(require(sources.webpackConfig)))
        .pipe(dest(sources.destJs));
})

// функция лайв-сервера
gulp.task('server', function() {
	return src('./app/')
		.pipe(server(serverOptions));
});

// функция watch (слежение за sass и pug файлами)
gulp.task('watch', function() {
	gulp.watch(sources.anySass, gulp.parallel('sass'));
	gulp.watch(sources.pug, gulp.parallel('pug'));
	gulp.watch(sources.anyJs, gulp.parallel('js'));
    // при разработке многостраничного сайта (подключает pug файлы из директории pages):
	gulp.watch(sources.anyPug, gulp.parallel('anyPug'));
});

// функция clean (очищает папку "dist")
gulp.task('clean', function(done) {
    if (fs.existsSync('./dist/')) {
	   return src('./dist/', {read: false})
           .pipe(clean({ force: true }));
    }
    done();
});

// функция default (clean, pug, sass, server, watch)
gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass', 'js'),
    gulp.parallel('server', 'watch')
));

//функция сжатия изображений
gulp.task('images', function() {
    return src(sources.image)
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
    .pipe(dest(sources.destImage))
});

// функция копирования шрифтов в готовую папку dist
gulp.task('fonts', function() {
    return src(sources.fonts)
        .pipe(dest(sources.destFonts));
});

// функция копирования файлов в готовую папку dist
gulp.task('files', function() {
    return src(sources.files)
        .pipe(dest(sources.destFiles));
});

// функция копирования index.html в готовую папку dist
gulp.task('html', function() {
    return src(sources.html)
        .pipe(dest('./dist'));
});

// функция копирования css файлов в готовую папку dist
gulp.task('css', function() {
    return src(sources.cssMin)
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