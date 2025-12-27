import mongoose from "mongoose";

const serviceOwnerNotificationSchema = new mongoose.Schema({
  serviceOwnerId: {
    type: String,
    required: true,
    unique: true, // 👈 ek owner = ek document
  },
  notifications: [
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      
    
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});
 
export default mongoose.model("ServiceOwnerNotification", serviceOwnerNotificationSchema);


 
