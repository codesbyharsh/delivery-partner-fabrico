const express = require("express");
const Rider = require("../models/Rider");
const RiderLocation = require("../models/RiderLocation");

const router = express.Router();

// ✅ Rider login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const rider = await Rider.findOne({ username, password });
    if (!rider) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      _id: rider._id,
      username: rider.username,
      name: rider.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Update rider location
router.post("/:id/location", async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) return res.status(400).json({ error: "lat/lng required" });

    await RiderLocation.findOneAndUpdate(
      { rider: id },
      { coords: { lat, lng }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

// ✅ Get latest rider location
router.get("/:id/location", async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await RiderLocation.findOne({ rider: id });
    if (!loc) return res.json({ success: true, location: null });

    res.json({
      success: true,
      location: {
        lat: loc.coords.lat,
        lng: loc.coords.lng,
        updatedAt: loc.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

module.exports = router;
