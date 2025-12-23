import City from "../../models/CityModel.js";

// 🟢 Add new city (with points merge if city already exists)
const addCity = async (req, res) => {
  try {
    const { cityName, points } = req.body;

    // Validation
    if (!cityName || !points || !Array.isArray(points) || points.length === 0) {
      return res.status(400).json({
        success: false,
        message: "cityName aur kam se kam 1 point dena zaruri hai.",
      });
    }

    // Check if city already exists
    const existingCity = await City.findOne({ cityName });

    if (existingCity) {
      // Merge new points with existing ones (remove duplicates)
      const allPoints = [...new Set([...existingCity.points, ...points])];

      // Agar new points add hue hain to update
      if (allPoints.length !== existingCity.points.length) {
        existingCity.points = allPoints;
        await existingCity.save();

        return res.status(200).json({
          success: true,
          message: "City already exists — new points added successfully!",
          data: existingCity,
        });
      }

      // Agar koi naya point nahi tha
      return res.status(200).json({
        success: true,
        message: "City already exists — no new points to add.",
        data: existingCity,
      });
    }

    // Agar city exist nahi karti → create new
    const newCity = new City({
      cityName,
      points,
    });

    await newCity.save();

    res.status(201).json({
      success: true,
      message: "New city added successfully!",
      data: newCity,
    });
  } catch (error) {
    console.error("Error while adding city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding city",
      error: error.message,
    });
  }
};

export { addCity };
