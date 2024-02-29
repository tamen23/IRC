const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./database/connection");
const setupSocket = require("./socket/PrivateMessage");

const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 3002;
dotenv.config({ path: ".env" });

app.use(morgan("tiny"));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

connectDB();

app.use(express.json());
app.use("/", require("./routes/router"));
app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Ok gars",
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

setupSocket(server);
