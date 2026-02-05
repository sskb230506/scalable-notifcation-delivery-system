async function sendNotification(event) {
  const { type, userId, channel } = event;

  console.log(
    `[NOTIFICATION] type=${type}, user=${userId}, channel=${channel}`
  );

throw new Error("Forced failure for idempotency test");


  await new Promise((res) => setTimeout(res, 500));

  console.log("Notification sent successfully");
  return true;
}

module.exports = {
  sendNotification,
};
