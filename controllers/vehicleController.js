import Vehicle from "../models/VehicleModel.js";

// ✅ Get All Vehicles (optional vehicleType filter)
export const getVehicles = async (req, res) => {
  try {
    const { vehicleType } = req.query;
    const filter = {};

    if (vehicleType && vehicleType !== "ALL") {
      filter.vehicleType = vehicleType;
    }

    const vehicles = await Vehicle.find(filter).lean();
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Add a New Vehicle (for testing)
export const addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({
      success: true,
      message: "✅ Vehicle added successfully!",
      data: vehicle,
    });
  } catch (error) {
    console.error("❌ Error adding vehicle:", error);
    res.status(500).json({ success: false, message: "Failed to add vehicle" });
  }
};
