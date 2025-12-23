import Vehicle from "../../models/VehicleModel.js";
import Booking from "../../models/Booking_model.js";

const getservice = async (req, res) => {
  try {
    const { serviceOwnerId } = req.query;

    if (!serviceOwnerId) {
      return res.status(400).json({
        success: false,
        message: "serviceOwnerId is required.",
      });
    }

    // Fetch all vehicles for this service owner
    const vehicles = await Vehicle.find({ serviceOwnerId }).sort({ createdAt: -1 });

    if (!vehicles.length) {
      return res.status(404).json({
        success: false,
        message: "No vehicles found for this service owner.",
        data: [],
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all bookings for these vehicles
    const bookings = await Booking.find({
      vehicleId: { $in: vehicles.map(v => v.vehicleId) },
    });

    // Map vehicleId -> counts
    const vehicleCounts = {};
    vehicles.forEach(v => {
      vehicleCounts[v.vehicleId] = { today: 0, upcoming: 0 };
    });

    // Calculate today/upcoming counts
    bookings.forEach(b => {
      const journeyDate = new Date(b.dateOfJourney);
      journeyDate.setHours(0, 0, 0, 0);

      if (vehicleCounts[b.vehicleId]) {
        if (journeyDate.getTime() === today.getTime()) {
          vehicleCounts[b.vehicleId].today++;
        } else if (journeyDate.getTime() > today.getTime()) {
          vehicleCounts[b.vehicleId].upcoming++;
        }
      }
    });

    // Merge counts directly as flat fields
    const vehiclesWithCounts = vehicles.map(v => {
      const counts = vehicleCounts[v.vehicleId] || { today: 0, upcoming: 0 };
      return {
        ...v.toObject(),
        today: counts.today.toString(),       // direct String
        upcoming: counts.upcoming.toString(), // direct String
      };
    });

    return res.status(200).json({
      success: true,
      message: "services fetched successfully.",
      data: vehiclesWithCounts,
    });

  } catch (error) {
    console.error("Error in getservice:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching vehicles.",
      error: error.message,
    });
  }
};

export { getservice };
