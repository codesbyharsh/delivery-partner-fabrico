const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

// ✅ Get all orders with customer info
router.get("/", async (req, res) => {
  try {
    // Populate user info for each order
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name address phone email"); // only pick needed fields

    // Transform orders for frontend display
    const formattedOrders = orders.map((order) => {
      const customer = order.user || {};
      const defaultAddress = customer.address?.find(a => a.isDefault) || {};
      return {
        _id: order._id,
        customerName: customer.name || "N/A",
        address: defaultAddress
          ? `${defaultAddress.addressLine1}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}`
          : "N/A",
        status: order.orderStatus,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        items: order.items,
        paymentMethod: order.paymentMethod,
        inBucket: order.inBucket,
        assignedTo: order.assignedTo,
        returnStatus: order.returnStatus
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// Toggle add/remove bucket for rider
router.post("/bucket/:orderId/toggle", async (req, res) => {
  try {
    const { riderId, riderName } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // If already in this rider’s bucket → remove
    if (order.inBucket && order.assignedTo?.riderId?.toString() === riderId) {
      order.inBucket = false;
      order.assignedTo = {
        riderId: null,
        riderName: null,
        assignedAt: null,
        deliveredAt: null,
        completed: false,
      };

      // ✅ Prevent invalid null
      if (!order.returnStatus || order.returnStatus === null) {
        order.returnStatus = "N/A";
      }

      await order.save();
      return res.json({ success: true, message: "Order removed", order });
    }

    // If already in another rider’s bucket → block
    if (order.inBucket && order.assignedTo?.riderId?.toString() !== riderId) {
      return res.status(400).json({
        error: `Order already in bucketlist of rider ${order.assignedTo?.riderName || "Unknown"}`,
      });
    }

    // Otherwise → assign to this rider
    order.inBucket = true;
    order.assignedTo = {
      riderId,
      riderName,
      assignedAt: new Date(),
      deliveredAt: null,
      completed: false,
    };

    // ✅ Prevent invalid null
    if (!order.returnStatus || order.returnStatus === null) {
      order.returnStatus = "N/A";
    }

    await order.save();

    res.json({ success: true, message: "Order added", order });
  } catch (err) {
    console.error("Toggle bucket error:", err);
    res.status(500).json({ error: err.message || "Failed to toggle bucket" });
  }
});

// Update returnStatus for an order
router.post("/:id/return-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { returnStatus } = req.body;

    if (!returnStatus) {
      return res.status(400).json({ error: "returnStatus is required" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.returnStatus = returnStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating returnStatus:", err);
    res.status(500).json({ error: "Server error updating returnStatus" });
  }
});

module.exports = router;
