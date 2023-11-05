import Express from 'express';
import {getItemInfo} from '../databaseFetch';
import bodyParser from 'body-parser';
import sendEmail from '../sendMail';

const app = Express.Router();

app.get('/',(req,res)=>{
	res.send('kalender');
});

app.get('/:pageTitle',async (req,res)=>{
	const item = await getItemInfo(req.params.pageTitle);
	res.render('kalenderItem',{item});
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/:name/inschrijven',async (req,res)=>{
	if(97-((5+req.body.riziv.split('-')[0])%97)==req.body.riziv.split('-')[1]){
		if(req.body.lid=='lid'){
			sendEmail(req.body.name,`Inschrijving ${req.params.name}`,`${req.body.name}(axxon lid) met riziv nummer ${req.body.riziv} schrijft zich in voor ${req.params.name}`,'');}
			res.redirect(`/kalender/${req.params.name}`)
			}
		else{
			sendEmail(req.body.name,`Inschrijving ${req.params.name}`,`${req.body.name} met riziv nummer ${req.body.riziv} schrijft zich in voor ${req.params.name}`,'');
			res.redirect(`/kalender/${req.params.name}`)
		}
	}else{
		const item = await getItemInfo(req.params.name);
		res.render('kalenderItem',{item,notValid:true});
	}
});

export default app;