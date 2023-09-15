import express from "express";
import { getDataAll } from "./mongoDB";
if (!Bun.env.MONGODB_URI) {
	console.error("Please set uri ENV");
}
import compression from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const app = express();
const port = 3000;
const allowedSources = [
	"'self'",
	"kit.fontawesome.com",
	"unpkg.com",
	"ka-f.fontawesome.com",
	"zuid-oost-vlaamsekinekring.be",
	"fonts.gstatic.com",
	"window.location.href='/kalender/kmo'",
	"'unsafe-inline'",
	"a.tile.openstreetmap.fr",
	"b.tile.openstreetmap.fr",
	"c.tile.openstreetmap.fr",
];

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(compression());
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				"script-src": allowedSources,
				"default-src": allowedSources,
				"img-src": allowedSources,
				"font-src": allowedSources,
				"script-src-attr": allowedSources,
			},
		},
	})
);
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 20,
	standardHeaders: "draft-7",
	legacyHeaders: false,
});
app.use(limiter);

app.get("/", getDataAll, (req, res) => {
	res.render("index");
});
app.get("/zok", (req, res) => {
	res.render("zok");
});
app.get("/onze-kines", (req, res) => {
	res.render("onze-kines");
});
app.get("/contact", (req, res) => {
	res.render("contact");
});
app.get("/lid-worden", (req, res) => {
	res.render("lid-worden");
});

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});

import kalenderRouter from "./routes/kalender";
app.use("/kalender", kalenderRouter);
