import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  actFetchCartItems,
  type ICartItem,
} from "../../redux/features/cart/cartSlice";
import {
  actFetchProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import "./style.css";

const Cartpage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.cart);
  const { products } = useSelector((s: RootState) => s.product);

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
  }, [dispatch, items.length, products.length]);

  // Join cart items with product info
  const rows = useMemo(() => {
    return items
      .map((it: ICartItem) => {
        const p = products.find(
          (x: IProduct) => x.product_id === it.product_id
        );
        return p
          ? {
              key: `${it.cart_item_id}`,
              item: it,
              product: p,
              subTotal: Number(p.price) * it.quantity,
            }
          : null;
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

  // NEW: seller list for left panel (best-effort extraction from product fields)
  const sellers = useMemo(() => {
    const map = new Map<
      string | number,
      { id: string | number; name: string; avatar?: string | null }
    >();
    rows.forEach(({ product }) => {
      const anyProd: any = product as any;
      const id =
        anyProd.store_id ??
        anyProd.seller_id ??
        anyProd.sellerId ??
        anyProd.store?.id ??
        anyProd.seller?.id ??
        `p-${product.product_id}`;
      const name =
        anyProd.store_name ??
        anyProd.seller_name ??
        anyProd.seller?.name ??
        "Cửa hàng";
      const avatar =
        anyProd.store_avatar ??
        anyProd.seller_avatar ??
        anyProd.seller?.avatar ??
        null;
      if (!map.has(id)) map.set(id, { id, name, avatar });
    });
    return Array.from(map.values());
  }, [rows]);

  // Group rows by seller/shop
  const groups = useMemo(() => {
    type G = {
      id: string | number;
      name: string;
      avatar?: string | null;
      items: typeof rows;
    };
    const map = new Map<string | number, G>();
    rows.forEach((r) => {
      const anyProd: any = r.product as any;
      const id =
        anyProd.store_id ??
        anyProd.seller_id ??
        anyProd.sellerId ??
        anyProd.store?.id ??
        anyProd.seller?.id ??
        `p-${r.product.product_id}`;
      const name =
        anyProd.store_name ??
        anyProd.seller_name ??
        anyProd.seller?.name ??
        "Cửa hàng";
      const avatar =
        anyProd.store_avatar ??
        anyProd.seller_avatar ??
        anyProd.seller?.avatar ??
        null;
      if (!map.has(id)) {
        map.set(id, { id, name, avatar, items: [] as any });
      }
      map.get(id)!.items.push(r);
    });
    return Array.from(map.values());
  }, [rows]);

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
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-4 bg-white p-4"
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-[#8b2e0f] rounded-full"
                              checked={selectedIds.includes(item.cart_item_id)}
                              onChange={() => toggleOne(item.cart_item_id)}
                              aria-label="Chọn sản phẩm"
                            />

                            <div className="w-20 h-20 flex items-center justify-center bg-white overflow-hidden">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="text-2xl text-gray-400">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 line-clamp-2">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Mã SP: {product.product_id}
                              </div>
                              <div className="mt-1 text-[#8b2e0f] font-semibold">
                                {formatPrice(Number((product as any).price))}
                              </div>
                            </div>
                            <div className="w-24 text-center">
                              <div className="text-sm text-gray-500">
                                Số lượng
                              </div>
                              <div className="mt-1 font-medium">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="w-28 text-right">
                              <div className="text-sm text-gray-500">
                                Tạm tính
                              </div>
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
              >
                Tiến hành thanh toán
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cartpage;
