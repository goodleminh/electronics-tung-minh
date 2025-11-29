import { Store } from "../models/store.model.js";
import fs from "fs";
import path from "path";
import User from "../models/auth.model.js";
import { sendMail } from "../config/mailer.js";

// lấy tất cả cửa hàng
export const getAllStores = async () => {
  const stores = await Store.findAll({
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  });
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
    const imgPath = path.join(
      process.cwd(),
      "src/public/store",
      storeData.image
    );
    if (fs.existsSync(imgPath)) {
      try {
        fs.unlinkSync(imgPath);
      } catch {}
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
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Lỗi xóa ảnh cũ:", err);
      }
    }
  }
  await store.update(storeData);
  return store;
};

//cập nhật status: chấp thuận | từ chối và gửi mail cho user
export const sendMailToSeller = async (id, status) => {
  const store = await Store.findByPk(id, {
    include: [{ model: User, attributes: ["email"] }],
  });
  if (!store) throw new Error("Không tìm thấy cửa hàng");
  await store.update({ status });
  //  Nếu bị từ chối
  if (status === "rejected") {
    await sendMail(
      store.User.email,
      "Cửa hàng của bạn đã bị từ chối",
      `
      <p>Xin chào,</p>
      <p>Rất tiếc, cửa hàng <b>${store.name}</b> đã bị từ chối do chưa đáp ứng yêu cầu.</p>
      <p>Vui lòng cập nhật thêm thông tin và gửi lại yêu cầu.</p>
      `
    );
  }

  //  Nếu được duyệt
  if (status === "approved") {
    await sendMail(
      store.User.email,
      "🎉 Cửa hàng đã được phê duyệt!",
      `
      <p>Chúc mừng!</p>
      <p>Cửa hàng <b>${store.name}</b> đã được admin phê duyệt và có thể hoạt động.</p>
      `
    );
  }
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
      try {
        fs.unlinkSync(imgPath);
      } catch {}
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
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Lỗi xóa ảnh cũ:", err);
      }
    }
  }
  // Cập nhật tên file mới vào DB
  if (store) {
    await store.update({ image: newFileName });
  }
  return newFileName;
};
