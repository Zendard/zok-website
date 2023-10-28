import Express, { NextFunction, Request, Response } from 'express';
import { getKalender,deleteKalender } from '../databaseFetch';
import bodyParser from 'body-parser'

const app = Express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

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
	res.render('admin', {items:items});
});

app.get('/add-kalender',authenticate,async (req,res)=>{
	res.render('addKalender')
})

app.post('/post-kalender',authenticate,async (req,res)=>{
	const item = req.body
	console.log(item)
	res.send(item)
})

app.get('/delete/:name', authenticate,async(req,res)=>{
	const name=req.params.name
	await deleteKalender(name)
	res.redirect('/admin')
})

export default app;
