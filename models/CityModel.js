import mongoose from "mongoose";
import Counter from "./Counter.js"; // For sequential cityId generation

const citySchema = new mongoose.Schema(
  {
    cityId: { type: String, unique: true }, // e.g. CITY-000001
    cityName: { type: String, required: true, unique: true, trim: true },
    points: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook → auto-generate sequential cityId like CITY-000001
citySchema.pre("save", async function (next) {
  if (!this.isNew || this.cityId) return next();

  try {
    // 1️⃣ Increment counter atomically
    let counter = await Counter.findOneAndUpdate(
      { _id: "cityId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 2️⃣ Fallback: ensure counter is ahead of last DB record
    const lastCity = await this.constructor
      .findOne({}, {}, { sort: { createdAt: -1 } })
      .lean();

    let lastIdNumber = 0;
    if (lastCity && lastCity.cityId) {
      const match = lastCity.cityId.match(/CITY-(\d+)/);
      if (match) lastIdNumber = parseInt(match[1], 10);
    }

    // 3️⃣ Sync counter if behind
    if (counter.seq <= lastIdNumber) {
      counter = await Counter.findOneAndUpdate(
        { _id: "cityId" },
        { $set: { seq: lastIdNumber + 1 } },
        { new: true, upsert: true }
      );
    }

    // 4️⃣ Generate ID
    this.cityId = `CITY-${counter.seq.toString().padStart(3, "0")}`;
    console.log("Generated cityId:", this.cityId);
    return next();
  } catch (err) {
    console.error("City ID generation failed:", err);
    return next(err);
  }
});

const City = mongoose.model("City", citySchema);
export default City;
