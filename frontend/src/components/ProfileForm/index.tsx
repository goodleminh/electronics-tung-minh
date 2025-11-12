import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchProfile,
  updateProfileThunk,
  uploadAvatarThunk,
} from "../../redux/features/profile/profileSlice";
import { toast } from "react-toastify";
import { isValidPhone, maskEmail } from "../../utils/mask/mask";

function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [showEmail, setShowEmail] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    day: "",
    month: "",
    year: "",
  });

  // Load profile
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Cập nhật form khi profile thay đổi
  useEffect(() => {
    if (!profile) return;

    const birthday = profile.Profile?.birthday || "";
    let day = "",
      month = "",
      year = "";
    if (birthday) [year, month, day] = birthday.split("-");

    setForm({
      username: profile.username || "",
      email: profile.email || "",
      phone: profile.Profile?.phone || "",
      bio: profile.Profile?.bio || "",
      day,
      month,
      year,
    });

    // Xử lý avatar
    if (profile?.Profile?.avatar) {
      const baseUrl = import.meta.env.VITE_API_URL;
      const fullUrl = `${baseUrl}${profile.Profile.avatar}`;
      setPreview(fullUrl);
      console.log(profile.Profile.avatar);
    }
  }, [profile]);
  // Cleanup preview URL khi unmount hoặc thay đổi file
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    // Tạo URL tạm để preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phone && !isValidPhone(form.phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    const birthday = `${form.year}-${form.month.padStart(
      2,
      "0"
    )}-${form.day.padStart(2, "0")}`;

    try {
      // 1. Update thông tin profile
      const resultAction = await dispatch(
        updateProfileThunk({ ...form, birthday })
      );
      if (updateProfileThunk.fulfilled.match(resultAction)) {
        toast.success("Cập nhật profile thành công!");
      } else {
        toast.error("Cập nhật profile thất bại!");
        return;
      }
      // 2. Upload avatar nếu có chọn
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);
        const uploadResult = await dispatch(uploadAvatarThunk(formData));
        if (uploadAvatarThunk.fulfilled.match(uploadResult)) {
          toast.success("Cập nhật avatar thành công!");
          setAvatar(null); // reset file
        } else {
          toast.error("Upload avatar thất bại!");
        }
      }
      // 3. Refetch profile để cập nhật state mới
      dispatch(fetchProfile());
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server!");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-10 border-t pt-6"
      >
        {/* Cột trái */}
        <div className="flex-1 space-y-6">
          {/* Username */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-gray-700 font-medium">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={form.username}
              readOnly
              className="col-span-2 border rounded px-3 py-2 bg-gray-100 w-75"
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-3 items-center gap-4 mt-4">
            <label className="text-gray-700 font-medium">Email</label>
            <div className="col-span-2 items-center">
              <input
                type="email"
                name="email"
                value={showEmail ? form.email : maskEmail(form.email)}
                readOnly
                className="bg-gray-100 border rounded px-3 py-2 w-75"
              />
              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="text-blue-600 text-sm hover:underline cursor-pointer ml-2"
              >
                {showEmail ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-gray-700 font-medium">Số điện thoại</label>
            <div className="col-span-2 items-center">
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-75"
                placeholder={form.phone === "" ? "Thêm số điện thoại" : ""}
              />
            </div>
          </div>

          {/* Birthday */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-gray-700 font-medium">Ngày sinh</label>
            {profile?.Profile?.birthday ? (
              <div className="col-span-2 flex gap-2">
                <p>
                  {form.day}/{form.month}/{form.year}
                </p>
              </div>
            ) : (
              <div className="col-span-2 flex gap-2">
                <input
                  type="number"
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  placeholder="Ngày"
                  min="1"
                  max="31"
                  className="border rounded px-2 py-2 w-full"
                />
                <input
                  type="number"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  placeholder="Tháng"
                  min="1"
                  max="12"
                  className="border rounded px-2 py-2 w-full"
                />
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="Năm"
                  className="border rounded px-2 py-2 w-full"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label></label>
            <button
              type="submit"
              className="col-span-2 bg-[#8b2e0f] text-white px-6 py-2 rounded hover:bg-[#2b2b2b]"
            >
              Lưu
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border">
            {preview ? (
              <img
                src={preview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex items-center justify-center text-gray-400 h-full">
                Chưa có ảnh
              </span>
            )}
          </div>
          <label className="bg-gray-100 border px-4 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm">
            Chọn ảnh
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
          <p>{form.bio}</p>
        </div>
      </form>
    </>
  );
}

export default ProfileForm;
