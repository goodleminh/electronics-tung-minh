import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { updateProfileThunk, fetchProfile } from "../../redux/features/profile/profileSlice";
import { fetchStores, createStore, updateStore } from "../../redux/features/store/storeSlice";
import { Modal, Button, message } from "antd";
import "./style.css";

const statusMap = {
  pending: { color: "#e67e22", text: "Đang duyệt" },
  approved: { color: "#27ae60", text: "Hoạt động" },
  rejected: { color: "#c0392b", text: "Bị khóa" },
};
type StoreStatus = keyof typeof statusMap;

const SellerProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.profile.profile);
  // Lấy store thật từ Redux
  const stores = useSelector((state: RootState) => state.store.stores);
  const myStore = stores.find(s => s.seller_id === user?.user_id);

  // ✅ BƯỚC 1: Gọi API lấy dữ liệu mới nhất khi vào trang
  React.useEffect(() => {
    dispatch(fetchProfile() as any);
    if (user?.user_id) {
      dispatch(fetchStores() as any);
    }
  }, [dispatch, user?.user_id]);
  // ✅ BƯỚC 3: Log dữ liệu profile để debug
  console.log("Dữ liệu Profile từ Redux:", profile);
  // TODO: Lấy store thực tế từ redux nếu có
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: profile?.Profile?.phone || "",
    address: profile?.Profile?.address || "",
    avatar: profile?.Profile?.avatar || "",
    bio: profile?.Profile?.bio || "",
    birthday: profile?.Profile?.birthday || "",
  });
  // ✅ BƯỚC 2: Đồng bộ lại editForm khi profile hoặc user thay đổi
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        username: user?.username || profile.username || "",
        email: user?.email || profile.email || "",
        phone: profile.Profile?.phone || "",
        address: profile.Profile?.address || "",
        avatar: profile.Profile?.avatar || "",
        bio: profile.Profile?.bio || "",
        birthday: profile.Profile?.birthday || "",
      });
    }
  }, [profile, user]);
  const [saving, setSaving] = useState(false);
  // Validate state for modal fields
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validation logic giống OrderPage
  const isValidEmail = /^\S+@\S+\.\S+$/.test(editForm.email.trim());
  const isValidPhone = /^0\d{9,10}$/.test(editForm.phone.trim());
  const isValidAddress = !!editForm.address.trim();

  const showEmailError = (touched.email || saving) && (!editForm.email.trim() || !isValidEmail);
  const showPhoneError = (touched.phone || saving) && (!editForm.phone.trim() || !isValidPhone);
  const showAddressError = (touched.address || saving) && !isValidAddress;

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleEditSave = async () => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (!isValidEmail) return;
    setSaving(true);
    try {
      // Gọi updateProfileThunk với payload bao gồm address
      await dispatch(updateProfileThunk({
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
        bio: editForm.bio,
        birthday: editForm.birthday,
        address: editForm.address,
      }) as any);
      // Gọi lại fetchProfile để reload dữ liệu mới nhất
      await dispatch(fetchProfile() as any);
      setEditModal(false);
      message.success("Cập nhật thành công!");
    } catch {
      message.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Địa chỉ động như OrderPage
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  React.useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);
  React.useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
      setSelectedDistrict(''); setWards([]); setSelectedWard('');
    }
  }, [selectedProvince]);
  React.useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
      setSelectedWard('');
    }
  }, [selectedDistrict]);
  React.useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const province = provinces.find(p => p.code == selectedProvince)?.name || '';
      const district = districts.find(d => d.code == selectedDistrict)?.name || '';
      const ward = wards.find(w => w.code == selectedWard)?.name || '';
      setEditForm(prev => ({ ...prev, address: `${detailAddress}, ${ward}, ${district}, ${province}` }));
    } else {
      setEditForm(prev => ({ ...prev, address: '' }));
    }
  }, [selectedProvince, selectedDistrict, selectedWard, detailAddress]);

  // Hàm phân tích ngược địa chỉ và set lại dropdown khi mở modal
  const handleOpenEditModal = () => {
    if (editForm.address) {
      // Tách địa chỉ: "chi tiết, phường/xã, quận/huyện, tỉnh/thành"
      const parts = editForm.address.split(',').map(s => s.trim());
      if (parts.length === 4) {
        setDetailAddress(parts[0]);
        // Tìm code tỉnh
        const provinceObj = provinces.find(p => p.name === parts[3]);
        setSelectedProvince(provinceObj?.code || '');
        // Sau khi setSelectedProvince, districts sẽ được fetch lại
        setTimeout(() => {
          const districtObj = districts.find(d => d.name === parts[2]);
          setSelectedDistrict(districtObj?.code || '');
          // Sau khi setSelectedDistrict, wards sẽ được fetch lại
          setTimeout(() => {
            const wardObj = wards.find(w => w.name === parts[1]);
            setSelectedWard(wardObj?.code || '');
          }, 200);
        }, 200);
      }
    }
    setEditModal(true);
  };

  // Thêm state và logic cho modal cửa hàng
  const [storeModal, setStoreModal] = useState(false);
  const [storeForm, setStoreForm] = useState<{ name: string; description: string; image: string | File }>({
    name: "",
    description: "",
    image: "",
  });

  // Khi mở modal: nếu là cập nhật thì fill dữ liệu, nếu tạo mới thì reset trắng
  const handleOpenStoreModal = () => {
    console.log('myStore', myStore); // Log dữ liệu store lấy từ Redux
    if (myStore) {
      setStoreForm({
        name: myStore.name || "",
        description: myStore.description || "",
        image: myStore.image || "",
      });
    } else {
      setStoreForm({ name: "", description: "", image: "" });
    }
    setStoreModal(true);
  };

  // Helper hiển thị ảnh linh hoạt
  const getImageUrl = (imgName: string | File | undefined | null, type: 'avatar' | 'store') => {
    if (!imgName) return "https://i.imgur.com/your-logo.png";
    if (imgName instanceof File) return URL.createObjectURL(imgName);
    if (typeof imgName === "string" && imgName.startsWith("http")) return imgName;
    return `${import.meta.env.VITE_API_URL}/public/${type}/${imgName}`;
  };

  // --- HANDLE SUBMIT STORE ---
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageFileName = "";
      if (typeof storeForm.image === "string") {
        imageFileName = storeForm.image;
      }
      if (storeForm.image instanceof File) {
        const formData = new FormData();
        formData.append("image", storeForm.image);
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stores/image`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (data && data.image) {
          imageFileName = data.image;
        } else {
          message.error("Lỗi upload ảnh cửa hàng!");
          return;
        }
      }
      const payload = {
        name: storeForm.name,
        description: storeForm.description,
        image: imageFileName,
      };
      console.log('STORE SUBMIT PAYLOAD', payload, myStore ? 'UPDATE' : 'CREATE');
      if (!myStore) {
        if (user?.user_id) {
          await dispatch(createStore({ seller_id: user.user_id, ...payload }) as any);
          message.success("Tạo cửa hàng thành công!");
        }
      } else {
        await dispatch(updateStore({ id: myStore.store_id, data: payload }) as any);
        message.success("Cập nhật cửa hàng thành công!");
      }
      setStoreModal(false);
      dispatch(fetchStores() as any);
    } catch (error) {
      console.error('STORE SUBMIT ERROR', error);
      message.error("Có lỗi xảy ra khi lưu cửa hàng!");
    }
  };

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-[30px] inline-block border-b-2 border-[brown] cursor-pointer mb-8">
          Thông tin cửa hàng
        </h2>
        <div className="flex flex-col md:flex-row bg-white border border-[#8b2e0f]">
          {/* Sidebar trái */}
          <aside className="md:w-1/3 w-full border-r border-[#8b2e0f] p-8 flex flex-col items-center md:items-start bg-[#faf7f5]">
            <div className="w-40 h-40 border border-[#8b2e0f] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-6">
              {/* ✅ Sửa logic avatar */}
              {(() => {
                const API_URL = import.meta.env.VITE_API_URL; 
                let avatarSrc = profile?.Profile?.avatar || "";
                if (avatarSrc && !avatarSrc.startsWith("http")) {
                  avatarSrc = `${API_URL}/public/avatar/${avatarSrc}`;
                }
                return (
                  <img
                    src={avatarSrc || "o.png"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.src = "o.png";
                    }}
                  />
                );
              })()}
            </div>
            <div className="w-full">
              <div className="font-bold text-xl text-[#8b2e0f] mb-2 text-center md:text-left">
                {user?.username || <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Ngày sinh:</span>{" "}
                {profile?.Profile?.birthday ? profile.Profile.birthday : <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {user?.email || <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {profile?.Profile?.phone ? profile.Profile.phone : <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {profile?.Profile?.address ? profile.Profile.address : <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Bio:</span>{" "}
                {profile?.Profile?.bio ? <span className="italic text-gray-600">{profile.Profile.bio}</span> : <span className="text-red-600">bạn chưa thêm thông tin</span>}
              </div>
            </div>
            <button
              className="mt-8 bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition w-full rounded-none"
              onClick={handleOpenEditModal}
            >
              Chỉnh sửa
            </button>
            <Modal
              open={editModal}
              onCancel={() => setEditModal(false)}
              footer={null}
              title={<span className="text-xl font-bold">Cập nhật thông tin cá nhân</span>}
              width={480}
              styles={{ content: { borderRadius: 0 }, body: { padding: 24 } }}
            >
              {/* Avatar preview và upload */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border border-[#8b2e0f] bg-gray-100 flex items-center justify-center mb-2">
                  <img
                    src={(() => {
                      const API_URL = import.meta.env.VITE_API_URL;
                      let avatarSrc = editForm.avatar || profile?.Profile?.avatar || "";
                      if (avatarSrc && !avatarSrc.startsWith("http")) {
                        avatarSrc = `${API_URL}/public/avatar/${avatarSrc}`;
                      }
                      return avatarSrc || "o.png";
                    })()}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.src = "o.png";
                    }}
                  />
                </div>
                <label className="bg-gray-100 border px-4 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm">
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append("avatar", file);
                        try {
                          // Gọi API upload avatar
                          const API_URL = import.meta.env.VITE_API_URL;
                          const res = await fetch(`${API_URL}/profile/avatar`, {
                            method: "POST",
                            body: formData,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                          });
                          const data = await res.json();
                          if (data?.avatar) {
                            setEditForm(prev => ({ ...prev, avatar: data.avatar }));
                            message.success("Tải ảnh lên thành công!");
                          } else {
                            message.error("Tải ảnh thất bại!");
                          }
                        } catch {
                          message.error("Tải ảnh thất bại!");
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleEditSave();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="font-semibold">Tên:</label>
                  <input
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold">Email:</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none"
                    required
                  />
                  {showEmailError && (
                    <div className="text-red-600 text-sm mt-1">
                      { !editForm.email.trim() ? 'Email không được để trống' : 'Email không hợp lệ' }
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold">Ngày sinh:</label>
                  <input
                    name="birthday"
                    type="date"
                    value={editForm.birthday || ""}
                    onChange={handleEditChange}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none"
                  />
                </div>
                <div>
                  <label className="font-semibold">Số điện thoại:</label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none"
                    required
                  />
                  {showPhoneError && (
                    <div className="text-red-600 text-sm mt-1">
                      { !editForm.phone.trim() ? 'Số điện thoại không được để trống' : 'Số điện thoại phải bắt đầu bằng 0, gồm 10-11 chữ số' }
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold">Địa chỉ:</label>
                  <div className="flex flex-col gap-3 mb-2">
                    <select
                      className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                      value={selectedProvince}
                      onChange={e => { setSelectedProvince(e.target.value); setTouched(prev => ({ ...prev, address: true })); }}
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p: any) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                      value={selectedDistrict}
                      onChange={e => { setSelectedDistrict(e.target.value); setTouched(prev => ({ ...prev, address: true })); }}
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((d: any) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                    <select
                      className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                      value={selectedWard}
                      onChange={e => { setSelectedWard(e.target.value); setTouched(prev => ({ ...prev, address: true })); }}
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((w: any) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={detailAddress}
                      onChange={e => { setDetailAddress(e.target.value); setTouched(prev => ({ ...prev, address: true })); }}
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                      placeholder="Số nhà, tên đường..."
                      className="w-full border border-[#8b2e0f] p-2 rounded-none text-base focus:outline-none"
                      required
                    />
                  </div>
                  {showAddressError && (
                    <div className="text-red-600 text-sm mt-1">Vui lòng nhập đầy đủ địa chỉ (Số nhà, phường/xã, quận/huyện, tỉnh/thành)</div>
                  )}
                </div>
                <div>
                  <label className="font-semibold">Bio:</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditChange}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none"
                  />
                </div>
                <div className="flex gap-4 justify-end pt-2">
                  <Button
                    onClick={() => setEditModal(false)}
                    className="rounded-none"
                    style={{ backgroundColor: '#ffffffff', borderRadius: 0 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    htmlType="submit"
                    loading={saving}
                    className="rounded-none"
                    style={{ backgroundColor: '#8b2e0f', borderRadius: 0 }}
                  >
                    Cập Nhật
                  </Button>
                </div>
              </form>
            </Modal>
          </aside>

          {/* Phần phải: Thông tin cửa hàng */}
          <section className="md:w-2/3 w-full p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 border-2 border-[#8b2e0f] bg-gray-100 flex items-center justify-center overflow-hidden rounded-full">
                <img
                  src={(() => {
                    if (typeof storeForm.image === "string" && storeForm.image) {
                      return `${import.meta.env.VITE_API_URL}/public/store/${storeForm.image}`;
                    } else if (storeForm.image instanceof File) {
                      return URL.createObjectURL(storeForm.image);
                    } else {
                      return "https://i.imgur.com/your-logo.png";
                    }
                  })()}
                  alt="logo"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = "https://i.imgur.com/your-logo.png";
                  }}
                />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#8b2e0f] mb-1 uppercase tracking-wide">
                  {storeForm.name || <span className="italic text-gray-400">Tên cửa hàng</span>}
                </div>
                {myStore && (
                  <span
                    className="px-4 py-1 font-semibold text-white"
                    style={{
                      background: statusMap[myStore.status as StoreStatus]?.color || "#888",
                    }}
                  >
                    {statusMap[myStore.status as StoreStatus]?.text || myStore.status}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Mô tả cửa hàng:</span>
              <div className="mt-1 text-gray-800">
                {storeForm.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
              </div>
            </div>
            <button
              className="bg-[#8b2e0f] text-white px-6 py-2 border border-[#8b2e0f] hover:bg-[#a9441a] transition mt-4"
              onClick={handleOpenStoreModal}
            >
              {myStore ? "Cập nhật cửa hàng" : "Tạo mới cửa hàng"}
            </button>
            <Modal
              open={storeModal}
              onCancel={() => setStoreModal(false)}
              footer={null}
              title={<span className="text-xl font-bold">{myStore ? "Cập nhật cửa hàng" : "Tạo cửa hàng"}</span>}
              width={480}
            >
              <form onSubmit={handleStoreSubmit} className="space-y-4 mt-4">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border border-[#8b2e0f] bg-gray-100 flex items-center justify-center mb-2">
                    <img
                      src={getImageUrl(storeForm.image, 'store')}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="bg-gray-100 border px-4 py-1 rounded cursor-pointer hover:bg-gray-200 text-sm">
                    Chọn ảnh logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setStoreForm((prev) => ({ ...prev, image: file }));
                      }}
                    />
                  </label>
                </div>
                {/* Name Input */}
                <div>
                  <label className="font-semibold">Tên cửa hàng:</label>
                  <input
                    name="name"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none mt-1"
                    required
                  />
                </div>
                {/* Description Input */}
                <div>
                  <label className="font-semibold">Mô tả:</label>
                  <textarea
                    name="description"
                    value={storeForm.description}
                    onChange={(e) => setStoreForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="border border-[#8b2e0f] p-2 w-full rounded-none mt-1 h-24"
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t mt-4">
                  <Button onClick={() => setStoreModal(false)}>Hủy</Button>
                  <Button
                    htmlType="submit"
                    className="bg-[#8b2e0f] text-white hover:!bg-[#a9441a] hover:!text-white border-none rounded-none"
                  >
                    {myStore ? "Lưu thay đổi" : "Tạo mới"}
                  </Button>
                </div>
              </form>
            </Modal>
          </section>
        </div>
      </section>
    </main>
  );
};

export default SellerProfilePage;
