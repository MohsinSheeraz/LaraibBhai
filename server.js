// server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Middleware for logging all incoming requests
app.use((req, res, next) => {
  console.log(`\n--- Incoming Request ---`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

console.log("CHEATORRRR");

// Endpoint to create a mockup task
app.post('/create-task', async (req, res) => {
  const { imageUrl, productId } = req.body; // Destructure imageUrl and productId from the request body

  if (!imageUrl) {
    console.error('Image URL is missing in the request body.');
    return res.status(400).json({ error: 'Image URL is required' });
  }

  if (!productId) {
    console.error('Product ID is missing in the request body.');
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const payload = {
    variant_ids: [4012, 4013, 4014, 4017, 4018, 4019], // Ensure these are valid variant IDs for productId
    format: 'jpg',
    files: [
      {
        placement: 'front',
        image_url: imageUrl,
        position: {
          area_width: 1800,
          area_height: 2400,
          width: 1800,
          height: 1800,
          top: 300,
          left: 0,
        },
      },
      {
        placement: 'back',
        image_url: imageUrl,
        position: {
          area_width: 1800,
          area_height: 2400,
          width: 1800,
          height: 1800,
          top: 300,
          left: 0,
        },
      },
    ],
  };

  console.log('Payload to Printful:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      `https://api.printful.com/mockup-generator/create-task/${productId}`, // Include productId in the URL
      payload,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`, // Use environment variable
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Printful API Response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Printful API responded with an error status code
      console.error('Printful API Error:', JSON.stringify(error.response.data, null, 2));
      res.status(500).json({ error: 'Failed to create mockup task', details: error.response.data });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from Printful API:', error.request);
      res.status(500).json({ error: 'No response from Printful API' });
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
  }
});

// Endpoint to get task status and results
app.get('/api/get-task', async (req, res) => {
  const { task_key } = req.query;

  if (!task_key) {
    console.error('Task key is missing in the request query.');
    return res.status(400).json({ error: 'Task key is required' });
  }

  console.log(`Fetching task status for task_key: ${task_key}`);

  try {
    const response = await axios.get(
      `https://api.printful.com/mockup-generator/task?task_key=${task_key}`,
      {
        headers: {
          Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        },
      }
    );

    console.log('Printful API Task Status Response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Printful API Error:', JSON.stringify(error.response.data, null, 2));
      res.status(500).json({ error: 'Failed to get task status', details: error.response.data });
    } else if (error.request) {
      console.error('No response from Printful API:', error.request);
      res.status(500).json({ error: 'No response from Printful API' });
    } else {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
