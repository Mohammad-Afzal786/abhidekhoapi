import dotenv from "dotenv";
dotenv.config();
import Service_Owner_Model from "../../models/service_owner_models/Service_Owner_Model.js";


const ServiceOwnerFcmToken = async (req, res) => {
  try {
    let { serviceOwnerId, fcmtoken } = req.body;

    serviceOwnerId = serviceOwnerId?.trim();
    fcmtoken = fcmtoken?.trim();

    if (!serviceOwnerId || !fcmtoken) {
      return res.status(400).json({ status: "error" });
    }

    const owner = await Service_Owner_Model.findOne({serviceOwnerId});
    if (!owner) {
      return res.status(404).json({ status: "error" });
    }

    owner.fcmtoken = fcmtoken;
    await owner.save();

    return res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error("❌ Error in saveServiceOwnerFcmToken:", error);
    return res.status(500).json({ status: "error" });
  }
};

export { ServiceOwnerFcmToken };
