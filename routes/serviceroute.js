import express from "express";

import { loginServiceOwner } from "../controllers/Services-Owner/Service_Owner_Login_Controller.js";
import { viewservices } from "../controllers/Services-Owner/view_services.js";
import { getservice } from "../controllers/Services-Owner/Get_services_Controller.js";
import { getServiceOwnerNotifications } from "../controllers/Services-Owner/getServiceOwnerNotifications.js";
import { deleteServiceNotificationById } from "../controllers/Services-Owner/ServiceOwnerNotification.js";
import { ServiceOwnerFcmToken } from "../controllers/Services-Owner/ServiceOwnerFcmToken.js";
import { logUserActivity } from "../controllers/activityController.js";


const serviceroute = express.Router();
/**
 * ================================
 * Routes
 * ================================
 */
serviceroute.post("/login", loginServiceOwner);
serviceroute.get("/getservice", getservice);
serviceroute.get("/:vehicleId", viewservices);
serviceroute.get("/service-owner/notifications", getServiceOwnerNotifications);
serviceroute.delete("/deleteServiceNotificationById", deleteServiceNotificationById);
serviceroute.post("/fcm/save", ServiceOwnerFcmToken);
serviceroute.post("/useractivity", logUserActivity);


 



export default serviceroute;