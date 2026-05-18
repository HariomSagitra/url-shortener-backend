const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectUrl,
  getAnalytics 
} = require("../controllers/urlController");

router.post("/shorten", createShortUrl);
router.get("/:code", redirectUrl);
router.get("/analytics/:code", getAnalytics);

module.exports = router;