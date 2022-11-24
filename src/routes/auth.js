import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { notAuth, auth } from '../middleware/auth.js';

const usersFile = './data/users.json';
const imagesFile = './data/images.json';

const router = express.Router();

router.post('/login', notAuth, async (req, res) => {
	const { email, password } = req.body;

	// Basic validation
	if (!(email && password)) return res.json({ error: 'Please enter all fields' });

	// Read users
	const users = JSON.parse(fs.readFileSync(usersFile));

	// Check if user exists
	const user = users.find((user) => user.email === email);
	if (!user) return res.json({ error: 'There is not user with that email' });

	// Check password
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.json({ error: 'Wrong password' });

	// Create token
	const token = await jwt.sign({ id: user.id, username: user.name }, process.env.JWT_SECRET, {
		expiresIn: '1d',
	});
	if (!token) return res.json({ error: 'Error while generating a token' });

	// Save cookie and redirect
	res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 });
	res.json({ msg: 'User logged in' });
});

router.post('/register', notAuth, async (req, res) => {
	const { name, email, password, password1, date } = req.body;

	// Basic validation
	if (!(name && email && password && password1)) return res.json('Please enter all fields');
	if (password !== password1) return res.json({ error: 'Passwords should match' });

	// Read users
	const users = JSON.parse(fs.readFileSync(usersFile));

	// Check if user already exists
	const user = users.find((user) => user.email === email);
	if (user) return res.json({ error: 'User with that email already exists' });

	// Hash password
	const salt = await bcrypt.genSalt(12);
	if (!salt) return res.json({ error: 'Something wrong with bcrypt.js' });
	const hash = await bcrypt.hash(password, salt);
	if (!hash) return res.json({ error: 'Error while hasing the password' });

	// Generate id
	const id = users.length && users.at(-1).id + 1;

	// Save user
	const newUser = {
		id,
		name,
		email,
		password: hash,
		date,
		role: 'user',
		status: 'active',
		friends: [],
	};
	users.push(newUser);
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

	// Create token
	const token = await jwt.sign(
		{ id: newUser.id, username: newUser.name },
		process.env.JWT_SECRET,
		{
			expiresIn: '1d',
		}
	);
	if (!token) return res.json({ error: 'Error while generating token' });

	// Save cookie and redirect
	res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 });
	res.json({ msg: 'User created' });
});

router.get('/logout', (req, res) => {
	res.clearCookie('token');
	res.json({ msg: 'Logged out' });
});

router.get('/info', auth, (req, res) => {
	const images = JSON.parse(fs.readFileSync(imagesFile));
	const user = JSON.parse(fs.readFileSync(usersFile)).find((user) => user.id === req.id);
	user.avatar = images.find((img) => img.id === user.avatar && img.active)?.src || '';
	delete user.password;
	delete user.friends;
	res.json(user);
});

router.put('/', auth, (req, res) => {
	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		if (user.id === req.id) {
			return { ...user, ...req.body };
		}
		return user;
	});
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
	res.json({ msg: 'Edited' });
});

router.delete('/', auth, (req, res) => {
	const users = JSON.parse(fs.readFileSync(usersFile)).filter((user) => user.id !== req.id);
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
	res.clearCookie('token');
	res.json({ msg: 'Account deleted' });
});

export default router;
