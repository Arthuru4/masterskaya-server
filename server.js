const express = require("express");
const router = express.Router();
// const nodemailer = require("nodemailer");
const cors = require("cors");
// const creds = require("./config");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use("/", router);

MongoClient.connect(db.url, (err, database) => {
  if (err) return console.log(err);
  require("./app/routes")(app, database);

  app.listen(3002);
});
