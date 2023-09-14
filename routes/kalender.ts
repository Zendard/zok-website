import express, { NextFunction, Request, Response } from "express";
import { getDataEvent } from "../mongoDB";

const router = express.Router();
router.use(express.static("public"));

router.get("/", (req, res) => {
	res.render("kalender");
});
router.get("/:event", getDataEvent, (req, res) => {
	res.render("kalender-template");
});

export default router;
