import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchOrderById, fetchMyOrders, updateOrder, createOrder } from '../../redux/features/order/orderSlice';
import { fetchOrderItemsByOrderId, createOrderItem } from '../../redux/features/order_item/order_itemSlice';
import { Button, Tag, Spin, Alert, message } from 'antd';
import { actFetchProducts } from '../../redux/features/product/productSlice';

const statusColor: Record<string, string> = {
  pending: 'gold',
  processing: 'blue',
  shipping: 'geekblue',
  completed: 'green',
  cancelled: 'red',
};

const formatCurrency = (n?: number) => {
  if (typeof n !== 'number') return '0₫';
  return n.toLocaleString('vi-VN') + '₫';
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN');
  } catch {
    return iso;
  }
};

const OrderPage: React.FC = () => {
  const { id: paramId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector((s: RootState) => s.auth);
  const orderState = useSelector((s: RootState) => s.order);
  const orderItemsState = useSelector((s: RootState) => s.orderItems);
  const productState = useSelector((s: RootState) => s.product);

  // Build image URL like other pages
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    const normalized = img.includes('/') ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };

  const checkout = (location.state as any)?.checkout as
    | { items: Array<{ product_id: number; quantity: number; price: number }>; total: number }
    | undefined;

  // Local editable checkout items (allow quantity changes)
  const [checkoutItems, setCheckoutItems] = useState<Array<{ product_id: number; quantity: number; price: number }>>(
    checkout?.items || []
  );

  useEffect(() => {
    if (checkout?.items) setCheckoutItems(checkout.items);
  }, [checkout?.items]);

  const incQty = (pid: number) => {
    setCheckoutItems((prev) => prev.map((it) => (it.product_id === pid ? { ...it, quantity: it.quantity + 1 } : it)));
  };
  const decQty = (pid: number) => {
    setCheckoutItems((prev) => prev.map((it) => (it.product_id === pid ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it)));
  };

  // Prefill address from user profile if available
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => {
    if (checkout) {
      if (!address) {
        const defaultAddr = (auth.user as any)?.address || '';
        if (defaultAddr) setAddress(defaultAddr);
      }
      if (!phone) {
        const defaultPhone = (auth.user as any)?.phone || '';
        if (defaultPhone) setPhone(defaultPhone);
      }
    }
  }, [checkout, auth.user, address, phone]);

  // Ensure products are loaded for names/images
  useEffect(() => {
    if (!productState.products?.length) {
      dispatch(actFetchProducts());
    }
  }, [dispatch, productState.products?.length]);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [payment, setPayment] = useState<'cash' | 'zalopay'>('cash');
  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Decide current order id
  const orderId = useMemo(() => {
    if (paramId) return paramId;
    // fallback: use first order in list
    if (orderState.list.length) return String(orderState.list[0].order_id);
    return undefined;
  }, [paramId, orderState.list]);

  useEffect(() => {
    if (!auth.accessToken || !auth.user) return;

    // If coming from Cart with checkout payload, skip fetching existing orders
    if (checkout) {
      setInitialLoaded(true);
      return;
    }

    const load = async () => {
      try {
        if (paramId) {
          await dispatch(fetchOrderById(paramId));
          await dispatch(fetchOrderItemsByOrderId(paramId));
        } else {
          const res = await dispatch(fetchMyOrders());
          const list = (res as any).payload as any[] | undefined;
          if (list && list.length) {
            const firstId = list[0].order_id;
            await dispatch(fetchOrderById(firstId));
            await dispatch(fetchOrderItemsByOrderId(firstId));
          }
        }
      } finally {
        setInitialLoaded(true);
      }
    };
    load();
  }, [dispatch, auth.accessToken, auth.user, paramId, checkout]);

  const currentOrder = orderState.current;
  const items = orderId ? orderItemsState.byOrder[String(orderId)] || [] : [];
  const computedTotal = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  const productsMap = useMemo(() => {
    const map: Record<number, any> = {};
    productState.products?.forEach((p: any) => {
      if (p?.product_id != null) map[p.product_id] = p;
    });
    return map;
  }, [productState.products]);

  // Dynamic total for checkout flow
  const checkoutTotal = useMemo(() => {
    if (!checkoutItems?.length) return 0;
    return checkoutItems.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
  }, [checkoutItems]);
  // Normalize status for reliable checks
  const normalizedStatus = (currentOrder?.status || '').toString().toLowerCase();
  const canCancel = !!currentOrder && ['pending', 'processing'].includes(normalizedStatus);
  const canConfirm = !!currentOrder && normalizedStatus === 'shipping';

  const handleCancel = async () => {
    if (!currentOrder) return;
    try {
      await dispatch(updateOrder({ id: currentOrder.order_id, data: { status: 'cancelled' } }));
      message.success('Đã huỷ đơn hàng');
    } catch (e) {
      message.error('Không thể huỷ đơn');
    }
  };

  const handleConfirm = async () => {
    if (!currentOrder) return;
    try {
      await dispatch(updateOrder({ id: currentOrder.order_id, data: { status: 'completed' } }));
      message.success('Đã xác nhận hoàn tất');
    } catch (e) {
      message.error('Không thể xác nhận');
    }
  };

  const placeOrder = async () => {
    if (!checkout || creating) return;
    if (!address.trim()) {
      message.warning('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    if (!phone.trim()) {
      message.warning('Vui lòng nhập số điện thoại liên hệ');
      return;
    }
    try {
      setCreating(true);
      const created = await dispatch(
        createOrder({ total_amount: checkoutTotal, address, payment_method: payment })
      ).unwrap();
      const newId = (created as any).order_id as number;
      await Promise.all(
        checkoutItems.map((it) =>
          dispatch(
            createOrderItem({ order_id: newId, product_id: it.product_id, quantity: it.quantity, price: it.price })
          ).unwrap()
        )
      );
      await dispatch(fetchOrderById(newId));
      await dispatch(fetchOrderItemsByOrderId(newId));
      setCreatedOrderId(newId);
      message.success('Đặt hàng thành công');
    } catch (e: any) {
      message.error(e?.message || 'Đặt hàng thất bại');
    } finally {
      setCreating(false);
    }
  };

  if (!auth.accessToken || !auth.user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="warning" message="Bạn cần đăng nhập để xem đơn hàng" />
        <Button className="mt-4" onClick={() => navigate('/login')} type="primary">
          Đăng nhập
        </Button>
      </div>
    );
  }

  const loading = orderState.loading || orderItemsState.loading || !initialLoaded;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-[30px] inline-block border-b-2 border-[#8b2e0f] mb-6">Chi tiết đơn hàng</h1>

      {/* Checkout flow when navigating from Cart */}
      {checkout && !createdOrderId && (
        <div className="border border-gray-200 bg-white rounded-none p-8 mb-10">
          <h2 className="text-[26px] font-semibold mb-6 inline-block border-b-2 border-[#8b2e0f]">Xác nhận đơn hàng</h2>

          {/* Buyer info */}
          <div className="flex flex-col md:flex-row md:items-start gap-8 text-lg mb-6">
            <div className="flex-1">
              <div className="font-semibold mb-1">Người mua</div>
              <div className="text-[#8b2e0f] font-extrabold text-2xl">{auth.user?.username || `User #${auth.user?.user_id}`}</div>
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Số điện thoại</div>
              <div className="text-gray-800">{(auth.user as any)?.phone || 'Chưa có'}</div>
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Địa chỉ mặc định</div>
              <div className="text-gray-800">{(auth.user as any)?.address || 'Chưa có'}</div>
            </div>
          </div>

          {/* Products to checkout */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-lg">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-700">
                  <th className="p-5 font-semibold">Sản phẩm</th>
                  <th className="p-5 font-semibold">Đơn giá</th>
                  <th className="p-5 font-semibold">Số lượng</th>
                  <th className="p-5 font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checkoutItems.map((it) => {
                  const p = productsMap[it.product_id];
                  const imgUrl = buildImageUrl(p?.image);
                  return (
                    <tr key={it.product_id}>
                      <td className="p-5">
                        <div className="flex items-center gap-5">
                          <div className="w-24 h-24 bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                            {imgUrl ? (
                              <img src={imgUrl} alt={p?.name} className="max-w-[85%] max-h-[85%] object-contain" />
                            ) : (
                              <div className="text-3xl text-gray-400">📦</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-xl leading-snug line-clamp-2">{p?.name || `Product #${it.product_id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap text-gray-900">{formatCurrency(it.price)}</td>
                      <td className="p-5">
                        <div className="inline-flex items-center border border-gray-300">
                          <button className="px-3 py-2 hover:bg-gray-50" onClick={() => decQty(it.product_id)} aria-label="Giảm">-</button>
                          <span className="px-5 min-w-[2.5rem] text-center">{it.quantity}</span>
                          <button className="px-3 py-2 hover:bg-gray-50" onClick={() => incQty(it.product_id)} aria-label="Tăng">+</button>
                        </div>
                      </td>
                      <td className="p-5 font-semibold text-gray-900">{formatCurrency(it.price * it.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Address & payment */}
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ nhận hàng"
                className="w-full border border-gray-300 p-4 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                required
              />
              {!address.trim() && (
                <p className="mt-1 text-sm text-red-600">Vui lòng nhập địa chỉ giao hàng</p>
              )}
              <label className="block text-sm font-medium mb-2 mt-4">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full border border-gray-300 p-4 rounded-none text-base focus:outline-none focus:border-[#8b2e0f]"
                required
              />
              {!phone.trim() && (
                <p className="mt-1 text-sm text-red-600">Vui lòng nhập số điện thoại liên hệ</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Phương thức thanh toán</label>
              <div className="flex flex-wrap gap-4">
                <label
                  className={`cursor-pointer select-none px-4 py-3 border rounded-none flex items-center gap-3 text-base ${
                    payment === 'cash' ? 'bg-[#8b2e0f] text-white border-[#8b2e0f]' : 'border-gray-300 hover:border-[#8b2e0f]'
                  }`}
                >
                  <input type="radio" name="pay" className="hidden" checked={payment === 'cash'} onChange={() => setPayment('cash')} />
                  <span className="font-semibold">COD</span>
                  <span className="opacity-90">Thanh toán khi nhận hàng</span>
                </label>
                <label
                  className={`cursor-pointer select-none px-4 py-3 border rounded-none flex items-center gap-3 text-base ${
                    payment === 'zalopay' ? 'bg-[#8b2e0f] text-white border-[#8b2e0f]' : 'border-gray-300 hover:border-[#8b2e0f]'
                  }`}
                >
                  <input type="radio" name="pay" className="hidden" checked={payment === 'zalopay'} onChange={() => setPayment('zalopay')} />
                  <span className="font-semibold">ZaloPay</span>
                  <span className="opacity-90">Thanh toán qua ZaloPay</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-extrabold text-center">Tổng thanh toán: <span className="text-[#8b2e0f]">{formatCurrency(checkoutTotal)}</span></div>
            <Button
              type="primary"
              loading={creating}
              onClick={placeOrder}
              className="rounded-none w-1/3 py-5 text-xl font-extrabold mx-auto"
              style={{ backgroundColor: '#8b2e0f', borderColor: '#8b2e0f', borderRadius: 0, height: '45px', fontSize: '20px', fontWeight: '400' }}
            >
              Đặt Hàng
            </Button>
          </div>
        </div>
      )}

      Existing detail view
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spin size="large" />
        </div>
      )}
      {!loading && !currentOrder && !checkout && (
        <Alert type="info" message="Không tìm thấy đơn hàng" showIcon />
      )}
      {!loading && currentOrder && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="border border-gray-200 bg-white rounded-none p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-lg font-medium">Mã đơn: <span className="text-[#8b2e0f]">#{currentOrder.order_id}</span></div>
                <div className="text-sm text-gray-600">Ngày tạo: {formatDateTime(currentOrder.created_at)}</div>
                <div className="mt-2">
                  <Tag color={statusColor[currentOrder.status] || 'default'}>{currentOrder.status}</Tag>
                </div>
              </div>
              <div className="flex gap-3">
                {canCancel && (
                  <Button danger onClick={handleCancel} className="rounded-none">
                    Huỷ đơn
                  </Button>
                )}
                {canConfirm && (
                  <Button type="primary" onClick={handleConfirm} className="rounded-none" style={{ backgroundColor: '#8b2e0f', borderColor: '#8b2e0f' }}>
                    Xác nhận nhận hàng
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-semibold mb-1">Người mua</div>
                <div className="text-[#8b2e0f] font-extrabold text-lg">{auth.user?.username || `User #${currentOrder.buyer_id}`}</div>
              </div>
              <div>
                <div className="font-semibold mb-1">Địa chỉ giao hàng</div>
                <div>{currentOrder.address}</div>
              </div>
              <div>
                <div className="font-semibold mb-1">Thanh toán</div>
                <div>{currentOrder.payment_method === 'zalopay' ? 'ZaloPay' : 'Tiền mặt'}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border border-gray-200 bg-white rounded-none p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold inline-block border-b-2 border-[#8b2e0f]">Sản phẩm ({items.length})</h2>
            </div>
            {items.length === 0 && <Alert type="info" message="Đơn hàng chưa có sản phẩm" showIcon />}
            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-base">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-700">
                      <th className="p-4 font-medium">Sản phẩm</th>
                      <th className="p-4 font-medium">Đơn giá</th>
                      <th className="p-4 font-medium">Số lượng</th>
                      <th className="p-4 font-medium">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((it) => {
                      const p = productsMap[it.product_id];
                      return (
                        <tr key={it.order_item_id}>
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white flex items-center justify-center overflow-hidden border border-gray-200">
                                {/* Optional product image if needed: buildImageUrl(p?.image) */}
                                <div className="text-2xl text-gray-400">📦</div>
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 line-clamp-2">{p?.name || `Product #${it.product_id}`}</div>
                                {p?.store_id && (
                                  <div className="text-xs text-gray-500 mt-0.5">Cửa hàng: {p?.store?.name || p?.store_id}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap text-gray-900">{formatCurrency(it.price)}</td>
                          <td className="p-4">{it.quantity}</td>
                          <td className="p-4 font-semibold text-gray-900">{formatCurrency(it.price * it.quantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex flex-col items-end">
              <div className="text-sm text-gray-600">Tổng tạm tính: {formatCurrency(computedTotal)}</div>
              <div className="text-2xl font-extrabold mt-1">Tổng thanh toán: <span className="text-[#8b2e0f]">{formatCurrency(currentOrder.total_amount || computedTotal)}</span></div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button onClick={() => navigate('/cart')} className="rounded-none">Quay lại giỏ hàng</Button>
            <Button type="primary" onClick={() => navigate('/orders')} className="rounded-none" style={{ backgroundColor: '#8b2e0f', borderColor: '#8b2e0f' }}>Xem tất cả đơn hàng</Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrderPage;