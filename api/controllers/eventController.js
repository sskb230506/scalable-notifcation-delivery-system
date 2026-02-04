const { pushEvent } = require("../services/queueService");

async function createEvent(req, res) {
  try {
    const { type, userId, channel, payload } = req.body;

    if (!type || !userId || !channel) {
      return res.status(400).json({
        error: "type, userId, and channel are required",
      });
    }

    const event = {
      id: Date.now(), // simple unique ID
      type,
      userId,
      channel,
      payload,
      createdAt: new Date().toISOString(),
    };

    await pushEvent(event);

    return res.status(202).json({
      message: "Event accepted for processing",
      eventId: event.id,
    });
  } catch (err) {
    console.error("Error creating event:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createEvent,
};
