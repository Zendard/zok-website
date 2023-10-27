import Express, { NextFunction, Request, Response } from 'express';
import { getKalender } from '../databaseFetch';

const app = Express.Router();

function authenticate(req:Request, res:Response, next:NextFunction) {
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
};

app.get('/',authenticate, async (req, res) => {
	const items=await getKalender()
	res.render('admin', {events:items});
});

export default app;
