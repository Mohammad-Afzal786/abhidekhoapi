import bcrypt from "bcrypt";
import User from "../models/UserRagisterationModel.js";
import dotenv from "dotenv";
dotenv.config();

const phoneRegex = /^.{10,}$/;

const MAX_ATTEMPTS = 5;               // Maximum failed login attempts
const BASE_LOCK_TIME = 5 * 60 * 1000; // 5 minutes lock base time

const loginUser = async (req, res) => {
    try {
        const { phone, password, fcmtoken } = req.body;

        // 1️⃣ Required fields check
        if (!phone || !password) {
            return res.status(400).json({
                message: "फ़ोन नंबर और पासवर्ड भरना ज़रूरी है।"
            });
        }

        // 2️⃣ phone validation
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                message: "फ़ोन नंबर कम से कम 10 अंकों का होना चाहिए।"
            });
        }

        // 3️⃣ Find user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({
                message: "इस नंबर से रजिस्ट्रेशन नहीं मिला, कृपया नया अकाउंट बनाएँ।"
            });
        }

        // 4️⃣ Check lock status
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(403).json({
                message: `Account locked. Try again after ${minutesLeft} minutes.`
            });
        }

        // 5️⃣ Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            if (user.loginAttempts >= MAX_ATTEMPTS) {
                const lockTime = BASE_LOCK_TIME * Math.pow(2, user.loginAttempts - MAX_ATTEMPTS);
                user.lockUntil = Date.now() + lockTime;
                await user.save();

                return res.status(403).json({
                    message: `Account locked due to multiple failed attempts. Try again later.`
                });
            }

            await user.save();
            return res.status(401).json({
                message: `Invalid credentials. ${MAX_ATTEMPTS - user.loginAttempts} attempts left.`
            });
        }

        // 6️⃣ On Success → reset attempts
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        // 7️⃣ Save FCM token
        if (fcmtoken) {
            user.fcmtoken = fcmtoken;
        }

        await user.save();

        // 8️⃣ Final success response (No JWT)
        res.status(200).json({
            message: "Login successful",
            userid: user.userId,
            user: {
                id: user.userId,
                name: user.name,
                phone: user.phone,
                fcmtoken: user.fcmtoken || null
            }
        });

    } catch (err) {
        console.error("Error in loginUser:", err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default loginUser;
