const redisClient = require("../../shared/redisClient");

const QUEUE_NAME = "notification_queue";

async function pushEvent(event) {
await redisClient.sendCommand([
  "RPUSH",
  QUEUE_NAME,
  JSON.stringify(event),
]);
}

module.exports = {
  pushEvent,
};
