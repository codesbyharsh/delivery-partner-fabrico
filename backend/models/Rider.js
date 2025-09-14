const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain for now
  name: { type: String, required: true }
});

module.exports = mongoose.model("Rider", riderSchema);
