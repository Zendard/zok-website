import express from "express";
import { getDataAll } from "./mongoDB";
if (!Bun.env.MONGODB_URI) {
	console.error("Please set uri ENV");
}
import compression from "compression";
import helmet from "helmet";

const app = express();
const port = parseInt(Bun.env.PORT || "");
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
