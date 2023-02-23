const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const routes = require("./routes");
require("dotenv").config();
// const injectApplicationConstants = require("./middleware/injectApplicationConstants");

// const utils = require('./utils');
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// app.use(injectApplicationConstants);

app.use("/", routes);

//HTTP server
const httpServer = createServer(app);
const server = httpServer.listen(process.env.PORT, () => {
  console.log("****************** SERVER STARTED ************************");
  console.log("listening on port:", process.env.PORT);
});

// server.timeout = DEFAULT_TIMEOUT;
module.exports = app;
