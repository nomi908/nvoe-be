import { getLoggedInUserService, updateLoggedInUserService } from "../services/user.service.js";

// Get profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await getLoggedInUserService(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

// Update profile
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Validate input if needed
    if (!name && !phone) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updatedUser = await updateLoggedInUserService(userId, updateData);
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};
