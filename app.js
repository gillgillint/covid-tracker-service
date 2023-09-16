const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());

const connection = mysql.createConnection(process.env.DATABASE_URL);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// 3) ROUTES
app.get("/api", (req, res) => {
  console.log("hello world");
  res.send("Hello World");
});

app.get("/api/v1/covid", (req, res) => {
  try {
    const { date } = req.query;

    connection.query(
      `SELECT * from covid_countries cc 
            WHERE day= ${date}'
            ORDER BY cases DESC
            LIMIT 10`,
      (err, results, fields) => {
        res.status(results);
      }
    );

    res.status(200).json({
      status: "success",
    });
  } catch (error) {}
});

connection.end();
module.exports = app;
