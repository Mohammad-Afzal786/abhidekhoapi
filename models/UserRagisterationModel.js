import mongoose from "mongoose";
import Counter from "./Counter.js"; // same Counter model used for auto-increment

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // aapne "default true hatao" kaha tha — so sirf required rakha hai
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

// 🔹 Pre-save hook → auto generate sequential userId (like U-0001)
UserSchema.pre("save", async function (next) {
  if (!this.isNew || this.userId) return next(); // skip if already has userId

  try {
    // 1️⃣ Counter increment (atomic operation)
    let counter = await Counter.findOneAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 2️⃣ DB last record check (backup check)
    const last = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } }).lean();
    let lastIdNumber = 0;
    if (last && last.userId) {
      const match = last.userId.match(/U-(\d+)/);
      if (match) lastIdNumber = parseInt(match[1], 10);
    }

    // 3️⃣ Sync counter if it's behind the last record
    if (counter.seq <= lastIdNumber) {
      counter = await Counter.findOneAndUpdate(
        { _id: "userId" },
        { $set: { seq: lastIdNumber + 1 } },
        { new: true, upsert: true }
      );
    }

    // 4️⃣ Final userId assign (U-0001, U-0002, ...)
    this.userId = `U-${counter.seq.toString().padStart(5, "0")}`;
    console.log("Generated userId:", this.userId);

    next();
  } catch (err) {
    console.error("User ID generation failed:", err);
    next(err);
  }
});

const User = mongoose.model("User", UserSchema);
export default User;
