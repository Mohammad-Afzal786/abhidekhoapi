
const Userappversion = async (req, res) => {
  try {
    const appInfo = {
      latestVersion: "1.0.2", // 👈 current latest version
      apkUrl: "https://abhidekho.online/userapi/download-apk", // 👈 direct APK download link
      changelog: "🚀 New UI, bug fixes, and performance improvements.",
      forceUpdate: false, // 👈 true = user cannot skip update
      releaseDate: "2025-12-27",
    };
 
    return res.status(200).json({
      status: "success",
      message: "Latest app version fetched successfully",
      data: appInfo,
    });

  } catch (error) {
    console.error("❌ Error fetching app version:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

export { Userappversion};
