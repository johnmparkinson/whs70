const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const browserSync = require('browser-sync');
const cssnano = require('gulp-cssnano');
const del = require('del');
const minify = require('gulp-babel-minify');
const csvtojson = require('gulp-csvtojson');

/* To Do */
// Clean
// Inject

let mode = process.env.NODE_ENV || "preview";

let destRoot = (mode == "preview") ? "_tmp" : "_dist";

const paths = {    
    scripts: {
      src: "src/js/*.js",
      dest: destRoot + "/js"
    },
    styles: {
        src: "src/scss/main.scss",
        dest: destRoot + "/css"
    },
    markup: {
        src: "src/**/*.html",
        dest: destRoot
    },
    images: {
        src: "src/img/**/*.+(png|jpg|gif|svg)",
        dest: destRoot + "/img"
    },
    data: {
        src: "src/data/**/*.json",
        dest: destRoot + "/data"
    },
    assets: {
        src: "src/**/*.+(pdf|xml|webmanifest|txt|ico)",
        dest: destRoot
    },
    csv: {
        src: "src/data/**/*.csv",
        dest: destRoot + "/data"
    }
};

const server = browserSync.create({});

const serve = (done) => {
    server.init({
        server: {
            baseDir: "_tmp/"
        },
        serveStatic: ['_tmp'],
        serveStaticOptions: {
            extensions: ['html']
        },
        middleware: function(req,res,next) {
            r = /^\/physicians\/physician/g;
            if (r.test(req.url)) {
                req.url = '/physicians/physician.html';
            }
            return next();
        }
    });
    done();
}

const compileMarkup = () => {
    return gulp.src(paths.markup.src)
        .pipe(gulp.dest(paths.markup.dest))
}

const compileStyle = () => {
    return gulp.src(paths.styles.src)
        .pipe(sass())
        .pipe(cssnano())
        .pipe(gulp.dest(paths.styles.dest))
}

const compileScript = () => {
    if (mode==="preview") {
        return gulp.src(paths.scripts.src)    
        .pipe(babel())
        .pipe(minify())
        .pipe(gulp.dest(paths.scripts.dest))        
    } else {
        return gulp.src(paths.scripts.src)    
        .pipe(babel())
        .pipe(minify())
        .pipe(gulp.dest(paths.scripts.dest))        
    }
}

const compileImages = () => {
    return gulp.src(paths.images.src)
        .pipe(cache(imagemin({progressive:true, interlaced:true})))
        .pipe(gulp.dest(paths.images.dest))
}

const compileData = () => {
    return gulp.src(paths.data.src)
        .pipe(gulp.dest(paths.data.dest))
}

const compileAssets = () => {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dest))
}

const compileCsv = () => {
    return gulp.src(paths.csv.src)
        .pipe(csvtojson({ toArrayString: true }))
        .pipe(gulp.dest(paths.csv.dest))
}

const clean = (done) => {
    del.sync(destRoot);
    done();
}

const watch = (done) => {
    const watchMarkup = gulp.watch(paths.markup.src, gulp.series(compileMarkup, server.reload));
    const watchStyle = gulp.watch(paths.styles.src, gulp.series(compileStyle, server.reload));
    const watchScript = gulp.watch(paths.scripts.src, gulp.series(compileScript, server.reload));
    const watchImages = gulp.watch(paths.images.src, gulp.series(compileImages, server.reload));
    const watchData = gulp.watch(paths.data.src, gulp.series(compileData, server.reload));
    const watchAssets = gulp.watch(paths.assets.src, gulp.series(compileAssets, server.reload));
    const watchCsv = gulp.watch(paths.csv.src, gulp.series(compileCsv, server.reload));
    done();
};

const compile = gulp.parallel(
    compileMarkup, compileStyle, compileScript, compileImages, compileData, compileAssets, compileCsv
);

gulp.task('default', gulp.series(clean, compile, serve, watch));
gulp.task('build', gulp.series(clean, compile));

function reload(done) {
    server.reload();
    done();
}






