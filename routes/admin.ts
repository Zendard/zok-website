import Express, { NextFunction, Request, Response } from 'express';
import { getKalender,deleteKalender,addKalender,getBerichten,deleteBerichten,addBerichten } from '../databaseFetch';
import bodyParser, { text } from 'body-parser';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import {load} from 'cheerio';

if(!Bun.env.ADMIN_NAME||!Bun.env.ADMIN_PASSWD){
	console.log('Set admin name and password env!');
}

const app = Express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

function authenticate(req:Request, res:Response, next:NextFunction) {
	const auth = { login: Bun.env.ADMIN_NAME, password: Bun.env.ADMIN_PASSWD };

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
}

app.get('/',authenticate, async (req, res) => {
	const kalenderItems=await getKalender();
	const berichtenItems=await getBerichten();
	res.render('admin', {kalenderItems:kalenderItems,berichtenItems:berichtenItems});
});

app.get('/add-kalender',authenticate,async (req,res)=>{
	res.render('addKalender');
});

app.get('/add-berichten',authenticate,async (req,res)=>{
	res.render('addBerichten');
});

app.post('/post-kalender',authenticate,async (req,res)=>{
	addKalender(req.body,req.files.img||undefined);
	await res.redirect('/admin');
});

app.post('/post-berichten',authenticate,async (req,res)=>{
	addBerichten(req.body,req.files.img||undefined);
	await res.redirect('/admin');
});

app.get('/delete/:name', authenticate,async(req,res)=>{
	const name=req.params.name;
	await deleteKalender(name);
	res.redirect('/admin');
});

app.get('/delete/berichten/:name', authenticate,async(req,res)=>{
	const name=req.params.name;
	await deleteBerichten(name);
	res.redirect('/admin');
});

app.get('/refresh-list',async(req,res)=>{
	await axios.get('https://axxon.be/kringsite/35-zuid-oost-vlaamse-kinesitherapeuten/leden/').then((res)=>{
		const ledenDoc=res.data;
		const $=load(ledenDoc);
		const leden:string[][] = [];
		$('.bodycontent').find('ul').children('li').each((i,e)=>{
			leden.push($(e).text().split(' - '));
		});
		const ledenSimple = leden.map((e)=>{
			return e.join('</td><td>');
		});
		let ledenString = ledenSimple.join('</td></tr><tr><td>');
		ledenString = '<tr><td>' + ledenString + '</td></tr>';
		Bun.write('./views/templates/lijst.ejs',ledenString);
	});
	res.redirect('/admin');
});

export default app;
