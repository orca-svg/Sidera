const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sidera')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes (Placeholders for now)
app.get('/', (req, res) => {
    res.send('Sidera Backend is running');
});

// Import Routes
const projectRoutes = require('./routes/projects');
const nodeRoutes = require('./routes/nodes');
const edgeRoutes = require('./routes/edges');
const chatRoutes = require('./routes/chat');

app.use('/api/projects', projectRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
