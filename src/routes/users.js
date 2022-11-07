import express from 'express';
import fs from 'fs';

const usersFile = './data/users.json';

const router = express.Router();

router.get('/', (req, res) => {
	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		delete user.friends;
		return user;
	});
	res.render('users', { title: 'Users', users, curr: null });
});

router.get('/friends/:id', (req, res) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	const req_user = users.find((user) => user.id === +req.params.id);
	users = users
		.filter((user) => req_user.friends.includes(user.id))
		.map((user) => {
			delete user.friends;
			return user;
		});
	res.render('users', { title: 'Friends', users, curr: req_user.name });
});

router.post('/:id', (req, res) => {
	req.body.role = ['user', 'moderator', 'admin'][req.body.role - 1];
	req.body.status = ['active', 'blocked'][req.body.status - 1];
	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		if (user.id === +req.params.id) {
			return { ...user, ...req.body };
		}
		return user;
	});
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
	res.redirect('/users');
});

export default router;
