
// deliveryRoutes.js
const express = require("express");
const Order = require("../models/Order");
const Rider = require("../models/Rider");

const router = express.Router();

// Get bucketlist for a rider
router.get("/bucket/:riderName", async (req, res) => {
  try {
    const { riderName } = req.params;

    const orders = await Order.find({
      inBucket: true,
      "assignedTo.riderName": riderName
    })
      .populate("user")
      .populate("items.product");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching bucketlist:", error);
    res.status(500).json({ error: "Server error while fetching bucketlist" });
  }
});

router.post("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, riderName } = req.body;

    if (!status || !riderName) {
      return res.status(400).json({ error: "status and riderName are required" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Only allow rider assigned to order to update status
    if (order.assignedTo?.riderName !== riderName) {
      return res.status(403).json({ error: "You are not assigned to this order" });
    }

    // Update order status
    order.orderStatus = status;

    // Initialize assignedTo if missing
    if (!order.assignedTo) {
      order.assignedTo = { riderId: null, riderName: riderName, assignedAt: new Date() };
    }

    // If delivered, mark completed and deliveredAt
    if (status === "Delivered") {
      order.assignedTo.completed = true;
      order.assignedTo.deliveredAt = new Date();
      order.inBucket = false; // optionally remove from bucketlist
    }

    // Keep a history in bucketHistory
    if (!order.bucketHistory) order.bucketHistory = [];
    order.bucketHistory.push({ action: status, riderName, timestamp: new Date() });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Server error updating order status" });
  }
});


module.exports = router;
