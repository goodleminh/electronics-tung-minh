import * as storeService from "../services/store.service.js";

// Lấy tất cả cửa hàng
export const getStores = async (req, res) => {
  try {
    const stores = await storeService.getAllStores();
    return res.status(200).json({ stores });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Lấy cửa hàng theo ID
export const getStore = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    const store = await storeService.getStoreById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json({ store });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Tạo cửa hàng mới
export const createStoreController = async (req, res) => {
  try {
    // Log dữ liệu nhận được từ frontend
    console.log('POST /stores BODY:', req.body);
    const { seller_id, name, description, image } = req.body;
    if (!seller_id || !name) {
      console.log('POST /stores ERROR: thiếu seller_id hoặc name');
      return res.status(400).json({ message: "seller_id và name là bắt buộc" });
    }
    const newStore = await storeService.createStore({ seller_id, name, description, image });
    // Log store vừa tạo
    console.log('POST /stores CREATED:', newStore?.toJSON ? newStore.toJSON() : newStore);
    return res.status(201).json({ store: newStore });
  } catch (error) {
    console.error('POST /stores ERROR:', error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Cập nhật cửa hàng
export const updateStoreController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    const updatedStore = await storeService.updateStore(id, req.body);
    return res.status(200).json({ store: updatedStore });
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Xoá cửa hàng
export const deleteStoreController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid store id" });
    }
    await storeService.deleteStore(id);
    // 204 No Content là chuẩn khi xoá thành công
    return res.status(204).send();
  } catch (error) {
    if (error.message === "Store not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Upload ảnh store (placeholder tránh crash)
export const uploadStoreImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // Trả về tên file để frontend lưu vào DB
  return res.status(200).json({ image: req.file.filename });
};