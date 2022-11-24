import { getPosts, postPost } from '../src/routes/posts';

const imagesFile = './tests/data/images.json';
const usersFile = './tests/data/users.json';
const postsFile = './tests/data/posts.json';

const req = [{ id: 1 }, { id: 2, body: { content: 'A', date: 'now' } }];

const res = {
	json(data) {
		this.text = JSON.stringify(data);
	},
};

const results = [
	'[{"id":1,"author":"John Doe 2","content":"1","date":"2022-10-25","active":true,"avatar":""},{"id":2,"author":"John Doe 2","content":"2","date":"2022-10-26","active":false,"avatar":""},{"id":3,"author":"John Doe 3","content":"3","date":"2022-10-27","active":true,"avatar":"src3"}]',
	'[{"id":1,"author":2,"content":"1","date":"2022-10-25","active":true},{"id":2,"author":2,"content":"2","date":"2022-10-26","active":false},{"id":3,"author":3,"content":"3","date":"2022-10-27","active":true},{"id":4,"author":4,"content":"4","date":"2022-10-28","active":false},{"id":5,"author":2,"content":"A","date":"now","active":true}]',
];

test('Get posts', () => {
	getPosts(req[0], res, usersFile, postsFile, imagesFile);
	expect(res.text).toBe(results[0]);
});

test('Create post', () => {
	postPost(req[1], res, usersFile, postsFile, imagesFile, false);
	expect(res.text).toBe(results[1]);
});
