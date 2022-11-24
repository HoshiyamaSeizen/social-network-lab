import { getFriends, addFriend, deleteFriend } from '../src/routes/users';

const imagesFile = './tests/data/images.json';
const usersFile = './tests/data/users.json';

const req = [{ id: 1 }, { id: 1, body: { id: 4 } }, { id: 1, body: { id: 2 } }];

const res = {
	json(data) {
		const dataNew = data.map((d) => {
			return { id: d.id, avatar: d.avatar };
		});
		this.text = JSON.stringify(dataNew);
	},
};

const results = [
	'[{"id":2,"avatar":""},{"id":3,"avatar":"src3"}]',
	'[{"id":1,"avatar":1},{"id":2,"avatar":2},{"id":3,"avatar":3},{"id":4,"avatar":3}]',
	'[{"id":1,"avatar":1},{"id":2,"avatar":2},{"id":3,"avatar":3},{"id":4,"avatar":3}]',
];

test('Get friends', () => {
	getFriends(req[0], res, usersFile, imagesFile);
	expect(res.text).toBe(results[0]);
});

test('Add friend', () => {
	addFriend(req[1], res, usersFile, imagesFile, false);
	expect(res.text).toBe(results[1]);
});

test('Delete friend', () => {
	deleteFriend(req[2], res, usersFile, false);
	expect(res.text).toBe(results[2]);
});
