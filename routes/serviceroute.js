import express from "express";

import { loginServiceOwner } from "../controllers/Services-Owner/Service_Owner_Login_Controller.js";
import { viewservices } from "../controllers/Services-Owner/view_services.js";
import { getservice } from "../controllers/Services-Owner/Get_services_Controller.js";


const serviceroute = express.Router();
/**
 * ================================
 * Routes
 * ================================
 */
serviceroute.post("/login", loginServiceOwner);
serviceroute.get("/getservice", getservice);
serviceroute.get("/:vehicleId", viewservices);



export default serviceroute;