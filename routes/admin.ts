import Express, { NextFunction, Request, Response } from 'express';
import { getKalender,deleteKalender,addKalender,getBerichten,deleteBerichten,addBerichten } from '../databaseFetch';
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'

const app = Express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

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
	const kalenderItems=await getKalender()
	const berichtenItems=await getBerichten()
	res.render('admin', {kalenderItems:kalenderItems,berichtenItems:berichtenItems});
});

app.get('/add-kalender',authenticate,async (req,res)=>{
	res.render('addKalender')
})

app.get('/add-berichten',authenticate,async (req,res)=>{
	res.render('addBerichten')
})

app.post('/post-kalender',authenticate,async (req,res)=>{
	addKalender(req.body,req.files.img||undefined)
	await res.redirect('/admin')
})

app.post('/post-berichten',authenticate,async (req,res)=>{
	addBerichten(req.body,req.files.img||undefined)
	await res.redirect('/admin')
})

app.get('/delete/:name', authenticate,async(req,res)=>{
	const name=req.params.name
	await deleteKalender(name)
	res.redirect('/admin')
})

app.get('/delete/berichten/:name', authenticate,async(req,res)=>{
	const name=req.params.name
	await deleteBerichten(name)
	res.redirect('/admin')
})

export default app;
