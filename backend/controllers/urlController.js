const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");
const validator = require("validator");
const redisClient = require("../config/redis");

// Create Short URL
exports.createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    // 1. validation
    if (!validator.isURL(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // 2. duplicate check
    const existing = await Url.findOne({ originalUrl: url });
    if (existing) {
      return res.json({
        shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`
      });
    }

    // 3. generate code
    const shortCode = generateCode();

    // 4. save
    const newUrl = await Url.create({
      originalUrl: url,
      shortCode
    });

    // 5. response
    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Redirect\
exports.redirectUrl = async (req, res) => {
  try {
    console.log("Redirect API hit 🔥");

    const { code } = req.params;

    // 🔥 1. check cache
    const cachedUrl = await redisClient.get(code);

    if (cachedUrl) {
      console.log("Cache hit 🚀");

      //  analytics (even on cache hit)
      const url = await Url.findOne({ shortCode: code });
      if (url) {
        url.clicks++;

        url.logs.push({
          ip: req.ip,
          userAgent: req.headers["user-agent"]
        });

        await url.save();
      }

      return res.redirect(302, cachedUrl);
    }

    //  2. DB hit
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ error: "Not found" });
    }

    //  3. save to cache
    await redisClient.set(code, url.originalUrl, {
      EX: 60
    });

    //  analytics tracking
    url.clicks++;

    url.logs.push({
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await url.save();

    console.log("DB hit ");

    return res.redirect(302, url.originalUrl); //  302 use karna
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      logs: url.logs
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};