import express from "express";
import { getDataAll } from "./mongoDB";
if (!Bun.env.MONGODB_URI) {
	console.error("Please set uri ENV");
}

const app = express();
const port = parseInt(Bun.env.PORT || "3000");

app.use(express.static("public"));
app.set("view engine", "ejs");

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
