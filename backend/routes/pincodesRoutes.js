// routes/pincodeRoutes.js
const express = require("express");
const Pincode = require("../models/Pincode");

const router = express.Router();

/**
 * Get all available pincodes
 * GET /api/pincodes
 */
router.get("/", async (req, res) => {
  try {
    const pincodes = await Pincode.find({ deliveryAvailable: true });
    res.json({ success: true, data: pincodes });
  } catch (err) {
    console.error("Error fetching pincodes:", err);
    res.status(500).json({ error: "Failed to fetch pincodes" });
  }
});

module.exports = router;
