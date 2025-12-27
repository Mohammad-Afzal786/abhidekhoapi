import ServiceOwnerNotification from "../../models/service_owner_models/ServiceOwnerNotification.js";

const deleteServiceNotificationById = async (req, res) => {
  try {
    const { serviceOwnerId, notificationId } = req.query;

    if (!serviceOwnerId || !notificationId) {
      return res.status(400).json({
        status: "error",
        message: "Service Owner ID and Notification ID are required",
      });
    }

    const ownerNotifications = await ServiceOwnerNotification.findOne({ serviceOwnerId });

    if (!ownerNotifications) {
      return res.status(404).json({
        status: "error",
        message: "Service owner notifications not found",
      });
    }

    const initialLength = ownerNotifications.notifications.length;

    // Remove the notification by ID
    ownerNotifications.notifications = ownerNotifications.notifications.filter(
      (n) => n._id.toString() !== notificationId
    );

    if (ownerNotifications.notifications.length === initialLength) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    await ownerNotifications.save();

    return res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service owner notification:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

export { deleteServiceNotificationById };
