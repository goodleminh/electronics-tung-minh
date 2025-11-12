import { ToastContainer } from "react-toastify";
import ProfileForm from "../../components/ProfileForm";
import ProfileSidebar from "../../components/ProfileSideBar";

const ProfilePage = () => {
  return (
    <div className="bg-gray-50 flex justify-end py-10 px-4 gap-5">
      <ProfileSidebar />
      <div className="w-6xl max-w-7xl  bg-white rounded-sm shadow p-8">
        <h2 className="text-xl font-medium mb-1">Hồ Sơ Của Tôi</h2>
        <p className="text-gray-500 mb-6 text-md">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
        <ProfileForm />
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default ProfilePage;
