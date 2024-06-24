import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  inviteLink: { type: String, require: true, unique: true },
  referrerId: { type: String },
  mnemonic: { type: String, unique: true, sparse: true },
  tempMnemonic: { type: String },
  date: { type: Date, default: Date.now },
  role: { type: Number, default: 0 },
});

const OrderModel = mongoose.model("order", OrderSchema);

export default OrderModel;
