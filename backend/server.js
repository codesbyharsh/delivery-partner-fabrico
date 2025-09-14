require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models must be loaded once
require("./models/Rider");
require("./models/RiderLocation");

const riderRoutes = require("./routes/riderRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pincodesRoutes = require("./routes/pincodesRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

const app = express();

// ✅ Enable CORS for all origins
app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

// Routes
app.use("/api/rider", riderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pincodes", pincodesRoutes);
app.use("/api/delivery", deliveryRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
