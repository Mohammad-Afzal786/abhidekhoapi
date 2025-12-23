import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD

    users: [
      {
        userId: { type: String, required: true },
        visits: { type: Number, default: 1 },
        appVersionId: { type: String, required: true },
        userType: {
          type: String,
          enum: ["user", "serviceOwner"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// 🔹 UPDATED: logActivity function
userActivitySchema.statics.logActivity = async function (
  userId,
  appVersionId,
  userType
) {
  const today = new Date().toISOString().split("T")[0];

  let record = await this.findOne({ date: today });

  // ➤ If no record for today → create new entry
  if (!record) {
    return this.create({
      date: today,
      users: [
        {
          userId,
          visits: 1,
          appVersionId,
          userType,
        },
      ],
    });
  }

  // ➤ Check if user already exists for today
  const userIndex = record.users.findIndex((u) => u.userId === userId);

  if (userIndex === -1) {
    // ➤ New user entry for today
    record.users.push({
      userId,
      visits: 1,
      appVersionId,
      userType,
    });
  } else {
    // ➤ Existing user → increment visit & update info
    record.users[userIndex].visits += 1;
    record.users[userIndex].appVersionId = appVersionId;
    record.users[userIndex].userType = userType;
  }

  return record.save();
};

const UserActivity = mongoose.model("UserActivity", userActivitySchema);
export { UserActivity };
