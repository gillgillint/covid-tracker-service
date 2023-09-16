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

app.get("/api/v1/covid", async (req, res) => {
  const { date } = req.query;
  // Ensure the 'date' parameter is properly formatted and not empty
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).send("Invalid date format");
    return;
  }

  connection.query(
    `SELECT * FROM covid_countries 
     WHERE day = ?
     ORDER BY cases DESC
     LIMIT 10`,
    [date],
    function (err, results, fields) {
      if (err) {
        console.error("Error querying the database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      console.log(results);
      res.status(200).json({
        data: results,
      });
    }
  );
});

module.exports = app;
