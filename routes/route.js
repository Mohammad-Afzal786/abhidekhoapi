import express from "express";

import { createUser } from "../controllers/UserRagisterationControllers.js";
import loginUser from "../controllers/UserLoginController.js";


import forgotPassword from "../controllers/ForgotPassword.js";
import resetPassword from "../controllers/ResetPassword.js";

import getProfile from "../controllers/GetProfile.js";
import updateProfile from "../controllers/updateProfile.js";



import { getNotifications } from "../controllers/usernotification.js";

import { getBanners } from "../controllers/Get_Banner.js";
import { deleteNotificationByid } from "../controllers/deletenotificaton.js";
import { userProfileUpdate } from "../controllers/userprofileupdate.js";

import { logUserActivity } from "../controllers/activityController.js";

import { saveFcmToken } from "../controllers/FcmController.js";
import { getAllCityWithPoints } from "../controllers/GetCities.js";
import { searchActiveVehicles } from "../controllers/searchActiveVehicles.js";
import { createBooking } from "../controllers/Booking.js";
import { getBookingsByUserId } from "../controllers/getBookingsByUserId.js";
const route = express.Router();





/**
 * ================================
 * Routes
 * ================================
 */

route.get("/city", getAllCityWithPoints);
route.get("/searchActiveVehicles", searchActiveVehicles);
route.post("/createBooking", createBooking);
route.get("/user/:userId", getBookingsByUserId);
// Register new user
route.post("/register", createUser);
route.post("/login", loginUser);

// forget password
route.post("/forgotpassword", forgotPassword);
// reset password
route.post("/resetpassword", resetPassword);
// Protected route
route.get("/getprofile", getProfile);
route.put("/updateProfile", updateProfile);

route.get("/get-notifications", getNotifications);
route.get("/getbanner", getBanners);
route.delete("/deleteNotificationByid", deleteNotificationByid);
route.put("/userProfileUpdate/:userId", userProfileUpdate);
route.post("/useractivity", logUserActivity);
route.post("/fcm/save", saveFcmToken);
export default route;