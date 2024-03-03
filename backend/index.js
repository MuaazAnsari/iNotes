import connectToMongo from "./db.js";
import express from "express";
import authRoutes from './routes/auth.js';
// import notesRoutes from './routes/notes.js';
connectToMongo();
const app = express()
const port = 3000

//Available Routes

app.use('/api/auth', authRoutes)
// app.use('/api/notes', notesRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})