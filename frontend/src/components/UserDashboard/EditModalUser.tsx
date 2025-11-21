/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch } from "react-redux";
import { type AppDispatch } from "../../redux/store";
import { editUser, getAllUsers } from "../../redux/features/auth/authSlice";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { toast } from "react-toastify";
import { Modal } from "antd";

// ===================== TYPES =====================
interface IUserRecord {
  key: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  birthday: string;
  raw?: any;
}

// ===================== EDIT MODAL =====================
interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  user: IUserRecord | null;
}

const EditUserModal = ({ visible, onClose, user }: EditUserModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "buyer",
    status: "Active",
    phone: "",
    address: "",
    birthday: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday
          ? dayjs(user.birthday).format("YYYY-MM-DD")
          : "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEdit = async () => {
    if (!user) return;

    let birthdayValue: string | null;

    if (form.birthday === "") {
      // Nếu xoá field → gửi null
      birthdayValue = null;
    } else {
      // Nếu không hợp lệ → giữ birthday cũ
      birthdayValue = user.raw?.Profile?.birthday || null;
    }

    const payload = {
      ...form,
      birthday: birthdayValue,
    };

    try {
      await dispatch(editUser({ id: user.key, data: payload })).unwrap();
      toast.success("Cập nhật thành công!");
      await dispatch(getAllUsers());
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật user!");
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa user: ${user?.username}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <form className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="birthday"
          type="date"
          placeholder="Birthday"
          value={form.birthday}
          onChange={handleChange}
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="buyer">buyer</option>
          <option value="seller">seller</option>
          <option value="admin">admin</option>
        </select>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Banned">Banned</option>
        </select>
        <div className="md:col-span-2 mt-2 flex gap-2">
          <button type="button" onClick={handleEdit}>
            Lưu
          </button>
          <button type="button" onClick={onClose}>
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
