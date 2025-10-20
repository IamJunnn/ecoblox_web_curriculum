const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Student Progress API',
    version: '1.0',
    endpoints: [
      'POST /api/progress',
      'GET /api/students',
      'GET /api/students/:id',
      'GET /api/stats'
    ]
  });
});

// Import routes
const routes = require('./routes');
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}/api`);
});
