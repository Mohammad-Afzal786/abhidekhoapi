import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ServiceOwner from "../../models/service_owner_models/Service_Owner_Model.js";
import dotenv from "dotenv";
dotenv.config();

const MAX_ATTEMPTS = 5;
const BASE_LOCK_TIME = 5 * 60 * 1000; // 5 minutes

const loginServiceOwner = async (req, res) => {
  try {
    const { phone, password, fcmtoken } = req.body;

    // 🌟 Required Fields
    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone और Password ज़रूरी हैं।"
      });
    }

    // 🌟 Find Owner
    const owner = await ServiceOwner.findOne({ phone });
    if (!owner) {
      return res.status(401).json({
        message: "इस नंबर से कोई सर्विस ओनर रजिस्टर नहीं है।"
      });
    }

    // 🌟 Check Lock Status
    if (owner.lockUntil && owner.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((owner.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        message: `कई गलत प्रयासों की वजह से अकाउंट लॉक है। ${minutesLeft} मिनट बाद कोशिश करें।`
      });
    }

    // 🌟 Compare Password
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      owner.loginAttempts = (owner.loginAttempts || 0) + 1;

      // Lock if max attempts reached
      if (owner.loginAttempts >= MAX_ATTEMPTS) {
        const lockTime = BASE_LOCK_TIME * Math.pow(2, owner.loginAttempts - MAX_ATTEMPTS);
        owner.lockUntil = Date.now() + lockTime;

        await owner.save();
        return res.status(403).json({
          message: "बहुत सारे गलत प्रयास — अकाउंट कुछ समय के लिए लॉक कर दिया गया है।"
        });
      }

      await owner.save();
      return res.status(401).json({
        message: `गलत पासवर्ड। ${MAX_ATTEMPTS - owner.loginAttempts} प्रयास बाकी हैं।`
      });
    }

    // 🌟 Correct Login → Reset Attempts
    owner.loginAttempts = 0;
    owner.lockUntil = undefined;

    // Save FCM Token
    if (fcmtoken) owner.fcmtoken = fcmtoken;

    await owner.save();

    // 🌟 Generate JWT
    const token = jwt.sign(
      { ownerId: owner._id },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    return res.status(200).json({
      message: "Login successful",
      
      serviceOwner: {
        serviceOwnerId: owner.serviceOwnerId,
        name: owner.name,
        phone: owner.phone,
        businessType: owner.businessType,
        address: owner.address,
        city: owner.city,
      }
    });

  } catch (err) {
    console.error("Service Owner Login Error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { loginServiceOwner};
