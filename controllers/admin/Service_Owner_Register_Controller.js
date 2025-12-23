import dotenv from "dotenv";
dotenv.config();

import Service_Owner_Model from "../../models/service_owner_models/Service_Owner_Model.js";
import bcrypt from "bcrypt";

const passwordRegex = /^.{6,}$/;
const phoneRegex = /^\d{10}$/;

const createServiceOwner = async (req, res) => {
  try {
    let { name, password, phone, businessType, address, city, fcmtoken } =
      req.body;

    name = name?.trim();
    password = password?.trim();
    phone = phone?.trim();
    address = address?.trim();
    city = city?.trim();

    // ---------------- Required Fields ----------------
    if (!name || !password || !phone || !businessType) {
      return res.status(400).json({
        message: "Name, Phone, Password और Business Type ज़रूरी हैं।",
      });
    }

    // ---------------- Phone Validation ----------------
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "10 अंकों का वैध मोबाइल नंबर डालें।",
      });
    }

    // ---------------- Password Validation ----------------
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      });
    }

    // ---------------- Duplicate Check ----------------
    const exists = await Service_Owner_Model.findOne({ phone });
    if (exists) {
      return res.status(409).json({
        message: "Mobile number already exists",
      });
    }

    // ---------------- Hash Password ----------------
    const hash = await bcrypt.hash(password, 10);

    // ---------------- Save Owner ----------------
    const savedOwner = await new Service_Owner_Model({
      name,
      password: hash,
      phone,
      businessType,
      address: address || "",
      city: city || "",
      fcmtoken: fcmtoken || "",
      registration_date: new Date(),
      isVerified: false,
    }).save();

    // ---------------- Success Response ----------------
    return res.status(201).json({
      message: "Service Owner created successfully",
      serviceOwner: {
        id: savedOwner._id,
        ownerId: savedOwner.ownerId,
        name: savedOwner.name,
        phone: savedOwner.phone,
        businessType: savedOwner.businessType,
        address: savedOwner.address,
        city: savedOwner.city,
      },
    });
  } catch (err) {
    console.error("ServiceOwner create error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { createServiceOwner };
