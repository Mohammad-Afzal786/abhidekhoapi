import Booking from "../../models/Booking_model.js";
import User from "../../models/UserRagisterationModel.js";

const viewservices = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const bookings = await Booking.find({ vehicleId })
      .sort({ createdAt: -1 })
      .lean(); // 🔹 important for modifying data

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this vehicleId",
      });
    }

    // 🔹 Extract unique userIds from bookings
    const userIds = [...new Set(bookings.map(b => b.userId))];

    // 🔹 Fetch users
    const users = await User.find(
      { userId: { $in: userIds } },
      { userId: 1, phone: 1, _id: 0 }
    ).lean();

    // 🔹 Create map → userId : phone
    const userMap = {};
    users.forEach(u => {
      userMap[u.userId] = u.phone;
    });

    // 🔹 Attach phone to each booking
    const finalBookings = bookings.map(b => ({
      ...b,
      phone: userMap[b.userId] || null,
    }));

    res.status(200).json({
      success: true,
      total: finalBookings.length,
      bookings: finalBookings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export { viewservices };
