const express = require("express");
const router = express.Router();

const tokenRoutes = require("./controllers/Token");
const bridgeRoutes = require("./controllers/Bridge");

router.use("/token", () => tokenRoutes); //remove () => if using a middleware also
router.use("/bridge", () => bridgeRoutes);

module.exports = router;
