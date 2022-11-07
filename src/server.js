import fs from 'fs';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import usersRouter from './routes/users.js';
import imagesRouter from './routes/images.js';
import postsRouter from './routes/posts.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const app = express();

dotenv.config({ path: _dirname + './../.env' });

app.set('views', path.join(_dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(_dirname, 'public')));

app.use('/users', usersRouter);
app.use('/images', imagesRouter);
app.use('/posts', postsRouter);
app.get('/', (req, res) => res.redirect('/users'));
app.get('*', (req, res) => res.status(404).end('Page not found'));

const privateKey = fs.readFileSync(process.env.CERT_KEY, 'utf8');
const certificate = fs.readFileSync(process.env.CERT_CRT, 'utf8');
const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => console.log(`HTTPS server started on port ${PORT}`));
