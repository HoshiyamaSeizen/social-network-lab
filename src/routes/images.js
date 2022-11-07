import express from 'express';
import fs from 'fs';

const imagesFile = './data/images.json';

const router = express.Router();

router.get('/:id', (req, res) => {
	const images = JSON.parse(fs.readFileSync(imagesFile)).filter(
		(image) => image.ownBy === +req.params.id
	);
	res.render('images', { images });
});

router.post('/:id', (req, res) => {
	let active;
	const images = JSON.parse(fs.readFileSync(imagesFile)).map((image) => {
		if (image.id === +req.params.id) {
			active = image.active = !image.active;
		}
		return image;
	});
	fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
	res.json(active);
});

export default router;
