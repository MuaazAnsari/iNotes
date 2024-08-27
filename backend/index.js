const express = require('express');
const connectToMongo = require('./db');

const app = express()
const port = 5000;

// To access req.body
app.use(express.json());

// Available Routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.listen(port, () => {
    connectToMongo();
  console.log(`Example app listening on port ${port}`)
})