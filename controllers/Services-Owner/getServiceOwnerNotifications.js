import ServiceOwnerNotification from "../../models/service_owner_models/ServiceOwnerNotification.js";

const getServiceOwnerNotifications = async (req, res) => {
  try {
    const { serviceOwnerId } = req.query;

    if (!serviceOwnerId) {
      return res.status(400).json({
        status: "error",
        message: "Service Owner ID is required",
      });
    }

    // 🔹 Find service owner's notifications
    const ownerNotifications = await ServiceOwnerNotification.findOne(
      { serviceOwnerId },
      { notifications: 1, _id: 0 }
    );

    if (
      !ownerNotifications ||
      ownerNotifications.notifications.length === 0
    ) {
      return res.status(200).json({
        status: "success",
        message: "No notifications found",
        notifications: [],
      });
    }

    // 🔹 Sort notifications (latest first)
    const sorted = [...ownerNotifications.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      status: "success",
      message: "Service owner notifications fetched successfully",
      notifications: sorted,
    });
  } catch (error) {
    console.error("❌ Error in getServiceOwnerNotifications:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch service owner notifications",
      error: error.message,
    });
  }
};

export { getServiceOwnerNotifications };
