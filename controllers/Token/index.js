const express = require("express");
const router = express.Router();
const controllers = require("./controllers");

const { pause, unpause } = controllers;

router.post("/", pause);
router.post("/", unpause);

module.exports = router;
