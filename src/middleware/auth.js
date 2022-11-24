import jwt from 'jsonwebtoken';
import fs from 'fs';

const usersFile = './data/users.json';

export const auth = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(403).json({ error: 'Not authed' });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.id = decoded.id;
		req.username = decoded.username;
		next();
	} catch (e) {
		res.status(403).json({ error: 'Token not valid' });
	}
};

export const notAuth = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return next();

	try {
		jwt.verify(token, process.env.JWT_SECRET);
		res.json({ error: 'Authed' });
	} catch (e) {
		next();
	}
};

export const authAdmin = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(403).json({ error: 'Not authed' });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.id = decoded.id;
		req.username = decoded.username;
	} catch (e) {
		return res.status(403).json({ error: 'Token not valid' });
	}

	const isAdmin =
		JSON.parse(fs.readFileSync(usersFile))
			.find((user) => user.id === req.id)
			?.role.toLowerCase() === 'admin';
	if (!isAdmin) return res.status(403).json({ error: '403. Forbidden' });
	next();
};
