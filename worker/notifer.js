async function sendNotification(event) {
  const { type, userId, channel, payload } = event;

  // Mock notification logic
  console.log(
    `[NOTIFICATION] type=${type}, user=${userId}, channel=${channel}`
  );

  // Simulate delay (network / email / sms)
  await new Promise((res) => setTimeout(res, 500));

  return true;
}

module.exports = {
  sendNotification,
};
