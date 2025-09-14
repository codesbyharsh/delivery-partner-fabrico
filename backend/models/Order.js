// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Items ordered
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true }
  }],

  // Shipping info
  shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true },

  // Payment
  paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
  totalAmount: { type: Number, required: true },

  // Order status lifecycle
  orderStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Packed / Processing',
      'Shipped / Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Order Placed'
  },

  // ✅ Bucket assignment for riders
  inBucket: { type: Boolean, default: false },
  assignedTo: {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
    riderName: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    completed: { type: Boolean, default: false }
  },

  // Delivery timestamps
  placedAt: { type: Date, default: Date.now },
  packedAt: Date,
  shippedAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,

  // 🔥 Return & Refund lifecycle
returnStatus: {
  type: String,
  enum: [
    'Return Requested',
    'Return Approved / Pickup Scheduled',
    'Return Picked Up',
    'Return in Transit',
    'Return Completed',
    'Refund Initiated',
    'Refund Completed',
    'N/A',   // included in enum
  ],
  default: 'N/A'  // ✅ safe default
},
  returnTimeline: {
    requestedAt: Date,
    approvedAt: Date,
    pickedUpAt: Date,
    inTransitAt: Date,
    completedAt: Date,
    refundInitiatedAt: Date,
    refundCompletedAt: Date
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
