import { Store } from "../models/store.model.js";
import fs from "fs";
import path from "path";

// lấy tất cả cửa hàng
export const getAllStores = async () => {
  const stores = await Store.findAll();
  return stores;
};
// lấy cửa hàng theo ID
export const getStoreById = async (id) => {
  const store = await Store.findByPk(id);
  return store;
};
// tạo cửa hàng mới
export const createStore = async (storeData) => {
  // Nếu có image và file đã tồn tại thì xóa file cũ trước khi lưu (tránh rác do upload lại nhiều lần cùng tên)
  if (storeData.image) {
    const imgPath = path.join(process.cwd(), "src/public/store", storeData.image);
    if (fs.existsSync(imgPath)) {
      try { fs.unlinkSync(imgPath); } catch {}
    }
  }
  const newStore = await Store.create(storeData);
  return newStore;
};
// sửa thông tin cửa hàng
export const updateStore = async (id, storeData) => {
  const store = await Store.findByPk(id);
  if (!store) {
    throw new Error("Store not found");
  }
  // Nếu có ảnh mới và đã có ảnh cũ thì xóa ảnh cũ
  if (storeData.image && store.image && storeData.image !== store.image) {
    const oldPath = path.join(process.cwd(), "src/public/store", store.image);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (err) { console.error("Lỗi xóa ảnh cũ:", err); }
    }
  }
  await store.update(storeData);
  return store;
};
// xoá cửa hàng
export const deleteStore = async (id) => {
  const store = await Store.findByPk(id);
  if (!store) {
    throw new Error("Store not found");
  }
  // Xóa ảnh khi xóa store
  if (store.image) {
    const imgPath = path.join(process.cwd(), "src/public/store", store.image);
    if (fs.existsSync(imgPath)) {
      try { fs.unlinkSync(imgPath); } catch {}
    }
  }
  await store.destroy();
  return store;
};
// lấy cửa hàng theo seller_id
export const getStoreBySellerId = async (seller_id) => {
  const store = await Store.findOne({ where: { seller_id } });
  return store;
};
// cập nhật ảnh cửa hàng
export const updateStoreImage = async (seller_id, newFileName) => {
  const store = await Store.findOne({ where: { seller_id } });
  if (store && store.image && store.image !== newFileName) {
    const path = require("path");
    const fs = require("fs");
    const oldPath = path.join(process.cwd(), "src/public/store", store.image);
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch (err) { console.error("Lỗi xóa ảnh cũ:", err); }
    }
  }
  // Cập nhật tên file mới vào DB
  if (store) {
    await store.update({ image: newFileName });
  }
  return newFileName;
};
