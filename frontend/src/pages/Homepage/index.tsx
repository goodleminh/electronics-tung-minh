import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actFetchProducts } from "../../redux/features/product/productSlice";
import { actFetchCategories } from "../../redux/features/category/categorySlice";
import type { AppDispatch, RootState } from "../../redux/store";
import type { IProduct } from "../../redux/features/product/productSlice";
import {
  SyncOutlined,
  CustomerServiceOutlined,
  CarryOutOutlined,
  SafetyCertificateOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import Header from "../../components/HeaderComponent";
import Footer from "../../components/FooterComponent";
import { useNavigate } from "react-router-dom";

const Homepage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.product
  );

  // Helper: build image URL from backend /public
  const API_BASE: string | undefined = import.meta.env.VITE_API_URL;
  // If img has no subfolder, assume it's under /public/product
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const normalized = img.includes("/") ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };

  useEffect(() => {
    dispatch(actFetchProducts());
    dispatch(actFetchCategories());
  }, [dispatch]);

  // HERO slider data – place files in frontend/public/banner
  const heroSlides = [
    {
      id: 1,
      img: "1.png",
      targetId: "best-sellers",
    },
    {
      id: 2,
      img: "2.png",
      targetId: "new-arrivals",
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const prevHero = () =>
    setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const nextHero = () => setHeroIndex((i) => (i + 1) % heroSlides.length);
  useEffect(() => {
    const t = setInterval(nextHero, 5000);
    return () => clearInterval(t);
  }, []);
  const buildBannerSrc = (p: string) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    // If user accidentally passes '/banner/xxx.png', convert to backend path
    if (p.startsWith("/banner/")) return `${API_BASE}/public${p}`;
    // Default: read from backend static folder /public/banner
    return `${API_BASE}/public/banner/${p}`;
  };
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = `#${id}`;
  };

  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        {/* ====== HERO (Slider placeholder) ====== */}
        <section id="hero" className="bg-[#f3f3f3]">
          <div className="relative max-w-7xl mx-auto px-4 group">
            <div className="relative">
              <img
                src={buildBannerSrc(heroSlides[heroIndex].img)}
                alt={`banner ${heroSlides[heroIndex].id}`}
                className="w-full h-auto object-cover"
              />
              <button
                type="button"
                aria-label={
                  heroSlides[heroIndex].targetId === "best-sellers"
                    ? "Xem Best Sellers"
                    : "Xem New Arrivals"
                }
                onClick={() => scrollToSection(heroSlides[heroIndex].targetId)}
                className="absolute inset-0 w-full h-full cursor-pointer bg-transparent"
              />
            </div>

            {/* Nav arrows inside constrained container */}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prevHero}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8b2e0f] text-white flex items-center justify-center hover:bg-[#6e260c] shadow opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto transition-opacity duration-300 z-20"
            >
              <DoubleLeftOutlined />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={nextHero}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8b2e0f] text-white flex items-center justify-center hover:bg-[#6e260c] shadow opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto transition-opacity duration-300 z-20"
            >
              <DoubleRightOutlined />
            </button>
          </div>
        </section>

        {/* ====== POLICIES (Features) ====== */}
        <section
          id="policy"
          className="py-10 bg-white border-t border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-[#8b2e0f]">
            {/* Item 1 */}
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="text-4xl text-[#8b2e0f]">
                <SafetyCertificateOutlined />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Miễn phí vận chuyển</div>
                <div className="text-sm text-gray-600">Đơn từ 500.000đ</div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="text-4xl text-[#8b2e0f]">
                <SyncOutlined />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Đổi trả 30 ngày</div>
                <div className="text-sm text-gray-600">Bảo hành chính hãng</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="text-4xl text-[#8b2e0f]">
                <CarryOutOutlined />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Thanh toán an toàn</div>
                <div className="text-sm text-gray-600">Đa phương thức</div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="text-4xl text-[#8b2e0f]">
                <CustomerServiceOutlined />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Hỗ trợ 24/7</div>
                <div className="text-sm text-gray-600">
                  Tư vấn chuyên nghiệp
                </div>
              </div>
            </div>
          </div>
          {/* ====== COLLECTION BANNERS (placeholders) ====== */}
          <section id="collections" className="py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {["3.png", "4.png", "5.png"].map((file, idx) => (
                <div
                  key={file}
                  className="relative overflow-hidden group transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <img
                    src={buildBannerSrc(file)}
                    alt={`collection banner ${idx + 3}`}
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  {/* Strong inner overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="pointer-events-none absolute inset-2 border-2 border-white/60 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                  {/* Full overlay button (no link yet) */}
                  <button
                    type="button"
                    aria-label={`Banner ${idx + 3}`}
                    className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>
        </section>

        {/* ====== BEST SELLERS ====== */}
        <section id="best-sellers" className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">
                Best Sellers
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
              {featuredProducts.map((p: IProduct) => {
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
                        {percent}%
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

        {/* ====== NEW ARRIVALS ====== */}
        <section id="new-arrivals" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">
                New Arrivals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {newArrivals.map((p: IProduct) => {
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
                        {percent}%
                      </div>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.10] group-hover:-translate-y-1"
                        />
                      ) : (
                        <div className="text-5xl text-gray-400">🆕</div>
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

        {/* ====== NEWSLETTER ====== */}
        <section id="newsletter" className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-6">
              <h2 className="text-[25px] inline-block border-b-2 border-[brown]">
                Đăng ký nhận bản tin của chúng tôi
              </h2>
              <p className="text-gray-600 mt-2">
                Nhận khuyến mãi và sản phẩm mới mỗi tuần
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-stretch gap-3"
            >
              <label htmlFor="nl-email" className="sr-only">
                Email
              </label>
              <input
                id="nl-email"
                type="email"
                required
                placeholder="Nhập email của bạn..."
                className="flex-1 min-w-0 border border-gray-300 p-3 rounded-none focus:outline-none focus:border-[#8b2e0f]"
              />
              <button
                type="submit"
                className="bg-[#8b2e0f] text-white px-6 py-3  hover:bg-gray-800 transition cursor-pointer"
              >
                Đăng ký
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
