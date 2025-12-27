import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
const port = 3000;
import connectdb from "./db/connectdb.js";
import route from "./routes/route.js";
import adminroute from "./routes/adminroute.js";
import serviceroute from "./routes/serviceroute.js";


const DATABASE_URL = process.env.DATABASE_URL;

// DB connection
connectdb(DATABASE_URL);

// Middleware for JSON
app.use(express.json());
app.use('/api', route);
app.use('/admin', adminroute);
app.use('/service', serviceroute);

app.get("/", (req, res) => {
  res.send("🚍 Abhi Dekho API is running...");
});

// 🔥 PING API (Render wake-up ke liye)
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "ok",

  });
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
