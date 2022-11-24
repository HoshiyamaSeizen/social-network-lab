import gulp from 'gulp';
import rollup from 'gulp-rollup';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';

const { src, dest, series, watch } = gulp;
const sass = gulpSass(dartSass);

const paths = {
	styles: {
		src: 'src/public/sass/**/*.sass',
		dest: 'build-gulp/public',
		destDev: 'src/public',
	},
	js: {
		server: {
			src: ['src/**/*.js', '!src/public/**/*.js'],
			dest: 'build-gulp',
			entry: './src/server.js',
			name: 'server.cjs',
		},
		public: {
			src: 'src/public/scripts/**/*.js',
			dest: 'build-gulp/public/scripts',
		},
	},
	pug: {
		src: 'src/views/**/*.pug',
		dest: 'build-gulp/views',
	},
};

// const jsServer = () => {
// 	return src(paths.js.server.src)
// 		.pipe(
// 			rollup({
// 				input: paths.js.server.entry,
// 				output: { format: 'cjs' },
// 				onwarn: (msg) => {
// 					if (!/external dependency/.test(msg)) console.error(msg);
// 				},
// 			})
// 		)
// 		.pipe(concat(paths.js.server.name))
// 		.pipe(uglify())
// 		.pipe(dest(paths.js.server.dest));
// };
const jsPublic = () => {
	return src(paths.js.public.src)
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(dest(paths.js.public.dest));
};

const css = (destination) => {
	return src(paths.styles.src)
		.pipe(
			sass({
				outputStyle: 'compressed',
				sourceMap: false,
			}).on('error', sass.logError)
		)
		.pipe(dest(destination));
};
const cssProd = () => css(paths.styles.dest);
const cssDev = () => css(paths.styles.destDev);
const sasswatch = () => {
	watch(paths.styles.src, cssDev);
};

const views = () => {
	return src(paths.pug.src).pipe(dest(paths.pug.dest));
};

const build = series(cssProd, /*jsServer,*/ jsPublic, views);

export { cssDev, sasswatch, build };
export default build;
