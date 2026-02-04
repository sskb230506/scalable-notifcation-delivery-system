const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6380", // use your port
  legacyMode: true,              // 👈 THIS IS THE KEY
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

(async () => {
  await redisClient.connect();
  console.log("Redis connected (legacy mode)");
})();

module.exports = redisClient;
