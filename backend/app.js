const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); 

const urlRoutes = require("./routes/urlRoutes");

const app = express();

//RATE LIMIT CONFIG

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests allowed
  message: {
    error: "Too many requests, please try again later"
  }
});

// MIDDLEWARE ORDER IMPORTANT HAI
app.use(cors());
app.use(express.json());
app.use(limiter); 

app.use("/", urlRoutes);

module.exports = app;