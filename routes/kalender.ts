import Express from 'express';
import {getItemInfo} from '../databaseFetch';
import bodyParser from 'body-parser';
import { addInschrijving } from '../databaseFetch';

const app = Express.Router();

app.get('/',(req,res)=>{
	res.send('kalender');
});

app.get('/:pageTitle',async (req,res)=>{
	const item = await getItemInfo(req.params.pageTitle);
	const inschrijvingStatus= req.query.inschrijving;
	res.render('kalenderItem',{item,inschrijvingStatus});
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/:name/inschrijven',async (req,res)=>{
	if(97-((5+req.body.riziv.split('-')[0])%97)==req.body.riziv.split('-')[1]){
		const result=addInschrijving(req.body,req.params.name);
		result.then(async (e)=>{
			if (e){
				res.redirect(`/kalender/${req.params.name}?inschrijving=success`);
			}
		});
	}else{
		res.redirect(`/kalender/${req.params.name}?inschrijving=invalid`);
	}
});

export default app;