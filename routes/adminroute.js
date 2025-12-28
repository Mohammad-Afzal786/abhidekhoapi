import express from "express";
import { sendNotification } from "../controllers/admin/notification.js";
import { addBanner } from "../controllers/admin/bannerController.js";
 import { addCity } from "../controllers/admin/CityController.js";
import { addVehicle } from "../controllers/admin/Add_Vehicle_Controller.js";
import { createServiceOwner } from "../controllers/admin/Service_Owner_Register_Controller.js";
import { appversion } from "../controllers/admin/ServicesappVersionRoute.js";
import { Userappversion } from "../controllers/admin/UserappVersionRoute.js";
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
adminroute.get('/Userappversion', Userappversion);
adminroute.post('/cities/add', addCity);
// Add vehicle
adminroute.post("/add-vehicle", addVehicle);



export default adminroute;