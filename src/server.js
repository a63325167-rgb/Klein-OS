const express = require('express');
const app = express();

app.use(express.json());

const dataSyncRoute = require('./routes/dataSyncRoute');

app.use('/', dataSyncRoute);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});







