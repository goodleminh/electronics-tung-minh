/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actFetchCategories } from "../../redux/features/category/categorySlice";
import type { AppDispatch } from "../../redux/store";
import type { IProduct } from "../../redux/features/product/productSlice";
import {
  SyncOutlined,
  CustomerServiceOutlined,
  CarryOutOutlined,
  SafetyCertificateOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import { ProductApi } from "../../apis/productApis";
import { getFormattedPricing } from "../../utils/price/priceUtil";

const Homepage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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
    // Fetch categories for header/menus if not loaded elsewhere
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

  // Local data for sections: only 8 items each
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const [newItems, setNewItems] = useState<IProduct[]>([]);
  const [bestLoading, setBestLoading] = useState(false);
  const [bestError, setBestError] = useState<string | null>(null);
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setBestLoading(true);
        setBestError(null);
        const best = await ProductApi.searchProducts({
          sort: "bestseller",
          page: 1,
          limit: 8,
        });
        setBestSellers(best.items || []);
      } catch (e: any) {
        setBestError(e?.message || "Không thể tải Best Sellers");
      } finally {
        setBestLoading(false);
      }
      try {
        setNewLoading(true);
        setNewError(null);
        const newest = await ProductApi.searchProducts({
          sort: "newest",
          page: 1,
          limit: 8,
        });
        setNewItems(newest.items || []);
      } catch (e: any) {
        setNewError(e?.message || "Không thể tải New Arrivals");
      } finally {
        setNewLoading(false);
      }
    };
    fetchSections();
  }, []);

  return (
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
      <section id="policy" className="py-10 bg-white border-t border-gray-200">
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
              <div className="text-sm text-gray-600">Tư vấn chuyên nghiệp</div>
            </div>
          </div>
        </div>
        {/* ====== COLLECTION BANNERS (placeholders) ====== */}
        <section id="collections" className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { file: "3.png", cat: 1, aria: "Xem danh mục Điện thoại" },
              { file: "4.png", cat: 3, aria: "Xem danh mục Tai nghe" },
              { file: "5.png", cat: 7, aria: "Xem danh mục Đồng hồ" },
            ].map((b, idx) => (
              <div
                key={b.file}
                className="relative overflow-hidden group transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={buildBannerSrc(b.file)}
                  alt={`collection banner ${idx + 3}`}
                  className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="pointer-events-none absolute inset-2 border-2 border-white/60 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                <button
                  type="button"
                  aria-label={b.aria}
                  className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
                  onClick={() => navigate(`/search?category=${b.cat}`)}
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
            <h2
              className="text-[30px] inline-block border-b-2 border-[brown] cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/search?sort=bestseller`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/search?sort=bestseller`);
                }
              }}
            >
              Best Sellers
            </h2>
          </div>

          {bestLoading && (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          )}
          {bestError && (
            <div className="text-red-600 border border-red-300 p-3 mb-4">
              {bestError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {bestSellers.map((p: IProduct) => {
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
                    <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2 line-clamp-2 min-h-[3em]">
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

      {/* ====== NEW ARRIVALS ====== */}
      <section id="new-arrivals" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2
              className="text-[30px] inline-block border-b-2 border-[brown] cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/search?sort=newest`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/search?sort=newest`);
                }
              }}
            >
              New Arrivals
            </h2>
          </div>
          {newLoading && (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          )}
          {newError && (
            <div className="text-red-600 border border-red-300 p-3 mb-4">
              {newError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {newItems.map((p: IProduct) => {
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
                      <div className="text-5xl text-gray-400">🆕</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-6 pt-6 pb-8 text-center">
                    <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2 line-clamp-2 min-h-[3em]">
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
  );
};

export default Homepage;
