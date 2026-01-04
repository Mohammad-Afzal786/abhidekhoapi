import Vehicle from "../../models/VehicleModel.js";
import Service_Owner_Model from "../../models/service_owner_models/Service_Owner_Model.js";

// 🔹 Helper — calculate duration
function calculateDuration(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60;

  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  return `${hrs}h ${mins}m`;
}

const addVehicle = async (req, res) => {
  try {
    const {
      serviceOwnerId,
      vehicleName,
      vehicleNumber,
      vehicle,
      seats,
      acType,
      travlername,

      // Active wale required fields
      from,
      to,
      start,
      end,
      price,

    } = req.body;

    // 1️⃣ Required fields check
    if (
      !serviceOwnerId || !vehicleName || !vehicleNumber || !vehicle || !seats ||
      !from || !to || !start || !end || !price
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // 2️⃣ Check if service owner exists
    const ownerExists = await Service_Owner_Model.findOne({ serviceOwnerId: serviceOwnerId });
    if (!ownerExists) {
      return res.status(404).json({
        success: false,
        message: "Service Owner not found.",
      });
    }

    // 3️⃣ Check duplicate vehicle number
    const existing = await Vehicle.findOne({
      vehicleNumber,
      from,
      to,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Vehicle with this number already exists.",
      });
    }

    // 4️⃣ Calculate duration
    const duration = calculateDuration(start, end);

    // 5️⃣ Save vehicle
    const newVehicle = new Vehicle({
      serviceOwnerId,
      vehicleName,
      vehicleNumber,
      vehicle,
      seats,
      acType: acType || "NonAC",
      travlername: travlername || "AbhiDekho",
      from,
      to,
      start,
      end,
      duration,
      price,

    });

    await newVehicle.save();

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully!",
      data: newVehicle,
    });

  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding vehicle.",
      error: error.message,
    });
  }
};

export { addVehicle };
