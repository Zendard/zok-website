import Express, { NextFunction, Request, Response } from 'express';
import * as db from '../databaseFetch';
import bodyParser, { text } from 'body-parser';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import {load} from 'cheerio';
import mongoose, { AnyObject } from 'mongoose';

if(!Bun.env.ADMIN_NAME||!Bun.env.ADMIN_PASSWD){
	console.log('Set admin name and password env!');
}
const mongoUri=Bun.env.MONGODB_URI||''

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
	const kalenderItems=await db.getKalender();
	const berichtenItems=await db.getBerichten();
	res.render('admin', {kalenderItems:kalenderItems,berichtenItems:berichtenItems});
});

app.get('/add-kalender',authenticate,async (req,res)=>{
	res.render('addKalender');
});

app.get('/edit/kalender/:name',authenticate,async(req,res)=>{
	const item= await db.getItemInfo(req.params.name)
	await res.render('editKalender',item)
})

app.post('/edit-kalender',authenticate,async (req,res)=>{
	const itemForm = req.body
	console.log(itemForm)
	mongoose.connect(mongoUri);
	let item =  await db.kalenderItem.findOne({name:itemForm.name})||new db.kalenderItem;
	await item.set({
		title:itemForm.title,
		name:itemForm.name,
		date:itemForm.date,
		descr:itemForm.descr,
		location:itemForm.location,
		time:itemForm.timeStart+' - '+itemForm.timeEnd,
		cost:itemForm.cost,
		costMember:itemForm.costMember,
		inschrijven:itemForm.inschrijven
	})
	await item.save()
	console.log(item)
	res.redirect('/admin')
})

app.get('/add-berichten',authenticate,async (req,res)=>{
	res.render('addBerichten');
});

app.post('/post-kalender',authenticate,async (req,res)=>{
	db.addKalender(req.body,req.files?.img);
	await res.redirect('/admin');
});

app.post('/post-berichten',authenticate,async (req,res)=>{
	db.addBerichten(req.body,req.files?.img);
	await res.redirect('/admin');
});

app.get('/delete/:name', authenticate,async(req,res)=>{
	const name=req.params.name;
	await db.deleteKalender(name);
	res.redirect('/admin');
});

app.get('/delete/berichten/:name', authenticate,async(req,res)=>{
	const name=req.params.name;
	await db.deleteBerichten(name);
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
