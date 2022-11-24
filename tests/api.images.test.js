import {
	changeActive,
	getImages,
	postImage,
	changeProfile,
	deleteImage,
} from '../src/routes/images';

const imagesFile = './tests/data/images.json';
const usersFile = './tests/data/users.json';

const req = [
	{ params: { id: 1 } },
	{ id: 1 },
	{ id: 2, body: { src: 'src4' } },
	{ id: 2, body: { id: '3' } },
	{ id: 1, params: { id: 1 } },
];

const res = {
	json(data) {
		this.text = JSON.stringify(data);
	},
};

const resAvatar = {
	json(data) {
		const dataNew = data.map((d) => {
			return { id: d.id, avatar: d.avatar };
		});
		this.text = JSON.stringify(dataNew);
	},
};

const results = [
	'[{"id":1,"ownBy":1,"active":false,"src":"src1"},{"id":2,"ownBy":13,"active":false,"src":"src2"},{"id":3,"ownBy":2,"active":true,"src":"src3"}]',
	'[{"id":1,"ownBy":1,"active":true,"src":"src1"}]',
	'[{"id":1,"ownBy":1,"active":true,"src":"src1"},{"id":2,"ownBy":13,"active":false,"src":"src2"},{"id":3,"ownBy":2,"active":true,"src":"src3"},{"id":4,"ownBy":2,"active":true,"src":"src4"}]',
	'[{"id":1,"avatar":1},{"id":2,"avatar":"3"},{"id":3,"avatar":3},{"id":4,"avatar":3}]',
	'[{"id":2,"ownBy":13,"active":false,"src":"src2"},{"id":3,"ownBy":2,"active":true,"src":"src3"}]',
];

test('Change image active status', () => {
	changeActive(req[0], res, imagesFile, false);
	expect(res.text).toBe(results[0]);
});

test('Get images', () => {
	getImages(req[1], res, imagesFile);
	expect(res.text).toBe(results[1]);
});

test('Post image', () => {
	postImage(req[2], res, imagesFile, false);
	expect(res.text).toBe(results[2]);
});

test('Change profile picture', () => {
	changeProfile(req[3], resAvatar, usersFile, false);
	expect(resAvatar.text).toBe(results[3]);
});

test('Delete image', () => {
	deleteImage(req[4], res, imagesFile, false);
	expect(res.text).toBe(results[4]);
});
