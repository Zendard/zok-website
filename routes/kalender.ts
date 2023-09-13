import express, { NextFunction, Request, Response } from "express";
import { MongoClient } from "mongodb";
import { uri } from "../uri";

const router = express.Router();
router.use(express.static("public"));

router.get("/", (req, res) => {
	res.render("kalender");
});
router.get("/:event", getData, (req, res) => {
	res.render("kalender-template");
});

async function getData(req: Request, res: Response, next: NextFunction) {
	const eventName = req.params.event;
	const client = new MongoClient(uri);
	try {
		const event = await client
			.db("Zok")
			.collection("Calendar")
			.findOne({ name: eventName });
		res.locals.event = (await event) || {
			title: "Bericht niet gevonden",
			date: "",
		};
	} finally {
		await client.close();
		await next();
	}
}

export default router;
