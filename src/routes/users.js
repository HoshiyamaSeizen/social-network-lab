import express from 'express';
import fs from 'fs';
import { auth, authAdmin } from '../middleware/auth.js';

const usersFileDefault = './data/users.json';
const imagesFileDefault = './data/images.json';

const router = express.Router();

export const renderPage = (req, res, usersFile = usersFileDefault) => {
	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		delete user.friends;
		return user;
	});
	res.render('users', { title: 'Users', users, curr: null });
};
router.get('/', authAdmin, (req, res) => renderPage(req, res));

export const renderFriendsPage = (req, res, usersFile = usersFileDefault) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	const req_user = users.find((user) => user.id === +req.params.id);
	users = users
		.filter((user) => req_user.friends.includes(user.id))
		.map((user) => {
			delete user.friends;
			return user;
		});
	res.render('users', { title: 'Friends', users, curr: req_user.name });
};
router.get('/friends/:id', authAdmin, (req, res) => renderFriendsPage(req, res));

export const editUser = (req, res, usersFile = usersFileDefault, write = true) => {
	req.body.role = ['user', 'moderator', 'admin'][req.body.role - 1];
	req.body.status = ['active', 'blocked'][req.body.status - 1];

	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		if (user.id === +req.params.id) {
			return { ...user, ...req.body };
		}
		return user;
	});
	if (write) {
		fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
		res.redirect('/users');
	} else res.json(users);
};
router.post('/:id', authAdmin, (req, res) => editUser(req, res));

export const getFriends = (
	req,
	res,
	usersFile = usersFileDefault,
	imagesFile = imagesFileDefault
) => {
	let users = JSON.parse(fs.readFileSync(usersFile));
	const images = JSON.parse(fs.readFileSync(imagesFile));
	const req_user = users.find((user) => user.id === req.id);
	users = users
		.filter((user) => req_user.friends.includes(user.id))
		.map((user) => {
			user.avatar = images.find((img) => img.id === user.avatar && img.active)?.src || '';
			user.friend = user.friends.includes(req.id);
			delete user.friends;
			delete user.date;
			delete user.email;
			return user;
		});
	res.json(users);
};
router.get('/friends', auth, (req, res) => getFriends(req, res));

export const addFriend = (
	req,
	res,
	usersFile = usersFileDefault,
	imagesFile = imagesFileDefault,
	write = true
) => {
	const { id } = req.body;
	if (id === req.id) return res.json({ error: 'You cannot add yourself' });

	let users = JSON.parse(fs.readFileSync(usersFile));
	const images = JSON.parse(fs.readFileSync(imagesFile));

	let friend = users.find((user) => user.id === id);
	if (!friend) return res.json({ error: 'Person with that ID does not exist' });

	const user = users.find((user) => user.id === req.id);
	if (user.friends.includes(id)) return res.json({ error: 'This user is already your friend' });

	users = users.map((user) => {
		if (user.id === req.id) user.friends.push(id);
		return user;
	});
	if (write) {
		fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

		friend.avatar = images.find((img) => img.id === friend.avatar && img.active)?.src || '';
		friend.friend = friend.friends.includes(req.id);
		delete friend.friends;
		delete friend.date;
		delete friend.email;
		res.json(friend);
	} else res.json(users);
};
router.post('/friends/add', auth, (req, res) => addFriend(req, res));

export const deleteFriend = (req, res, usersFile = usersFileDefault, write = true) => {
	const { id } = req.body;
	let users = JSON.parse(fs.readFileSync(usersFile));

	const friends = users.find((user) => user.id === req.id).friends.filter((f) => f.id !== id);

	users = users.map((user) => {
		if (user.id === req.id) user.friends = friends;
		return user;
	});

	if (write) {
		fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
		res.json({ msg: 'Friend deleted' });
	} else res.json(users);
};
router.delete('/friends/delete', auth, (req, res) => deleteFriend(req, res));

export default router;
