import express, { NextFunction, Request, Response } from 'express';
import { MongoClient } from 'mongodb';

const app = express.Router();

app.use((req, res, next) => {
	const auth = { login: 'marten', password: 'studio54' };

	const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
	const [login, password] = Buffer.from(b64auth, 'base64')
		.toString()
		.split(':');

	if (login && password && login === auth.login && password === auth.password) {
		return next();
	}

	// Access denied...
	res.set('WWW-Authenticate', 'Basic realm="401"');
	res.status(401).send('Authentication required.');
});

app.get('/', getEvents, (req, res) => {
	res.render('admin');
});
app.post(
	'/add-item',
	async (req, res, next) => {
		const item = req.body;
		const mongoClient = await new MongoClient(Bun.env.MONGODB_URI || '');
		const db = mongoClient.db('Zok').collection('Calendar');
		if (
			!item.title ||
			!item.name ||
			!item.img ||
			!item.date ||
			!item.timeBegin ||
			!item.timeEnd ||
			!item.descr ||
			!item.location
		) {
			res.send('Please fill all fields');
		} else {
			await db.insertOne({
				title: item.title,
				name: item.name,
				img: item.img,
				date: item.date,
				time: item.timeBegin + ' - ' + item.timeEnd,
				descr: item.descr
					.replaceAll('\r\n\r\n', '<br class="double">')
					.replaceAll('\r\n', '<br>'),
				location: item.location,
			});
		}
		await mongoClient.close();
		next();
	},
	(req, res) => {
		res.redirect('/');
	}
);

app.post(
	'/delete-item',
	async (req, res, next) => {
		const item = req.body;
		const mongoClient = await new MongoClient(Bun.env.MONGODB_URI || '');
		const db = mongoClient.db('Zok').collection('Calendar');

		console.log(item);
		await db.deleteOne({ name: item.name });
		await mongoClient.close();
		next();
	},
	(req, res) => {
		res.redirect('/');
	}
);

export default app;
