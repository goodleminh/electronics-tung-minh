// ----------------------------------------------------------------------

import { useState } from "react";
import DashBoardIcon from "../../assets/icons/ic-analytics.svg";
import UserIcon from "../../assets/icons/ic-user.svg";
import ProductIcon from "../../assets/icons/ic-cart.svg";
import BlogIcon from "../../assets/icons/ic-blog.svg";
import SignInIcon from "../../assets/icons/ic-lock.svg";
import NotFoundIcon from "../../assets/icons/ic-disabled.svg";
import CreateUserModal from "../UserDashboard/CreateModalUser";
import { useNavigate } from "react-router-dom";

type NavItem = {
  id: string;
  path: string;
  label: string;
  icon: string;
  info?: React.ReactNode;
};

export default function DashboardSideBar() {
  const [active, setActive] = useState<string>("dashboard");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const navigate = useNavigate();
  const navData: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dash-board",
      icon: DashBoardIcon,
    },
    {
      id: "user",
      label: "User",
      path: "/dash-board",
      icon: UserIcon,
    },
    {
      id: "product",
      label: "Product",
      path: "/dash-board/products",
      icon: ProductIcon,
      // info: (

      // ),
    },
    {
      id: "blog",
      label: "Blog",
      path: "/blog",
      icon: BlogIcon,
    },
    {
      id: "sign-in",
      label: "Sign in",
      path: "/sign-in",
      icon: SignInIcon,
    },
    {
      id: "not-found",
      label: "Not found",
      path: "/404",
      icon: NotFoundIcon,
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-72 hidden md:block bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Electon</h1>
          <nav className="space-y-1">
            {navData.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setActive(n.label);
                  navigate(n.path);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition ${
                  active === n.label ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  <img src={n.icon} alt={n.label} />
                </span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <h2 className="text-xs uppercase text-gray-500 mb-2">
              Quick actions
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setCreateModalVisible(true)}
                className="w-full p-2 rounded-lg border border-dashed text-sm cursor-pointer"
              >
                New user
              </button>
              <button className="w-full p-2 rounded-lg border border-dashed text-sm cursor-pointer">
                New product
              </button>
              <CreateUserModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
