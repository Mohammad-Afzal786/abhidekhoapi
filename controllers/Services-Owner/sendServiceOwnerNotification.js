import admin from "firebase-admin";
import path from "path";
import { readFileSync } from "node:fs";
import Service_Owner_Model from "../../models/service_owner_models/Service_Owner_Model.js";

// ✅ Firebase Service Account
const serviceAccountPath = path.resolve("./config/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// ✅ Init Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Send notification to SINGLE ServiceOwner
 */
const sendServiceOwnerNotification = async ({
  serviceOwnerId,
  title,
  body,
  image = "",
  data = {},
}) => {
  try {
    // 🔹 Find service owner
    const owner = await Service_Owner_Model.findOne({ serviceOwnerId });

    if (!owner || !owner.fcmtoken) {
      console.log("❌ ServiceOwner or FCM token not found");
      return;
    }

    const message = {
      token: owner.fcmtoken.trim(),
      notification: {
        title,
        body,
        image,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        screen: "owner_booking",
        ...data,
      },
    };

    const response = await admin.messaging().send(message);

    console.log("✅ Notification sent to ServiceOwner:", response);
  } catch (error) {
    console.error("❌ ServiceOwner notification error:", error.message);
  }
};

export { sendServiceOwnerNotification };
