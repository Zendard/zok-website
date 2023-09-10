const express = require("express");
const { MongoClient } = require("mongodb");
const credentials = require("./env_variables.json");

const app = express();
const uri = `mongodb+srv://${credentials.username}:${credentials.Password}@zok.srwzq7w.mongodb.net/?retryWrites=true&w=majority`;
module.exports = uri;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
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

const kalenderRouter = require("./routes/kalender");
app.use("/kalender", kalenderRouter);

app.listen(3000);
