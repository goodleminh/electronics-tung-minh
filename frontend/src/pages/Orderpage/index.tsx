import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../redux/store';
import { createOrder } from '../../redux/features/order/orderSlice';
import { createOrderItem } from '../../redux/features/order_item/order_itemSlice';
import { Button, Alert, message, Modal } from 'antd';
import { actFetchProducts } from '../../redux/features/product/productSlice';
import { actSendConfirmationEmail } from '../../redux/features/order/orderSlice';

const formatCurrency = (n?: number) => {
  if (typeof n !== 'number') return '0₫';
  return n.toLocaleString('vi-VN') + '₫';
};

const OrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector((s: RootState) => s.auth);
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

  const [payment, setPayment] = useState<'cash' | 'zalopay'>('cash');
  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Dynamic total for checkout flow
  const checkoutTotal = checkoutItems.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);

  const placeOrder = async () => {
    console.log("[DEBUG] placeOrder called", { checkout, creating, address, phone });
    if (!checkout || creating) {
      message.error('Không có dữ liệu đơn hàng (checkout) hoặc đang tạo đơn hàng.');
      return;
    }
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
      console.log("[DEBUG] Order created", created);
      const newId = (created as any).order_id as number;
      await Promise.all(
        checkoutItems.map((it) =>
          dispatch(
            createOrderItem({ order_id: newId, product_id: it.product_id, quantity: it.quantity, price: it.price })
          ).unwrap()
        )
      );
      setCreatedOrderId(newId);
      message.success('Đặt hàng thành công');
      // Gửi email xác nhận qua Redux Thunk
      try {
        const userEmail = (auth.user as any)?.email;
        const orderCode = (created as any).order_code;
        const totalAmount = checkoutTotal;
        const addressValue = address;
        const itemsWithDetails = checkoutItems.map(item => {
          const product = productState.products.find(p => p.product_id === item.product_id);
          return { name: product?.name || 'Sản phẩm', ...item };
        });
        if (userEmail) {
          dispatch(
            actSendConfirmationEmail({
              toEmail: userEmail,
              orderCode,
              totalAmount,
              address: addressValue,
              items: itemsWithDetails,
            })
          );
        }
      } catch (emailError) {
        console.error('[DEBUG] Lỗi gửi email:', emailError);
      }
    } catch (e: any) {
      console.error("[DEBUG] Error in placeOrder", e);
      message.error(e?.message || 'Đặt hàng thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handlePlaceOrder = () => {
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    console.log("[DEBUG] handleConfirmOrder called");
    setShowConfirm(false);
    await placeOrder();
  };

  const handleCancelOrder = () => {
    setShowConfirm(false);
  };

  // Hiển thị cảnh báo nếu không có dữ liệu checkout
  if (!checkout) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message="Không có dữ liệu đơn hàng. Vui lòng quay lại giỏ hàng để đặt hàng." />
        <Button className="mt-4" onClick={() => navigate('/cart')} type="primary">
          Quay lại giỏ hàng
        </Button>
      </div>
    );
  }

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
                  const p = productState.products?.find((prod) => prod.product_id === it.product_id);
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
              onClick={handlePlaceOrder}
              className="rounded-none w-1/3 py-5 text-xl font-extrabold mx-auto"
              style={{ backgroundColor: '#8b2e0f', borderColor: '#8b2e0f', borderRadius: 0, height: '45px', fontSize: '20px', fontWeight: '400' }}
              disabled={!address.trim() || !phone.trim()}
            >
              Đặt Hàng
            </Button>
            <Modal
              open={showConfirm}
              onOk={handleConfirmOrder}
              onCancel={handleCancelOrder}
              okText="Xác nhận"
              cancelText="Huỷ"
              centered
              footer={[
                <Button
                  key="cancel"
                  onClick={handleCancelOrder}
                  style={{ borderRadius: 0 }}
                >
                  Huỷ
                </Button>,
                <Button
                  key="ok"
                  type="primary"
                  onClick={handleConfirmOrder}
                  style={{ backgroundColor: '#8b2e0f', borderColor: '#8b2e0f', borderRadius: 0 }}
                >
                  Xác nhận
                </Button>,
              ]}
              styles={{ content: { borderRadius: 0 } }}
            >
              <div className="text-lg font-semibold mb-2">Bạn có chắc chắn đặt hàng?</div>
              <div className="text-base">Tổng thanh toán: <span className="text-[#8b2e0f] font-bold">{formatCurrency(checkoutTotal)}</span></div>
            </Modal>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrderPage;