import bcrypt from "bcrypt";
import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";

export const getProfileService = async (userId) => {
  const userProfile = await User.findOne({
    where: { user_id: userId },
    attributes: ["user_id", "username", "email"],
    include: [
      {
        model: Profile,
        attributes: ["avatar", "phone", "address", "bio", "birthday"],
      },
    ],
  });

  if (!userProfile) {
    throw new Error("User not found");
  }

  return userProfile;
};

export const updateProfileService = async (userId, data) => {
  let profile = await Profile.findOne({ where: { user_id: userId } });
  if (!profile) {
    profile = Profile.create({ user_id: userId, ...data });
  } else {
    profile.update(data);
  }
  return profile;
};

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error("Old password incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return "Password updated successfully";
};

export const updateAvatar = async (userId, filePath) => {
  const profile = await Profile.findOne({ where: { user_id: userId } });

  if (!profile) {
    // nếu chưa có profile thì tạo mới
    return await Profile.create({ userId, avatar: filePath });
  }

  // cập nhật avatar
  profile.avatar = filePath;
  await profile.save();

  return profile;
};
