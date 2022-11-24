import fs from 'fs';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import Rollbar from 'rollbar';
import { fileURLToPath } from 'url';

import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import imagesRouter from './routes/images.js';
import postsRouter from './routes/posts.js';
import messageRouter from './routes/messages.js';

import { initSockets } from './socket.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const app = express();

dotenv.config({ path: _dirname + './../.env' });

let rollbar;
if (process.env.ROLLBAR) {
	rollbar = new Rollbar({
		accessToken: process.env.ROLLBAR_TOKEN,
		captureUncaught: true,
		captureUnhandledRejections: true,
	});
}

app.set('views', path.join(_dirname, 'views'));
app.set('view engine', 'pug');

app.use(
	cors({
		origin: 'https://localhost:4200',
		credentials: true,
		optionSuccessStatus: 200,
	})
);
app.use(cookieParser());
app.use(express.json());
app.use('/public', express.static(path.join(_dirname, 'public')));

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/images', imagesRouter);
app.use('/posts', postsRouter);
app.use('/messages', messageRouter);
app.get('/', (req, res) => res.redirect('/users'));
app.get('*', (req, res) => res.status(404).end('Route not found'));
app.post('*', (req, res) => res.status(404).end('Route not found'));

const privateKey = fs.readFileSync(process.env.CERT_KEY, 'utf8');
const certificate = fs.readFileSync(process.env.CERT_CRT, 'utf8');
const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app);

initSockets(httpsServer);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
	console.log(`HTTPS server started on port ${PORT}`);
	rollbar?.info(`HTTPS server started on port ${PORT}`);
});
