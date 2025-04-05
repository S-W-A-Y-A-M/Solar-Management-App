// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS (so frontend on different port can access)
app.use(cors());

// Serve the JSON file
app.get('/api/energy-data', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'energy_data.json');
  res.sendFile(filePath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
