const express = require("express");
const uri = require("../server");
const { MongoClient } = require("mongodb");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("kalender");
});

router.get("/:title", getCalendar, (req, res) => {
	res.render("kalender-template", { title: req.title, date: req.date });
});

async function getCalendar(req, res, next, title) {
	const mongoClient = await new MongoClient(uri);
	try {
		const database = mongoClient.db("Zok");
		const collection = database.collection("Calendar");
		const item = await collection.findOne({ title: req.params.title });
		console.log(item.title);
		req.title = item.title;
		req.date = item.date;
	} finally {
		await mongoClient.close();
		next();
	}
}
module.exports = router;
