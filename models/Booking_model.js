import mongoose from "mongoose";
import Counter from "./Counter.js";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true }, // auto B-00001
    vehicleId: { type: String, required: true },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },


    from: { type: String, required: true },
    to: { type: String, required: true },
    dateOfJourney: { type: String, required: true },

    totalAmount: { type: Number, required: true },
    userId: { type: String, required: true },

    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ["Male", "Female"], required: true },
        seatNumber: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

// 🔹 Auto-generate sequential bookingId: B-00001
bookingSchema.pre("save", async function (next) {
  if (!this.isNew || this.bookingId) return next();

  try {
    let counter = await Counter.findOneAndUpdate(
      { _id: "bookingId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.bookingId = `B-${counter.seq.toString().padStart(8, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
