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

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { productDetail, loading, error, productRelated } = useSelector(
    (state: RootState) => state.product
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(Number(id)));
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetail?.category_id && productDetail?.product_id) {
      dispatch(
        fetchRelatedProducts({
          category_id: productDetail.category_id,
          product_id: productDetail.product_id,
        })
      );
    }
  }, [productDetail, loading, dispatch]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));

  // Helpers for product card UI
  const getDiscountPercent = (p: IProduct) => {
    const map = [2, 5, 7, 8];
    return map[p.product_id % map.length];
  };
  const getOldPrice = (price: number, percent: number) => {
    return Math.round(Number(price) * (1 + percent / 100));
  };

  if (!productDetail) return <div>Không tìm thấy sản phẩm</div>;

  const discount = getDiscountPercent(productDetail);
  const oldPrice = getOldPrice(productDetail?.price, discount);

  // Helper: build image URL from backend /public
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;

  // If img has no subfolder, assume it's under /public/product
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };
  //  tăng giảm
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };
  const handleDecrease = () => {
    // Không cho giảm dưới 1
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  //control modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;
  if (!productDetail) return <div>Không tìm thấy sản phẩm</div>;
  return (
    <>
      <div className="grid grid-cols-12 gap-10 max-w-7xl mx-auto px-12 mt-12 mb-12">
        {/* Image */}
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-6">
          <div className="group border py-4 border-gray-300 bg-white rounded-none overflow-hidden ">
            <div className="bg-white h-100 flex items-center justify-center overflow-hidden">
              <img
                src={`${buildImageUrl(productDetail.image)}`}
                alt={productDetail.name}
                className="max-h-[100%] max-w-[100%] object-contain"
              />
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
              {formatPrice(productDetail.price)}
            </span>
            <span className="text-gray-400 line-through mr-3">
              {formatPrice(oldPrice)}
            </span>
            {/* Discount badge */}
            <span className=" bg-[#8b2e0f] text-white text-xs font-semibold px-4 py-1">
              {discount}%
            </span>
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
              <span className="ml-1">Low stock: 10 left</span>
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
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-5">
            <button className="flex-1 bg-[#8b2e0f] text-white py-3 hover:bg-[#2b2b2b] cursor-pointer">
              ADD TO CART
            </button>
            <button className="flex-1  bg-[#8b2e0f] py-3 hover:bg-[#2b2b2b] text-white cursor-pointer">
              BUY IT NOW
            </button>
          </div>

          {/* Delivery & Returns */}
          <div className="flex gap-8">
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={showModal}
            >
              Delivery & return
            </h2>
            <Modal
              closable={{ "aria-label": "Custom Close Button" }}
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              centered
            >
              {/* Modal content */}
              <div className="py-5">
                {/* Delivery */}
                <h2 className="text-2xl font-medium mb-3">Delivery</h2>
                <p>All orders shipped with UPS Express.</p>
                <p>Always free shipping for orders over US $250.</p>
                <p className="mb-6">
                  All orders are shipped with a UPS tracking number.
                </p>
                {/* Return */}
                <h2 className="text-2xl font-medium mb-3">Returns</h2>
                <p>
                  Items returned within 14 days of their original shipment date
                  in same as new condition will be eligible for a full refund or
                  store credit.
                </p>
                <p>
                  Refunds will be charged back to the original form of payment
                  used for purchase.
                </p>
                <p>
                  Customer is responsible for shipping charges when making
                  returns and shipping/handling fees of original purchase is
                  non-refundable.
                </p>
                <p className="mb-6">All sale items are final purchases.</p>
                <h2 className="text-2xl font-medium mb-3">Help</h2>
                <p>
                  Give us a shout if you have any other questions and/or
                  concerns.
                </p>
                <p>
                  Email:<span className="font-medium"> demo@gmail.com</span>
                </p>
                <p>
                  Phone:<span className="font-medium"> +1 (23) 456 789</span>
                </p>
              </div>
            </Modal>
            {/* Ask a question */}
            <h2
              className="text-xl font-medium hover:text-[#8b2e0f] cursor-pointer"
              onClick={showModal}
            >
              Ask a question
            </h2>
            <Modal
              closable={{ "aria-label": "Custom Close Button" }}
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              centered
            >
              {/* Modal content */}
              <div className="py-5">
                {/* Delivery */}
                <h2 className="text-2xl font-medium mb-3">Delivery</h2>
                <p>All orders shipped with UPS Express.</p>
                <p>Always free shipping for orders over US $250.</p>
                <p className="mb-6">
                  All orders are shipped with a UPS tracking number.
                </p>
                {/* Return */}
                <h2 className="text-2xl font-medium mb-3">Returns</h2>
                <p>
                  Items returned within 14 days of their original shipment date
                  in same as new condition will be eligible for a full refund or
                  store credit.
                </p>
                <p>
                  Refunds will be charged back to the original form of payment
                  used for purchase.
                </p>
                <p>
                  Customer is responsible for shipping charges when making
                  returns and shipping/handling fees of original purchase is
                  non-refundable.
                </p>
                <p className="mb-6">All sale items are final purchases.</p>
                <h2 className="text-2xl font-medium mb-3">Help</h2>
                <p>
                  Give us a shout if you have any other questions and/or
                  concerns.
                </p>
                <p>
                  Email:<span className="font-medium"> demo@gmail.com</span>
                </p>
                <p>
                  Phone:<span className="font-medium"> +1 (23) 456 789</span>
                </p>
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
                const percent = getDiscountPercent(p);
                const oldPrice = getOldPrice(p.price, percent);
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
                      <div className="absolute top-4 left-4 z-10 bg-[#8b2e0f] text-white text-xs font-semibold px-2 py-1">
                        {discount}%
                      </div>
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
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-gray-400 line-through">
                          {formatPrice(oldPrice)}
                        </span>
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
    </>
  );
};

export default ProductDetail;
