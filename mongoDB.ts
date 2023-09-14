import { MongoClient } from "mongodb";
import { uri } from "./uri";
import { NextFunction, Request, Response } from "express";

async function getDataEvent(req: Request, res: Response, next: NextFunction) {
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

async function getDataAll(req: Request, res: Response, next: NextFunction) {
	const client = new MongoClient(uri);
	try {
		const events = await client
			.db("Zok")
			.collection("Calendar")
			.find()
			.toArray();
		events.forEach((event) => {
			const date = new Date(event.date);
			event.date = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
		});
		res.locals.events = events;
	} finally {
		await client.close();
		await next();
	}
}

export { getDataEvent, getDataAll };
