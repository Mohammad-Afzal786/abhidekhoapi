import Booking from "../models/Booking_model.js";
import Vehicle from "../models/VehicleModel.js";
import { sendServiceOwnerNotification } from "./Services-Owner/sendServiceOwnerNotification.js";


// 🟢 Create new booking
const createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      from,
      to,
      dateOfJourney,
      totalAmount,
      userId,
      passengers,
      status,
    } = req.body;

    // 🛑 Basic Validation
    if (!vehicleId || !from || !to || !dateOfJourney || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide all booking details.",
      });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one passenger detail is required.",
      });
    }

   // 🔍 Check if vehicle exists
    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `No vehicle found with ID ${vehicleId}.`,
      });
    }

    // 🚫 Check if this user already booked on same activeVehicleId
    const existingBooking = await Booking.findOne({
      vehicleId,
      userId,
       dateOfJourney,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked a seat on this vehicle.",
      });
    }

    // 🧠 Get all booked seat numbers for this active vehicle
    const bookedSeats = await Booking.find(
      { vehicleId,  dateOfJourney },
      { passengers: 1, _id: 0 }
    );

    const allBookedSeatNumbers = bookedSeats.flatMap(b =>
      b.passengers.map(p => p.seatNumber)
    );

    // 🚫 Check if any requested seat is already booked
    const conflictingSeats = passengers.filter(p =>
      allBookedSeatNumbers.includes(p.seatNumber)
    );

    if (conflictingSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seat(s) already booked: ${conflictingSeats
          .map(p => p.seatNumber)
          .join(", ")}.`,
      });
    }

    // 💾 Save booking
    const booking = new Booking({
       vehicleId,
      from,
      to,
      dateOfJourney,
      totalAmount,
      userId,
      passengers,
      status: status || "confirmed",
    });

    await booking.save();
    // 🔍 Vehicle nikaalo


if (vehicle && vehicle.serviceOwnerId) {
  await sendServiceOwnerNotification({
    serviceOwnerId: vehicle.serviceOwnerId,
    title: "New Booking Received 🚍",
    body: `Route: ${from} → ${to}\nDate: ${dateOfJourney}\nSeats: ${passengers.length}`,
    
  });
}

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    let friendlyMessage = "Something went wrong.";

  // Passenger validation errors ko readable banao
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors)
      .map(err => err.message.replace("Path ", "").replace("`", "").replace("`", ""))
      .join(", ");

    friendlyMessage = `${errors}`;
  }

    res.status(500).json({
      success: false,
        message: friendlyMessage,
    error: error.message,
    });
  }
};

export { createBooking };
