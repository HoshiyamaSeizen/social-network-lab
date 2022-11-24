import { getMessages, postMessage } from '../src/routes/messages';

const messagesFile = './tests/data/messages.json';

const req = [
	{
		id: 1,
		params: { id: 2 },
	},
	{
		id: 2,
		params: { id: 1 },
	},
	{
		id: 1,
		params: { id: 13 },
	},
	{
		id: 1,
		params: { id: 13 },
		body: { content: 'Hello' },
	},
];

const res = {
	json(data) {
		this.text = JSON.stringify(data);
	},
};

const results = [
	'[{"id":1,"from":1,"to":2,"content":"Hi","you":true},{"id":2,"from":2,"to":1,"content":"Hello","you":false}]',
	'[{"id":1,"from":1,"to":2,"content":"Hi","you":false},{"id":2,"from":2,"to":1,"content":"Hello","you":true}]',
	'[{"id":3,"from":13,"to":1,"content":"123","you":false}]',
	'[{"id":1,"from":1,"to":2,"content":"Hi"},{"id":2,"from":2,"to":1,"content":"Hello"},{"id":3,"from":13,"to":1,"content":"123"},{"id":4,"from":1,"to":13,"content":"Hello"}]',
];

test('Get messages between id 1 and 2. Req by id 1', () => {
	getMessages(req[0], res, messagesFile);
	expect(res.text).toBe(results[0]);
});

test('Get messages between id 1 and 2. Req by id 2', () => {
	getMessages(req[1], res, messagesFile);
	expect(res.text).toBe(results[1]);
});

test('Get messages between id 1 and 13. Req by id 1', () => {
	getMessages(req[2], res, messagesFile);
	expect(res.text).toBe(results[2]);
});

test('Post message', () => {
	postMessage(req[3], res, messagesFile, false);
	expect(res.text).toBe(results[3]);
});
