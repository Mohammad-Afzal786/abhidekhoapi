import mongoose from "mongoose";
import Counter from "./Counter.js"; // for sequential vehicleId

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, unique: true }, // auto-generate V-00001
    serviceOwnerId: {
      type: String
    },
    vehicleName: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, unique: true, trim: true },

    vehicle: {
      type: String,
      enum: ["Bus", "Car"],
      required: true,
    },

    seats: { type: Number, required: true },

    // ✅ AC / Non-AC type field
    acType: {
      type: String,
      enum: ["AC", "NonAC"],
      required: true,
      default: "NonAC",
    },
    travlername: { type: String, default: "AbhiDekho" },


    // 🔹 ActiveVehicle wale fields yaha add kiye
    from: { type: String, required: true },
    to: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },



    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook — auto-generate vehicleId
vehicleSchema.pre("save", async function (next) {
  if (!this.isNew || this.vehicleId) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "vehicleId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const last = await this.constructor
      .findOne({}, {}, { sort: { createdAt: -1 } })
      .lean();

    let lastIdNumber = 0;
    if (last && last.vehicleId) {
      const match = last.vehicleId.match(/V-(\d+)/);
      if (match) lastIdNumber = parseInt(match[1], 10);
    }

    if (counter.seq <= lastIdNumber) {
      counter = await Counter.findOneAndUpdate(
        { _id: "vehicleId" },
        { $set: { seq: lastIdNumber + 1 } },
        { new: true, upsert: true }
      );
    }

    this.vehicleId = `V-${counter.seq.toString().padStart(5, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
