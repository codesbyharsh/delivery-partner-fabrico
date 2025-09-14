const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  taluka: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  deliveryAvailable: { 
    type: Boolean, 
    default: true 
  },
}, { 
  timestamps: true 
});

// Create the model
const Pincode = mongoose.model('Pincode', pincodeSchema);

// Export the model
module.exports = Pincode;