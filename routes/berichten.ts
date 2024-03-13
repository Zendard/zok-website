import Express from 'express';
import {getBerichtInfo} from '../databaseFetch';

const app = Express.Router();

app.get('/',(req,res)=>{
	res.send('berichten');
});

app.get('/:pageTitle',async (req,res)=>{
	const item = await getBerichtInfo(req.params.pageTitle);
	res.render('berichtItem',{item});
});

export default app;