import express, { NextFunction, Request, Response } from "express";
const router = express.Router();

router.use(express.static("../public"));
router.get("/", (req, res) => {
	res.render("kalender");
});
router.get("/:event", getData, (req, res) => {
	res.render("kalender-template");
});

function getData(req: Request, res: Response, next: NextFunction) {
	const eventName = req.params.event;
	console.log(eventName);
	res.locals.title = eventName;
	next();
}

export default router;
