import express from 'express';
import fs from 'fs';

const postsFile = './data/posts.json';
const usersFile = './data/users.json';

const router = express.Router();

router.get('/:id', (req, res) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	const req_user = users.find((user) => user.id === +req.params.id);
	const friends = users.map((user) => user.id).filter((id) => req_user.friends.includes(id));
	const posts = JSON.parse(fs.readFileSync(postsFile))
		.filter((post) => friends.includes(post.author))
		.map((post) => {
			post.author = users.find((user) => user.id === post.author).name || 'Deleted';
			return post;
		});
	res.render('posts', { posts, curr: req_user.name });
});

router.post('/:id', (req, res) => {
	let active;
	const posts = JSON.parse(fs.readFileSync(postsFile)).map((post) => {
		if (post.id === +req.params.id) {
			active = post.active = !post.active;
		}
		return post;
	});
	fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
	res.json(active);
});

export default router;
