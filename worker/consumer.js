const redisClient = require("../shared/redisClient");
const { sendNotification } = require("./notifer.js");

const QUEUE_NAME = "notification_queue";
const DLQ_NAME = "notification_dlq";
const MAX_RETRIES = 3;

function getIdempotencyKey(eventId) {
  return `processed:event:${eventId}`;
}

function startConsumer() {
  redisClient.blpop(QUEUE_NAME, 0, async (err, data) => {
    if (err) {
      console.error("Redis BLPOP error:", err);
      return startConsumer();
    }

    let event;

    // 1️⃣ Parse event safely
    try {
      event = JSON.parse(data[1]);
    } catch (parseError) {
      console.error("Invalid event payload:", parseError);
      return startConsumer();
    }

    console.log("Consumed event:", event.id);

    event.retryCount = event.retryCount || 0;
    const idempotencyKey = getIdempotencyKey(event.id);

    // 2️⃣ Idempotency check
    redisClient.get(idempotencyKey, async (err, value) => {
      if (err) {
        console.error("Redis idempotency lookup failed:", err);
        return startConsumer();
      }

      if (value) {
        console.log(
          `Skipping duplicate event ${event.id} (already processed)`
        );
        return startConsumer();
      }

      // 3️⃣ Process event
      try {
        // mark processed BEFORE side effect (at-most-once)
        redisClient.set(idempotencyKey, "true");

        await sendNotification(event);
        console.log("Event processed successfully");
      } catch (processingError) {
        console.error(
          `Processing failed for event ${event.id}:`,
          processingError.message
        );

        event.retryCount += 1;

        if (event.retryCount <= MAX_RETRIES) {
          console.log(
            `Retrying event ${event.id}, attempt ${event.retryCount}`
          );

          redisClient.rpush(
            QUEUE_NAME,
            JSON.stringify(event),
            (err) => {
              if (err) {
                console.error("Failed to requeue event:", err);
              }
            }
          );
        } else {
          console.log(
            `Moving event ${event.id} to Dead Letter Queue`
          );

          redisClient.rpush(
            DLQ_NAME,
            JSON.stringify(event),
            (err) => {
              if (err) {
                console.error("Failed to push to DLQ:", err);
              }
            }
          );
        }
      } finally {
        startConsumer();
      }
    });
  });
}

console.log("Notification worker with retry + idempotency started...");
startConsumer();
