import Booking from "../models/Booking_model.js";
import Vehicle from "../models/VehicleModel.js";

const getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    // 🔹 Get all bookings of this user
    const bookings = await Booking.find({ userId }).lean();

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        message: "No bookings found for this user.",
      });
    }

    // 🔹 Prepare result
    const results = [];

    for (const booking of bookings) {
      // find active vehicle using activeVehicleId
      const vehicle  = await Vehicle.findOne({
        vehicleId: booking.vehicleId,
      }).lean();

      if (!vehicle) continue;

      results.push({
        bookingId: booking.bookingId,
        status: booking.status,
        from: booking.from,
        to: booking.to,
        dateOfJourney: booking.dateOfJourney,
        totalAmount: booking.totalAmount,
        passengers: booking.passengers,

        // Active Vehicle Info
        fromLocation: vehicle.from,
        toLocation: vehicle.to,
        departureTime: vehicle.start,
        arrivalTime: vehicle.end,
        duration: vehicle.duration,
        price: vehicle.price,
        date: vehicle.date,
        travlername: vehicle.travlername,

        // Vehicle Info
        driverName: "Ankit Sharma",
        driverNumber: "9876543210",
        vehicleName: vehicle?.vehicleName || "N/A",
        vehicleNumber: vehicle?.vehicleNumber || "N/A",
        vehicleType: vehicle?.vehicle || "N/A",
        acType: vehicle?.acType || "N/A",
        totalSeats: vehicle?.seats || 0,
      });
    }

    // ✅ Send Final Response
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings.",
      error: error.message,
    });
  }
};

export { getBookingsByUserId };
