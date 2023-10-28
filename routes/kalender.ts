import Express from 'express';
import {getItemInfo} from '../databaseFetch';

const app = Express.Router();

app.get('/',(req,res)=>{
	res.send('kalender');
});

app.get('/:pageTitle',async (req,res)=>{
	const item = await getItemInfo(req.params.pageTitle);
	res.render('kalenderItem',{item});
});

export default app;