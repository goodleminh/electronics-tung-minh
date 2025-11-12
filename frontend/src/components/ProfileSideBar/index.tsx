import { useEffect, useState } from "react";
import { UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    icon: <UserOutlined />,
    label: "Tài Khoản Của Tôi",
    children: ["Hồ Sơ", "Địa Chỉ", "Đổi Mật Khẩu", "Thông Tin Cá Nhân"],
  },
  { icon: <ShoppingOutlined />, label: "Đơn Mua" },
];

const ProfileSidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeItem, setActiveItem] = useState("Hồ Sơ");
  const navigate = useNavigate();
  useEffect(() => {
    if (activeItem === "Đổi Mật Khẩu") {
      navigate("/change-password");
    }
  }, [activeItem, navigate]);
  return (
    <div className="w-64 pt-8 pr-8 pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <UserOutlined className="text-2xl" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{user?.username}</p>
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#8b2e0f]">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="edit"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9z" />
            </svg>
            Sửa Hồ Sơ
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 border-t pt-6">
        {menuItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center space-x-2 px-2 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded cursor-pointer">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <div
                    key={child}
                    onClick={() => setActiveItem(child)}
                    className={`text-sm px-2 py-1 rounded cursor-pointer ${
                      activeItem === child
                        ? "text-[#8b2e0f] font-semibold"
                        : "text-gray-600 hover:text-[#8b2e0f]"
                    }`}
                  >
                    {child}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;
