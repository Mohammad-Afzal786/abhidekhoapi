import express from "express";
import { sendNotification } from "../controllers/admin/notification.js";
import { addBanner } from "../controllers/admin/bannerController.js";
import { appversion } from "../controllers/admin/appVersionRoute.js";
import { addCity } from "../controllers/admin/CityController.js";
import { addVehicle } from "../controllers/admin/Add_Vehicle_Controller.js";
import { createServiceOwner } from "../controllers/admin/Service_Owner_Register_Controller.js";

const adminroute = express.Router();


/**
 * ================================
 * Routes
 * ================================
 */


adminroute.post("/register",createServiceOwner);
adminroute.post('/send-notification', sendNotification);
adminroute.post('/addbanner', addBanner);
adminroute.get('/appversion', appversion);
adminroute.post('/cities/add', addCity);
// Add vehicle
adminroute.post("/add-vehicle", addVehicle);



export default adminroute;