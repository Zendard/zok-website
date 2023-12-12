import express from 'express';
import kalenderRouter from './routes/kalender';
import adminRouter from './routes/admin';
import {getKalender, getBerichten} from './databaseFetch';
import compression from 'compression';
import helmet from 'helmet';
import sendEmail from './sendMail';
import bodyParser, { text } from 'body-parser';

if (!Bun.env.MONGODB_URI) {
	throw new Error('Please set mongo uri');
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));
app.use(compression());
const port = Bun.env.PORT||'3000';
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			'script-src': ['\'self\'', 'http://*.fontawesome.com', 'http://*.quilljs.com'],
			'default-src': ['\'self\'', 'http://*.fontawesome.com']
		},
	}),
);

app.get('/', async (req, res) => {
	res.render('index',{kalender:await getKalender(),berichten:await getBerichten()});
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


app.get('/lid-worden', (req, res) => {
	res.render('lid-worden');
});

app.get('/disclaimer',(req,res)=>{
	res.render('disclaimer');
});

app.use('/kalender',kalenderRouter);
app.use('/admin',adminRouter);

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-mail',async (req,res)=>{
	console.log(req.body.from,' : ', req.body.subject,'\n',req.body.body);
	sendEmail(req.body.from , req.body.subject,`${req.body.from} Stuurt via het contactformulier:\n\r\n\r${req.body.body}`,'');
	res.redirect('/contact');
});

app.get('/*',(req,res)=>{
	res.render('404');
});

app.listen(parseInt(port), () => {
	console.log(`Listening on port ${port}...`);
});
