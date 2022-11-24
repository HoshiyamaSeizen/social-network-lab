import express from 'express';
import fs from 'fs';
import { auth, authAdmin } from '../middleware/auth.js';

const imagesFileDefault = './data/images.json';
const usersFileDefault = './data/users.json';

const router = express.Router();

export const renderPage = (req, res, imagesFile = imagesFileDefault) => {
	const images = JSON.parse(fs.readFileSync(imagesFile)).filter(
		(image) => image.ownBy === +req.params.id
	);
	res.render('images', { images });
};
router.get('/:id', authAdmin, (req, res) => renderPage(req, res));

export const changeActive = (req, res, imagesFile = imagesFileDefault, write = true) => {
	let active;
	const images = JSON.parse(fs.readFileSync(imagesFile)).map((image) => {
		if (image.id === +req.params.id) {
			active = image.active = !image.active;
		}
		return image;
	});
	if (write) {
		fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
		res.json(active);
	} else res.json(images);
};
router.post('/:id', authAdmin, (req, res) => changeActive(req, res));

export const getImages = (req, res, imagesFile = imagesFileDefault) => {
	const images = JSON.parse(fs.readFileSync(imagesFile)).filter((image) => image.ownBy === req.id);
	res.json(images);
};
router.get('/', auth, (req, res) => getImages(req, res));

export const postImage = (req, res, imagesFile = imagesFileDefault, write = true) => {
	const { src } = req.body;
	const images = JSON.parse(fs.readFileSync(imagesFile));
	const image = {
		id: images.length && images.at(-1).id + 1,
		ownBy: req.id,
		active: true,
		src,
	};
	images.push(image);
	if (write) {
		fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
		res.json(image);
	} else res.json(images);
};
router.post('/', auth, (req, res) => postImage(req, res));

export const changeProfile = (req, res, usersFile = usersFileDefault, write = true) => {
	const { id } = req.body;
	const users = JSON.parse(fs.readFileSync(usersFile)).map((user) => {
		if (user.id === req.id) {
			user.avatar = id;
		}
		return user;
	});
	if (write) {
		fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
		res.json({ msg: 'Profile picture updated' });
	} else res.json(users);
};
router.put('/profile', auth, (req, res) => changeProfile(req, res));

export const deleteImage = (req, res, imagesFile = imagesFileDefault, write = true) => {
	let images = JSON.parse(fs.readFileSync(imagesFile));
	let count = images.length;
	images = images.filter((image) => !(image.id === +req.params.id && image.ownBy === req.id));
	if (write) {
		fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
		res.json({ msg: count === images.length ? 'Image not deleted' : 'Image deleted' });
	} else res.json(images);
};
router.delete('/:id', auth, (req, res) => deleteImage(req, res));

export default router;
