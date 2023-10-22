import express from 'express';
import {getKalender} from './databaseFetch';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
const port = 3000;

app.get('/', async (req, res) => {
	res.render('index',{kalender:await getKalender()});
});

app.get('/wie-zijn-wij', (req, res) => {
	res.render('wieZijnWij');
});

app.get('/leden', (req, res) => {
	res.render('leden');
});

app.get('/contact', (req, res) => {
	res.render('contact');
});

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
