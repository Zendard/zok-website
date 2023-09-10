const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("kalender");
});

router.get("/:title", (req, res) => {
	res.render("kalender-template", { title: req.params.title });
});

router.param("title", (req, res, next, id) => {});

module.exports = router;
