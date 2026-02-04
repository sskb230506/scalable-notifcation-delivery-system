const express = require("express");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(express.json());

app.use("/api", eventRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Event API running on port ${PORT}`);
});
