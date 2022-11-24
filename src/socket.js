import { Server } from 'socket.io';

const users = new Map();
const pairs = new Map();

export const initSockets = (server) => {
	const io = new Server(server, {
		cors: {
			origin: 'https://localhost:4200',
		},
	});

	io.use((socket, next) => {
		const userid = socket.handshake.auth.id;
		if (!userid) {
			return next(new Error('invalid ID'));
		}
		socket.userid = userid;
		next();
	});

	io.on('connection', (socket) => {
		users.set(socket.userid, socket.id);

		socket.on('connect-chat', (other) => {
			pairs.set(socket.userid, other);
			io.to(users.get(socket.userid)).emit('online', users.has(other));
			if (users.has(other)) io.to(users.get(other)).emit('online', true);
		});

		socket.on('disconnect', () => {
			const other = pairs.get(socket.userid);
			if (users.has(other)) io.to(users.get(other)).emit('online', false);
			users.delete(socket.userid);
			pairs.delete(socket.userid);
		});

		socket.on('message', ({ to, message }) => {
			if (pairs.get(to) === socket.userid) io.to(users.get(to)).emit('message', message);
		});

		socket.on('post', (post) => {
			post.subs.forEach((to) => {
				const user = users.get(to);
				if (user) io.to(user).emit('post', post);
			});
		});
	});
};
