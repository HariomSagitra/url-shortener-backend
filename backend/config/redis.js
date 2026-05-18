const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL
});

//console.log("Redis URL:", process.env.REDIS_URL);
// error handling
client.on("error", (err) => console.log("Redis Error", err));

// connect
(async () => {
  await client.connect();
  console.log("Redis Connected 🔥");
})();

module.exports = client;