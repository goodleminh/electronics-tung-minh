import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  actFetchCartItems,
  type ICartItem,
  actUpdateCartItem,
  actRemoveFromCart,
} from "../../redux/features/cart/cartSlice";
import {
  actFetchProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import { fetchStores } from "../../redux/features/store/storeSlice"; // NEW
import type { AppDispatch, RootState } from "../../redux/store";
import "./style.css";
import { Modal } from "antd";
import { getActivePricing, getFormattedPricing } from "../../utils/price/priceUtil";
import { useNavigate } from "react-router-dom";

const Cartpage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.cart);
  const { products } = useSelector((s: RootState) => s.product);
  const storeList = useSelector((s: RootState) => s.store.stores); // NEW
  const authUser = useSelector((s: RootState) => s.auth.user); // NEW

  // Build image URL similar to other pages
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));

  useEffect(() => {
    if (!items.length) dispatch(actFetchCartItems());
    if (!products.length) dispatch(actFetchProducts());
    if (!storeList.length) dispatch(fetchStores());
  }, [dispatch, items.length, products.length, storeList.length]);

  // NEW: refetch cart when user changes (login/logout/switch)
  useEffect(() => {
    dispatch(actFetchCartItems());
    setSelectedIds([]); // reset selection on account switch
  }, [dispatch, authUser?.user_id]);

  // hợp nhất dữ liệu cart items với product details
  const rows = useMemo(() => {
    return items
      .map((it: ICartItem) => {
        const p = products.find(
          (x: IProduct) => x.product_id === it.product_id
        );
        if (!p) return null;
        const active = getActivePricing(p as any);
        return {
          key: `${it.cart_item_id}`,
          item: it,
          product: p,
          subTotal: Number(active.finalPrice) * it.quantity,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      item: ICartItem;
      product: IProduct;
      subTotal: number;
    }>;
  }, [items, products]);

  // NEW: selection state and derived totals (only for selected items)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const allIds = useMemo(() => rows.map((r) => r.item.cart_item_id), [rows]);
  const allSelected =
    selectedIds.length > 0 && selectedIds.length === allIds.length;
  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };
  const selectedRows = useMemo(
    () => rows.filter((r) => selectedIds.includes(r.item.cart_item_id)),
    [rows, selectedIds]
  );
  const selectedQuantity = useMemo(
    () => selectedRows.reduce((acc, r) => acc + r.item.quantity, 0),
    [selectedRows]
  );
  const selectedAmount = useMemo(
    () => selectedRows.reduce((acc, r) => acc + r.subTotal, 0),
    [selectedRows]
  );

  // QUICK DELETE: delete selected items without confirmation
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          dispatch(actRemoveFromCart({ id })).unwrap()
        )
      );
      setSelectedIds([]);
    } catch (e) {
      // Silent fail to avoid confirmation/error modals as requested
      // console.error(e);
    }
  };

  // Group rows by seller/shop using real storeList
  const groups = useMemo(() => {
    type G = { id: number; name: string; avatar?: string | null; items: typeof rows };
    const map = new Map<number, G>();
    rows.forEach((r) => {
      const sidRaw = (r.product as any).store_id;
      const sid = Number(sidRaw);
      if (!sid) return;
      const storeObj = storeList.find((st) => Number(st.store_id) === sid);
      const fallbackName = (r.product as any).store_name || (r.product as any).store?.name;
      const name = storeObj?.name || fallbackName || "Cửa hàng";
      const avatar = null;
      if (!map.has(sid)) map.set(sid, { id: sid, name, avatar, items: [] as any });
      map.get(sid)!.items.push(r);
    });
    return Array.from(map.values());
  }, [rows, storeList]);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ICartItem | null>(null);
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [editQty, setEditQty] = useState<number>(1);

  const openEdit = (item: ICartItem, product: IProduct) => {
    setEditItem(item);
    setEditProduct(product);
    setEditQty(item.quantity);
    setEditOpen(true);
  };
  const decEdit = () => setEditQty((q) => (q > 1 ? q - 1 : 1));
  const incEdit = () => setEditQty((q) => q + 1);
  const confirmEdit = async () => {
    if (!editItem) return;
    try {
      await dispatch(
        actUpdateCartItem({ id: editItem.cart_item_id, quantity: editQty })
      ).unwrap();
      setEditOpen(false);
    } catch (e: any) {
      Modal.error({
        title: "Cập nhật thất bại",
        content: e?.message || "Thử lại sau",
      });
    }
  };

  // Proceed to checkout: pass selected items to Order page via route state
  const proceedCheckout = () => {
    if (selectedIds.length === 0) return;
    const payloadItems = selectedRows.map((r) => {
      const active = getActivePricing(r.product as any);
      return {
        product_id: r.product.product_id,
        quantity: r.item.quantity,
        price: Number(active.finalPrice),
      };
    });
    navigate('/orders', {
      state: {
        checkout: {
          items: payloadItems,
          total: payloadItems.reduce((s, it) => s + it.price * it.quantity, 0),
        },
      },
    });
  };

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {loading && <div className="py-8">Đang tải giỏ hàng...</div>}
        {error && (
          <div className="text-red-600 border border-red-300 p-3 mb-4">
            {error}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="py-12 text-center text-gray-600">
            Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm để tiếp tục.
          </div>
        )}

        {rows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Middle: Grouped list by shop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Global Select all */}
              <div className="mb-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#8b2e0f] rounded-full"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Chọn tất cả sản phẩm"
                />
                <span className="text-sm">Chọn tất cả</span>
                <span className="ml-auto text-sm text-gray-500">
                  {selectedIds.length}/{rows.length} đã chọn
                </span>
                {/* Delete selected without confirmation */}
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={selectedIds.length === 0}
                  className="ml-4 px-4 py-2 bg-[#8b2e0f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6e260c] transition"
                  title={selectedIds.length === 0 ? "Chọn sản phẩm để xoá" : "Xoá ngay các sản phẩm đã chọn"}
                >
                  Xóa Khỏi Giỏ Hàng
                </button>
              </div>

              {groups.map((g) => {
                const avatarUrl = buildImageUrl(g.avatar);
                return (
                  <section
                    key={String(g.id)}
                    className="border border-gray-200 bg-white"
                  >
                    {/* Shop header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={g.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">
                            {g.name?.charAt(0)?.toUpperCase() || "S"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium line-clamp-1 flex-1">
                        {g.name}
                      </h3>
                      <span className="text-xs bg-[#8b2e0f] text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                        {g.items.length} sản phẩm
                      </span>
                    </div>

                    {/* Items of this shop */}
                    <div className="divide-y divide-gray-200">
                      {g.items.map(({ key, item, product, subTotal }) => {
                        const imgUrl = buildImageUrl((product as any).image);
                        const pricing = getFormattedPricing(product as any);
                        // NEW: resolve store name per item
                        const sid = Number((product as any).store_id);
                        const storeObj = storeList.find((st) => Number(st.store_id) === sid);
                        const storeName = storeObj?.name || "Cửa hàng";
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-4 bg-white p-4"
                            onClick={() => openEdit(item, product)}
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-[#8b2e0f] rounded-full"
                              checked={selectedIds.includes(item.cart_item_id)}
                              onChange={() => toggleOne(item.cart_item_id)}
                              aria-label="Chọn sản phẩm"
                              onClick={(e) => e.stopPropagation()}
                            />

                            <div className="w-20 h-20 flex items-center justify-center bg-white overflow-hidden">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="max-w-full max-h-full object-contain"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="text-2xl text-gray-400">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 line-clamp-2">
                                {product.name}
                              </div>
                              {/* NEW: show store name resolved by store_id */}
                              <div className="text-xs text-gray-500 mt-0.5">
                                Cửa hàng: <span className="font-medium text-gray-700">{storeName}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[#8b2e0f] font-semibold">
                                  {pricing.final}
                                </span>
                                {pricing.original && (
                                  <span className="text-gray-400 line-through text-sm">
                                    {pricing.original}
                                  </span>
                                )}
                                {pricing.isDiscount && pricing.percent !== undefined && (
                                  <span className="bg-[#8b2e0f] text-white text-[10px] font-semibold px-2 py-0.5">
                                    -{pricing.percent}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-24 text-center">
                              <div className="text-sm text-gray-500">Số lượng</div>
                              <div className="mt-1 font-medium">{item.quantity}</div>
                            </div>
                            <div className="w-28 text-right">
                              <div className="text-sm text-gray-500">Tạm tính</div>
                              <div className="mt-1 font-semibold">
                                {formatPrice(subTotal)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Right: Summary */}
            <aside className="lg:sticky lg:top-4 border border-gray-200 p-4 h-max bg-white">
              <h2 className="text-lg font-semibold mb-3">Tổng đơn hàng</h2>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Tổng số lượng</span>
                <span className="font-medium">{selectedQuantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span>Tạm tính</span>
                <span className="font-medium">
                  {formatPrice(selectedAmount)}
                </span>
              </div>
              <button
                type="button"
                className="w-full bg-[#8b2e0f] text-white py-3 hover:bg-[#6e260c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={selectedIds.length === 0}
                title={
                  selectedIds.length === 0
                    ? "Chọn sản phẩm để thanh toán"
                    : "Tiến hành thanh toán"
                }
                onClick={proceedCheckout}
              >
                Tiến hành thanh toán
              </button>
            </aside>
          </div>
        )}
      </div>

      {/* Edit Quantity Modal */}
      <Modal
        title={null}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={confirmEdit}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        styles={{ content: { borderRadius: 0, padding: 16 } }}
        className="rounded-none"
        okButtonProps={{ style: { backgroundColor: '#8b2e0f', borderColor: '#8b2e0f', borderRadius: 0 } }}
        cancelButtonProps={{ style: { borderRadius: 0 } }}
      >
        {editItem && editProduct && (
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 flex items-center justify-center bg-white border border-gray-200">
              {buildImageUrl((editProduct as any).image) ? (
                <img
                  src={buildImageUrl((editProduct as any).image) as string}
                  alt={editProduct.name}
                  className="max-w-[85%] max-h-[85%] object-contain"
                />
              ) : (
                <div className="text-3xl text-gray-400">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                {editProduct.name}
              </div>
              {(() => {
                const pr = getFormattedPricing(editProduct as any);
                return (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[#8b2e0f] font-semibold">{pr.final}</span>
                    {pr.original && (
                      <span className="text-gray-400 line-through text-sm">{pr.original}</span>
                    )}
                    {pr.isDiscount && pr.percent !== undefined && (
                      <span className="bg-[#8b2e0f] text-white text-[10px] font-semibold px-2 py-0.5">-{pr.percent}%</span>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center gap-3">
                <span className="text-sm">Số lượng</span>
                <div className="flex items-center border border-gray-300">
                  <button
                    className="px-3 py-1 hover:bg-gray-50"
                    onClick={decEdit}
                    aria-label="Giảm"
                  >
                    -
                  </button>
                  <span className="px-4 min-w-[2rem] text-center">{editQty}</span>
                  <button
                    className="px-3 py-1 hover:bg-gray-50"
                    onClick={incEdit}
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default Cartpage;
