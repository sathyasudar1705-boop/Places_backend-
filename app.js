require("dotenv").config();
const express = require("express");
const HttpError = require("./models/http-error");

const placesRoutes = require("./routes/places-route");
const userRoutes = require("./routes/user-routes"); // if you have users
const mongoose = require("mongoose");

const app = express();

app.use(express.json()); // body parser replacement

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  
  // Handle pre-flight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "An unknown error occurred!" });
});


mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port} and MongoDB connected`));
})
.catch(err => console.log(err));