
import Vehicle from "../models/VehicleModel.js";
import City from "../models/CityModel.js";
import Booking from "../models/Booking_model.js"; // 👈 Added

// 🔍 Search active vehicles by from, to, and date
export const searchActiveVehicles = async (req, res) => {
  try {
    const { from, to , date} = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide from, to, and date.",
      });
    }

    // 🏙️ Step 1: Match city or its points for both 'from' and 'to'
    const fromCity = await City.findOne({
      $or: [
        { cityName: { $regex: new RegExp(`^${from}$`, "i") } },
        { points: { $regex: new RegExp(`^${from}$`, "i") } },
      ],
    });

    const toCity = await City.findOne({
      $or: [
        { cityName: { $regex: new RegExp(`^${to}$`, "i") } },
        { points: { $regex: new RegExp(`^${to}$`, "i") } },
      ],
    });

    if (!fromCity || !toCity) {
      return res.status(404).json({
        success: false,
        message: `No matching route found for "${from}" → "${to}".`,
      });
    }

    // 🧭 Normalize city names
    const normalizedFrom = fromCity.cityName;
    const normalizedTo = toCity.cityName;

    // 🚍 Find matching vehicles
    const vehicles = await Vehicle.find({
      from: normalizedFrom,
      to: normalizedTo,
      
    });

    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vehicles found for this route",
      });
    }


    

   
    // 🔗 Step 4: Merge data with bookedSeats info
    const result = await Promise.all(
      vehicles.map(async v => {
        
        // 🔍 Get all booked seats for this activeVehicle
        const bookings = await Booking.find(
         { vehicleId: v.vehicleId, dateOfJourney: date },
          { passengers: 1, _id: 0 }
        );

        const bookedSeats = bookings.flatMap(b =>
          b.passengers.map(p => p.seatNumber)
        );

        return {
         
          vehicleId: v.vehicleId,
          vehicleName: v.vehicleName,
          vehicleNumber: v.vehicleNumber,
          vehicle: v.vehicle,
          seats: v.seats,
          travelarname:v.travlername,
          acType: v.acType,
          bookedSeats: bookedSeats || [], // 👈 booked seats array
          from: v.from,
          to: v.to,
          start: v.start,
          end: v.end,
          duration: v.duration,
          price: v.price,
          date: date,
          rating: 4.6,
         
        };
      })
    );

    // ✅ Step 5: Respond success
    res.status(200).json({
      success: true,
      message: "Active vehicles fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error while searching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching vehicles.",
      error: error.message,
    });
  }
};
