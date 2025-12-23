import mongoose from "mongoose";
import Counter from "../Counter.js";

const ServiceOwnerSchema = new mongoose.Schema(
  {
    serviceOwnerId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fcmtoken: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String, 
      enum: ["VehicleOwner",],
      required: true
    },
    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔹 Auto-generate sequential ownerId (SO-00001)
ServiceOwnerSchema.pre("save", async function (next) {
  if (!this.isNew || this.ownerId) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "serviceOwnerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const last = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } }).lean();
    let lastId = 0;

    if (last && last.ownerId) {
      const match = last.ownerId.match(/SO-(\d+)/);
      if (match) lastId = parseInt(match[1], 10);
    }

    if (counter.seq <= lastId) {
      counter = await Counter.findOneAndUpdate(
        { _id: "serviceOwnerId" },
        { $set: { seq: lastId + 1 } },
        { new: true }
      );
    }

    this.serviceOwnerId = `SO-${counter.seq.toString().padStart(5, "0")}`;
    next();
  } catch (err) {
    console.error("ServiceOwner ID error:", err);
    next(err);
  }
});

export default mongoose.model("ServiceOwner", ServiceOwnerSchema);
