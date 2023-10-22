import express from 'express';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
const port = 3000;

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/wie-zijn-wij', (req, res) => {
	res.render('wieZijnWij');
});

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
