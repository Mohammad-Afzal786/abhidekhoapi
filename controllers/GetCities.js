import City from "../models/CityModel.js";

// 🟢 Get all cities with their boarding points (single API)
const getAllCityWithPoints = async (req, res) => {
  try {
    const cities = await City.find({}, { cityName: 1, points: 1 }).sort({ cityName: 1 });

    if (!cities || cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cities found in the database.",
      });
    }

    // Convert array of docs → key-value map like {"Delhi": [...points]}
    const cityMap = {};
    cities.forEach((c) => {
      cityMap[c.cityName] = c.points;
    });

    res.status(200).json({
      success: true,
      totalCities: cities.length,
      data: cityMap,
    });
  } catch (error) {
    console.error("Error fetching city data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cities and points.",
      error: error.message,
    });
  }
};

export { getAllCityWithPoints };
