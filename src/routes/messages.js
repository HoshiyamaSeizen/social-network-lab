import express from 'express';
import fs from 'fs';

import { auth } from '../middleware/auth.js';

const messagesFileDefault = './data/messages.json';

const router = express.Router();

export const getMessages = (req, res, messagesFile = messagesFileDefault) => {
	let messages = JSON.parse(fs.readFileSync(messagesFile))
		.filter(
			(m) =>
				(m.from === req.id && m.to === +req.params.id) ||
				(m.from === +req.params.id && m.to === req.id)
		)
		.map((m) => ({ ...m, you: m.from === req.id }));
	res.json(messages);
};
router.get('/:id', auth, (req, res) => getMessages(req, res));

export const postMessage = (req, res, messagesFile = messagesFileDefault, write = true) => {
	const { content } = req.body;
	let messages = JSON.parse(fs.readFileSync(messagesFile));
	messages.push({
		id: messages.length && messages.at(-1).id + 1,
		from: req.id,
		to: +req.params.id,
		content,
	});

	if (write) {
		fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
		res.json({ sent: true });
	} else res.json(messages);
};
router.post('/:id', auth, (req, res) => postMessage(req, res));

export default router;
