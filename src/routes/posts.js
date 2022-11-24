import express from 'express';
import fs from 'fs';

import { auth, authAdmin } from '../middleware/auth.js';

const postsFileDefault = './data/posts.json';
const usersFileDefault = './data/users.json';
const imagesFileDefault = './data/images.json';

const router = express.Router();

export const renderPage = (
	req,
	res,
	usersFile = usersFileDefault,
	postsFile = postsFileDefault
) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	const req_user = users.find((user) => user.id === +req.params.id);
	const friends = users.map((user) => user.id).filter((id) => req_user.friends.includes(id));
	friends.push(+req.params.id);
	const posts = JSON.parse(fs.readFileSync(postsFile))
		.filter((post) => friends.includes(post.author))
		.map((post) => {
			post.author = users.find((user) => user.id === post.author).name || 'Deleted';
			return post;
		});
	res.render('posts', { posts, curr: req_user.name });
};
router.get('/:id', authAdmin, (req, res) => renderPage(req, res));

export const changeActive = (req, res, postsFile = postsFileDefault, write = true) => {
	let active;
	const posts = JSON.parse(fs.readFileSync(postsFile)).map((post) => {
		if (post.id === +req.params.id) {
			active = post.active = !post.active;
		}
		return post;
	});

	if (write) {
		fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
		res.json(active);
	} else res.json(posts);
};
router.post('/:id', authAdmin, (req, res) => changeActive(req, res));

export const getPosts = (
	req,
	res,
	usersFile = usersFileDefault,
	postsFile = postsFileDefault,
	imagesFile = imagesFileDefault
) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	let images = JSON.parse(fs.readFileSync(imagesFile));
	const req_user = users.find((user) => user.id === req.id);
	const friends = users.map((user) => user.id).filter((id) => req_user.friends.includes(id));
	friends.push(req.id);
	const posts = JSON.parse(fs.readFileSync(postsFile))
		.filter((post) => friends.includes(post.author))
		.map((post) => {
			const user = users.find((user) => user.id === post.author);
			post.author = user.name || 'Deleted';
			post.avatar = images.find((img) => img.id === user.avatar && img.active)?.src || '';
			return post;
		});
	res.json(posts);
};
router.get('/', auth, (req, res) => getPosts(req, res));

export const postPost = (
	req,
	res,
	usersFile = usersFileDefault,
	postsFile = postsFileDefault,
	imagesFile = imagesFileDefault,
	write = true
) => {
	const { content, date } = req.body;
	const posts = JSON.parse(fs.readFileSync(postsFile));
	const images = JSON.parse(fs.readFileSync(imagesFile));
	const users = JSON.parse(fs.readFileSync(usersFile));
	const post = {
		id: posts.length && posts.at(-1).id + 1,
		author: req.id,
		content,
		date,
		active: true,
	};
	posts.push(post);

	if (write) {
		fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

		const self = JSON.parse(fs.readFileSync(usersFile)).find((user) => user.id === post.author);
		post.author = self.name;
		post.avatar = images.find((img) => img.id === self.avatar && img.active)?.src || '';
		post.subs = users.filter((user) => user.friends.includes(req.id)).map((user) => user.id);
		res.json(post);
	} else res.json(posts);
};
router.post('/', auth, (req, res) => postPost(req, res));

export default router;
