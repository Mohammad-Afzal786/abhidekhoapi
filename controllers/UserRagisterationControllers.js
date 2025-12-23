import dotenv from "dotenv";
dotenv.config();
import User from "../models/UserRagisterationModel.js";
import bcrypt from "bcrypt";

// --- Validators ---

const passwordRegex = /^.{6,}$/; // At least 6 characters
const phoneRegex = /^\d{10}$/; // Exactly 10 digits

// --- Register Api ---
const createUser = async (req, res) => {
    try {
        let { name, password, phone, fcmtoken } = req.body;

        // Trim inputs
        name = name?.trim();
        phone = phone?.trim();
        password = password?.trim();
        

        // 1️⃣ Required fields check
        if (!name || !password || !phone) {
            return res.status(400).json({ 
success: false,
                message: "नाम, फ़ोन नंबर और पासवर्ड — तीनों भरना ज़रूरी है।" });
        }

        // 2️⃣ phone format check
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                 message: "फ़ोन नंबर 10 अंकों का होना चाहिए।" });
        }

        // 3️⃣ Strong password check
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                 message: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" });
        }

      

        // 5️⃣ Duplicate phone check
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                 message: "Mobile number already exists" });
        }

        // 6️⃣ Password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7️⃣ Save user (email optional)
        const savedUser = await new User({
            name,
            password: hashedPassword,
            phone,
            fcmtoken: fcmtoken || "",
            registration_date: new Date(),
            isVerified: false
        }).save();

        // ✅ Response to client
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: savedUser.userId,
            name: savedUser.name,
            phone: savedUser.phone,
            fcmtoken: savedUser.fcmtoken || "",
            user: {
                id: savedUser.userId,
                name: savedUser.name,
                phone: savedUser.phone,
                
                fcmtoken: savedUser.fcmtoken || ""
            }
        });

    } catch (err) {
        console.error("Error in createUser:", err);
        return res.status(500).json({ 
            success: false,
            message: "Something went wrong, please try again later." });
    }
};

export { createUser };
