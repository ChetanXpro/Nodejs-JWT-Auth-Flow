require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const { logger } = require("./middleware/logger");
const cors = require("cors");
const corsOption = require("./config/corsOptons");
const connectDB = require("./config/dbConnecton");
const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");
const port = process.env.PORT || 3500;

connectDB();
app.use(cors(corsOption));
app.use(logger);

app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.enable("trust proxy",1);



app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/user", require("./routes/userRoutes"));
app.use("/note", require("./routes/noteRoutes"));
app.use("/auth", require("./routes/authRoutes"));

app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      message: "404 Not Found(",
    });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  // logEvents(
  //   `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
  //   "mongoError.log"
  // );
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
  
