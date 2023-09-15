import { MongoClient } from "mongodb";
import { NextFunction, Request, Response, application } from "express";
import Nominatim from "nominatim-ts";

async function getDataEvent(req: Request, res: Response, next: NextFunction) {
	const eventName = req.params.event;
	const client = new MongoClient(Bun.env.URI||"");
	try {
		const event = await client
			.db("Zok")
			.collection("Calendar")
			.findOne({ name: eventName });
		const locationString = "Geraardsbergen";
		if (event) {
			const locationString = event.location;
		}
		await console.log(locationString);
		const location = await Nominatim.search({
			q: locationString,
		});
		res.locals.event = (await event) || {
			title: "Bericht niet gevonden",
			date: "",
		};
		console.log(location);
		res.locals.event.lat = parseFloat(location[0].lat);
		res.locals.event.lon = parseFloat(location[0].lon);
	} finally {
		await client.close();
		await next();
	}
}

async function getDataAll(req: Request, res: Response, next: NextFunction) {
	const client = new MongoClient(Bun.env.URI||"");
	try {
		const events = await client
			.db("Zok")
			.collection("Calendar")
			.find()
			.toArray();
		events.forEach(async (event) => {
			const date = new Date(event.date);
			event.date =
				await `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
		});
		res.locals.events = events;
	} finally {
		await client.close();
		await next();
	}
}

export { getDataEvent, getDataAll };
