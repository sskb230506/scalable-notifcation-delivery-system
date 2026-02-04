const redisClient = require("../shared/redisClient");
const { sendNotification } = require("./notifer.js");

const QUEUE_NAME = "notification_queue";


function startConsumer() {
  console.log("Notification worker started...");

  redisClient.blpop(QUEUE_NAME, 0, async (err, data) => {
    if (err) {
      console.error("Redis BLPOP error:", err);
      return startConsumer(); // retry listening
    }

    try {
      const message = data[1];
      const event = JSON.parse(message);

      console.log("Consumed event:", event.id);

      await sendNotification(event);
    } catch (err) {
      console.error("Error processing event:", err);
    } finally {
      // 🔁 listen again AFTER processing
      startConsumer();
    }
  });
}

startConsumer();
