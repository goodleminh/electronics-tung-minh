import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchRelatedProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import { Modal } from "antd";
import { getFormattedPricing, getActivePricing } from "../../utils/price/priceUtil";
import { actAddToCart } from "../../redux/features/cart/cartSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { productDetail, loading, error, productRelated } = useSelector(
    (state: RootState) => state.product
  );
  // NEW: auth state
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // info modal: delivery/ask
  const [infoModal, setInfoModal] = useState<null | "delivery" | "ask">(null);
  // NEW: add-to-cart quantity modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addQty, setAddQty] = useState<number>(1);
  // NEW: login required modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)));
  }, [id, dispatch]);

  // Fetch related products when category/id changes (avoid using `loading`)
  useEffect(() => {
    if (!productDetail?.category_id || !productDetail?.product_id) return;
    dispatch(
      fetchRelatedProducts({
        category_id: productDetail.category_id,
        product_id: productDetail.product_id,
      })
    );
  }, [dispatch, productDetail?.category_id, productDetail?.product_id]);

  const pricing = productDetail ? getFormattedPricing(productDetail) : null;

  // Helper: build image URL from backend /public
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;

  // If img has no subfolder, assume it's under /public/product
  const buildImageUrl = (img?: string | null) => {
    if (!img) return undefined;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };
  //  tăng giảm (clamp by stock if provided)
  const handleIncrease = () => {
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    setQuantity((prev) => (Number.isFinite(max) ? Math.min(prev + 1, max as number) : prev + 1));
  };
  const handleDecrease = () => {
    // Không cho giảm dưới 1
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // NEW: handlers for add-to-cart modal
  const openAddModal = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    const init = Math.max(1, Math.min(quantity, max));
    setAddQty(init);
    setAddOpen(true);
  };
  const decAdd = () => setAddQty((q) => (q > 1 ? q - 1 : 1));
  const incAdd = () => {
    const max = productDetail?.stock ?? Number.POSITIVE_INFINITY;
    setAddQty((q) => (Number.isFinite(max) ? Math.min(q + 1, max as number) : q + 1));
  };
  // NEW: helper to get buyer id robustly
  const getBuyerId = () => {
    // Support both user_id and id from backend/auth
    const idFromState = (user as any)?.user_id ?? (user as any)?.id;
    if (typeof idFromState === "number") return idFromState;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      const id = parsed?.user_id ?? parsed?.id;
      return typeof id === "number" ? id : undefined;
    } catch {
      return undefined;
    }
  };
  const confirmAdd = async () => {
    if (!productDetail) return;
    const buyerId = getBuyerId();
    if (!buyerId) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await dispatch(
        actAddToCart({
          buyer_id: buyerId,
          product_id: productDetail.product_id,
          quantity: addQty,
        })
      ).unwrap();
      setQuantity(addQty);
      setAddOpen(false);
    } catch (e: any) {
      Modal.error({
        title: "Thêm vào giỏ hàng thất bại",
        content: e?.message || "Thử lại sau",
      });
    }
  };
  const handleBuyNow = () => {
    if (!productDetail) return;
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    // Chốt số lượng hợp lệ theo tồn kho
    const max = productDetail.stock ?? Number.POSITIVE_INFINITY;
    const finalQty = Number.isFinite(max) ? Math.min(quantity, max as number) : quantity;
    const active = getActivePricing(productDetail as any);
    const unitPrice = Number(active.finalPrice);
    const total = unitPrice * finalQty;
    navigate('/orders', {
      state: {
        checkout: {
          items: [
            {
              product_id: productDetail.product_id,
              quantity: finalQty,
              price: unitPrice,
            },
          ],
          total,
        },
      },
    });
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!productDetail) return <div>Không tìm thấy sản phẩm</div>;

  // Helper: clamp stock for display
  const displayStock = Math.min(productDetail.stock, 99);

  return (
    <>
      <div className="grid grid-cols-12 gap-10 max-w-7xl mx-auto px-12 mt-12 mb-12">
        {/* Image */}
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6">
          <div className="group border py-4 border-gray-300 bg-white rounded-none overflow-hidden ">
            <div className="bg-white h-100 flex items-center justify-center overflow-hidden">
              {(() => {
                const src = buildImageUrl(productDetail.image);
                return src ? (
                  <img
                    src={src}
                    alt={productDetail.name}
                    className="max-h-[100%] max-w-[100%] object-contain"
                  />
                ) : (
                  <div className="text-5xl text-gray-400">📦</div>
                );
              })()}
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6 text-start content-center">
          {/* product name */}
          <h3 className="text-gray-800 mb-3 text-2xl font-medium">
            {productDetail.name}
          </h3>
          {/* product price */}
          <div className="mb-3">
            <span className="text-2xl font-extrabold text-gray-900 mr-3">
              {pricing?.final}
            </span>
            {pricing?.original && (
              <span className="text-gray-400 line-through mr-3">
                {pricing.original}
              </span>
            )}
            {pricing?.isDiscount && pricing.percent !== undefined && (
              <span className=" bg-[#8b2e0f] text-white text-xs font-semibold px-4 py-1">
                {pricing.percent}%
              </span>
            )}
          </div>
          {/* product description */}
          <p className="mb-3">{productDetail.description}</p>
          {/* product rate */}
          <div className="flex gap-2 text-sm text-gray-600 mb-3">
            <div className="text-amber-400 text-lg leading-none">★ ★ ★ ★ ★</div>
            <span>Không có đánh giá</span>
          </div>
          {/* product stock */}
          {productDetail.stock > 10 && (
            <div className="flex justify-start items-center mb-3">
              <svg width="15" height="15" aria-hidden="true">
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="7.5"
                  fill="rgb(62,214,96, 0.3)"
                ></circle>
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="5"
                  stroke="rgb(255, 255, 255)"
                  strokeWidth="1"
                  fill="rgb(62,214,96)"
                ></circle>
              </svg>
              <span className="ml-1">{productDetail.stock} in stock</span>
            </div>
          )}
          {productDetail.stock <= 10 && (
            <div className="flex justify-start items-center mb-3">
              <svg width="15" height="15" aria-hidden="true">
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="7.5"
                  fill="rgb(238,148,65, 0.3)"
                ></circle>
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="5"
                  stroke="rgb(255, 255, 255)"
                  strokeWidth="1"
                  fill="rgb(238,148,65)"
                ></circle>
              </svg>
              <span className="ml-1">Low stock: {displayStock} left</span>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <p className="font-semibold">Quantity:</p>
            <div className="flex items-center border border-gray-300">
              <button
                className="px-2 py-1 cursor-pointer "
                onClick={handleDecrease}
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                className="px-2 py-1 cursor-pointer"
                onClick={handleIncrease}
                disabled={Number.isFinite(productDetail?.stock) && quantity >= (productDetail?.stock ?? Infinity)}
                title={productDetail?.stock === 0 ? "Hết hàng" : undefined}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-5">
            <button
              className="flex-1 bg-[#8b2e0f] text-white py-3 hover:bg-[#2b2b2b] cursor-pointer"
              onClick={openAddModal}
              disabled={productDetail.stock === 0}
              title={productDetail.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
            >
              ADD TO CART
            </button>
            <button
              className="flex-1 bg-[#8b2e0f] py-3 hover:bg-[#2b2b2b] text-white cursor-pointer"
              onClick={handleBuyNow}
              disabled={productDetail.stock === 0}
              title={productDetail.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
            >
              BUY IT NOW
            </button>
          </div>

          {/* Delivery & Returns / Ask a question */}
          <div className="flex gap-8">
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={() => setInfoModal("delivery")}
            >
              Delivery & return
            </h2>
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={() => setInfoModal("ask")}
            >
              Ask a question
            </h2>
            <Modal
              open={!!infoModal}
              onCancel={() => setInfoModal(null)}
              footer={null}
              centered
            >
              <div className="py-5">
                {infoModal === "delivery" ? (
                  <>
                    <h2 className="text-2xl font-medium mb-3">Delivery</h2>
                    <p>All orders shipped with UPS Express.</p>
                    <p>Always free shipping for orders over US $250.</p>
                    <p className="mb-6">All orders are shipped with a UPS tracking number.</p>
                    <h2 className="text-2xl font-medium mb-3">Returns</h2>
                    <p>
                      Items returned within 14 days of their original shipment date in same as new
                      condition will be eligible for a full refund or store credit.
                    </p>
                    <p>Refunds will be charged back to the original form of payment used for purchase.</p>
                    <p>
                      Customer is responsible for shipping charges when making returns and
                      shipping/handling fees of original purchase is non-refundable.
                    </p>
                    <p className="mb-6">All sale items are final purchases.</p>
                    <h2 className="text-2xl font-medium mb-3">Help</h2>
                    <p>Give us a shout if you have any other questions and/or concerns.</p>
                    <p>
                      Email:<span className="font-medium"> demo@gmail.com</span>
                    </p>
                    <p>
                      Phone:<span className="font-medium"> +1 (23) 456 789</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-medium mb-3">Ask a question</h2>
                    <p>Need more info about this product? Contact us:</p>
                    <p>
                      Email:<span className="font-medium"> support@example.com</span>
                    </p>
                    <p>
                      Phone:<span className="font-medium"> +1 (23) 456 789</span>
                    </p>
                  </>
                )}
              </div>
            </Modal>
          </div>
        </div>
      </div>
      {/* description , review , additional info */}
      <div className="max-w-7xl mx-auto mt-10 px-12">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: "description", label: "DESCRIPTION" },
            { id: "additional", label: "ADDITIONAL INFORMATION" },
            { id: "reviews", label: "REVIEWS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 font-semibold border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#2b2b2b] text-white"
                  : "bg-[#8b2e0f] text-white hover:bg-[#2b2b2b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="text-gray-800 leading-relaxed mb-10">
          {activeTab === "description" && (
            <div>
              <h2 className="text-lg font-bold mb-4">More detail</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  Lorem ipsum is simply dummy text of the printing industry
                </li>
                <li>
                  Lorem ipsum has been the industry's standard dummy text since
                  the 1500s
                </li>
                <li>
                  It has survived not only five centuries, but also the leap
                  into electronic typesetting
                </li>
                <li>
                  It was popularised in the 1960s with the release of Letraset
                  sheets containing Lorem Ipsum passages
                </li>
                <li>
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text.
                </li>
              </ul>

              <h3 className="text-lg font-bold mt-8 mb-4">Key specification</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  A reader will be distracted by the readable content of a page
                  when looking at its layout.
                </li>
                <li>
                  The point of using Lorem Ipsum is that it has a normal
                  distribution of letters.
                </li>
                <li>Various versions have evolved over the years.</li>
                <li>
                  The majority have suffered alteration in some form, by
                  injected humour.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "additional" && (
            <div>
              <h2 className="text-lg font-bold mb-4">Additional Information</h2>
              <p>
                Weight: 1.2kg <br />
                Dimensions: 25 × 15 × 8 cm <br />
                Material: Aluminum <br />
                Warranty: 12 months
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-lg font-bold mb-4">Reviews (0)</h2>
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {productRelated && productRelated.length > 0 ? (
        <section id="related-products" className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">
                Related Products
              </h2>
            </div>

            {loading && (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className="text-red-600 border border-red-300 p-3 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {productRelated.map((p: IProduct) => {
                const pricing = getFormattedPricing(p);
                const imgUrl = buildImageUrl(p.image);
                return (
                  <div
                    key={p.product_id}
                    onClick={() => navigate(`/products/${p.product_id}`)}
                    className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative bg-white h-72 flex items-center justify-center overflow-hidden">
                      {/* Discount badge */}
                      {pricing.isDiscount && pricing.percent !== undefined && (
                        <div className="absolute top-4 left-4 z-10 bg-[#8b2e0f] text-white text-xs font-semibold px-2 py-1">
                          {pricing.percent}%
                        </div>
                      )}
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.10] group-hover:-translate-y-1"
                        />
                      ) : (
                        <div className="text-5xl text-gray-400">📦</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-8 text-center">
                      <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold text-gray-900">
                          {pricing.final}
                        </span>
                        {pricing.original && (
                          <span className="text-gray-400 line-through">
                            {pricing.original}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="text-amber-400 text-lg leading-none">
                          ★ ★ ★ ★ ★
                        </div>
                        <span>Không có đánh giá</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center text-gray-500">
          Không có sản phẩm liên quan
        </div>
      )}

      {/* NEW: Add-to-Cart Quantity Modal */}
      <Modal
        title={null}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={confirmAdd}
        okText="Xác nhận"
        cancelText="Hủy"
        centered
        styles={{ content: { borderRadius: 0, padding: 16 } }}
        className="rounded-none"
        okButtonProps={{ style: { backgroundColor: '#8b2e0f', borderColor: '#8b2e0f', borderRadius: 0 } }}
        cancelButtonProps={{ style: { borderRadius: 0 } }}
      >
        {productDetail && (
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 flex items-center justify-center bg-white border border-gray-200">
              {buildImageUrl(productDetail.image) ? (
                <img
                  src={buildImageUrl(productDetail.image) as string}
                  alt={productDetail.name}
                  className="max-w-[85%] max-h-[85%] object-contain"
                />
              ) : (
                <div className="text-3xl text-gray-400">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                {productDetail.name}
              </div>
              {(() => {
                const pr = getFormattedPricing(productDetail as any);
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
                    onClick={decAdd}
                    aria-label="Giảm"
                  >
                    -
                  </button>
                  <span className="px-4 min-w-[2rem] text-center">{addQty}</span>
                  <button
                    className="px-3 py-1 hover:bg-gray-50"
                    onClick={incAdd}
                    aria-label="Tăng"
                    disabled={Number.isFinite(productDetail?.stock) && addQty >= (productDetail?.stock ?? Infinity)}
                    title={productDetail?.stock === 0 ? 'Hết hàng' : undefined}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* NEW: Login required modal (shown when not logged in) */}
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        onOk={() => {
          setAuthModalOpen(false);
          navigate("/login");
        }}
        okText="Đăng nhập"
        cancelText="Để sau"
        centered
        title={null}
        styles={{ content: { borderRadius: 0 } }}
        className="rounded-none"
        okButtonProps={{ style: { backgroundColor: '#8b2e0f', borderRadius: 0 } }}
        cancelButtonProps={{ style: { borderRadius: 0 } }}
      >
        Bạn cần đăng nhập
      </Modal>
    </>
  );
};

export default ProductDetail;
