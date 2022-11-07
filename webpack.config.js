import nodeExternals from 'webpack-node-externals';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import fs from 'fs';

const readFiles = (path, pattern) => {
	const dict = {};
	fs.readdirSync(path)
		.filter((file) => {
			return file.match(pattern);
		})
		.forEach((f) => {
			dict[f.replace(path, '').replace(pattern, '')] = [path + f];
		});
	return dict;
};

const paths = {
	styles: {
		src: './src/public/sass/style.sass',
		dest: './public/style.css',
	},
	js: {
		server: {
			src: './src/server.js',
			config: './src/config.js',
			dest: './server.cjs',
		},
		public: {
			src: readFiles('./src/public/scripts/', /\.js$/),
			dest: './public/scripts/[name].js',
		},
	},
};

export default [
	{
		mode: 'none',
		target: 'node',
		entry: [paths.js.server.src, paths.js.server.config],
		output: {
			filename: paths.js.server.dest,
		},
		externals: [nodeExternals()],
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'string-replace-loader',
							options: {
								search: 'fileURLToPath(import.meta.url)',
								replace: '__filename',
							},
						},
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
							},
						},
					],
				},
				{
					test: /\.pug$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: './views/',
								useRelativePath: true,
							},
						},
					],
				},
			],
		},
		optimization: {
			minimize: true,
			minimizer: [new TerserPlugin()],
		},
	},
	{
		mode: 'none',
		target: 'web',
		entry: paths.js.public.src,
		output: {
			filename: paths.js.public.dest,
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				},
			],
		},
		optimization: {
			minimize: true,
			minimizer: [new TerserPlugin()],
		},
	},
	{
		mode: 'none',
		entry: paths.styles.src,
		module: {
			rules: [
				{
					test: /\.sass$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'sass-loader',
							options: {
								sassOptions: {
									outputStyle: 'compressed',
								},
							},
						},
					],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: paths.styles.dest,
			}),
		],
	},
];
