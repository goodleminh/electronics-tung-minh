import { Store } from "../models/store.model.js";

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
  const newStore = await Store.create(storeData);
  return newStore;
};
// sửa thông tin cửa hàng
export const updateStore = async (id, storeData) => {
  const store = await Store.findByPk(id);
  if (!store) {
    throw new Error("Store not found");
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
  await store.destroy();
  return store;
};
