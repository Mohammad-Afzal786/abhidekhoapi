import admin from "firebase-admin";
import path from "path";
import { readFileSync } from "node:fs";
import Service_Owner_Model from "../../models/service_owner_models/Service_Owner_Model.js";
import ServiceOwnerNotification from "../../models/service_owner_models/ServiceOwnerNotification.js";


// Firebase init (same as before)
const serviceAccountPath = path.resolve("./config/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendServiceOwnerNotification = async ({
  serviceOwnerId,
  title,
  body,
   
}) => {
  try {
    // 🔹 Save notification in DB (user jaisa hi)
    await ServiceOwnerNotification.findOneAndUpdate(
      { serviceOwnerId },
      {
        $push: {
          notifications: {
            title,
            message: body,
            
          },
        },
      },
      { upsert: true, new: true }
    );

    // 🔹 Find owner for FCM
    const owner = await Service_Owner_Model.findOne({ serviceOwnerId });

    if (!owner || !owner.fcmtoken) {
      console.log("⚠️ FCM token not found, saved in DB only");
      return;
    }

    // 🔹 Send FCM
    const message = {
      token: owner.fcmtoken.trim(),
      notification: {
        title,
        body,
         
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        screen: "owner_booking",
         
      },
    };

    await admin.messaging().send(message);

    console.log("✅ ServiceOwner notification sent & saved");
  } catch (error) {
    console.error("❌ ServiceOwner notification error:", error.message);
  }
};

export { sendServiceOwnerNotification };
