import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { actFetchProducts } from '../../redux/features/product/productSlice';
import { actFetchCategories } from '../../redux/features/category/categorySlice';
import type { AppDispatch, RootState } from '../../redux/store';
import type { IProduct } from '../../redux/features/product/productSlice';
import type { ICategory } from '../../redux/features/category/categorySlice';
import {
    SyncOutlined,
    CustomerServiceOutlined,
    CarryOutOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    MessageOutlined,
    SearchOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined
} from "@ant-design/icons";


const Homepage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.product);
  const { categories } = useSelector((state: RootState) => state.category);

  // Header UI states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up');
  const [isTopCategoriesOpen, setIsTopCategoriesOpen] = useState(false);
  const topCatRef = useRef<HTMLDivElement | null>(null);
  // Keep hover dropdown open when cursor moves into its panel
  const [isHoverCatsOpen, setIsHoverCatsOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (topCatRef.current && !topCatRef.current.contains(e.target as Node)) {
        setIsTopCategoriesOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Helper: build image URL from backend /public
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
  // If img has no subfolder, assume it's under /public/product
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    const normalized = img.includes('/') ? img : `product/${img}`;
    return `${API_BASE}/public/${normalized}`;
  };

  // Offer ticker like Shopify header
  const offers: string[] = [
    'Freeship đơn từ 500.000đ',
    'Giảm giá lên đến 45% mỗi ngày',
    'Bảo hành chính hãng 12 tháng',
    'Hỗ trợ 24/7 mọi ngày',
    'Khuyến mãi đặc biệt cuối tuần'
  ];
  const [offerIdx, setOfferIdx] = useState(0);

  useEffect(() => {
    dispatch(actFetchProducts());
    dispatch(actFetchCategories());
  }, [dispatch]);

  // Add subtle shadow/border when scrolling + direction
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
      if (y > lastY + 5) setScrollDir('down');
      else if (y < lastY - 5) setScrollDir('up');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rotate offers
  useEffect(() => {
    const t = setInterval(() => setOfferIdx((i) => (i + 1) % offers.length), 6000);
    return () => clearInterval(t);
  }, [offers.length]);

  // HERO slider data – place files in frontend/public/banner
  const heroSlides = [
    {
      id: 1,
      img: '1.png',
      targetId: 'best-sellers',
    },
    {
      id: 2,
      img: '2.png',
      targetId: 'new-arrivals',
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const prevHero = () => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const nextHero = () => setHeroIndex((i) => (i + 1) % heroSlides.length);
  useEffect(() => {
    const t = setInterval(nextHero, 5000);
    return () => clearInterval(t);
  }, []);
  const buildBannerSrc = (p: string) => {
    if (!p) return '';
    if (p.startsWith('http')) return p;
    // If user accidentally passes '/banner/xxx.png', convert to backend path
    if (p.startsWith('/banner/')) return `${API_BASE}/public${p}`;
    // Default: read from backend static folder /public/banner
    return `${API_BASE}/public/banner/${p}`;
  };
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.location.hash = `#${id}`;
  };

  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.slice(8, 16);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

  // nút Back to top
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* ====== HEADER (Top bar + Main header + Nav) ====== */}
      <header className={`sticky top-0 z-50 bg-white ${isScrolled ? 'shadow-sm' : ''} transition-transform duration-200 ${scrollDir === 'down' && isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
        {/* Row 1: Centered Logo + Search + Icons */}
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-6">
          {/* Logo + brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 bg-[#8b2e0f] text-white text-xl font-bold flex items-center justify-center rounded-sm">E</div>
            <span className="text-3xl font-bold">Electon</span>
          </Link>

          {/* Desktop search (shorter and centered with group) */}
          <form onSubmit={(e)=>e.preventDefault()} className="hidden md:flex items-stretch border border-gray-300 md:w-[420px] lg:w-[480px] xl:w-[520px]">
            <input
              type="search"
              placeholder="Tìm sản phẩm của chúng tôi"
              className="flex-1 px-4 py-2 focus:outline-none"
            />
            <button className="px-5 bg-[#8b2e0f] text-white hover:bg-gray-800 transition"><SearchOutlined /></button>
          </form>

          {/* Icons group near search (user, cart, chat) */}
          <div className="flex items-center gap-5">
            {/* Mobile search toggle */}
            <button
              type="button"
              className="p-2 border border-gray-300 hover:bg-gray-50 md:hidden"
              aria-label="Tìm kiếm"
              onClick={() => setIsSearchOpen((s)=>!s)}
            >
              <SearchOutlined />
            </button>
            <Link to="/login" className="text-2xl" aria-label="Tài khoản"><UserOutlined /></Link>
            <Link to="/cart" className="relative" aria-label="Giỏ hàng">
              <span className="text-2xl"><ShoppingCartOutlined /></span>
            </Link>
            <Link to="/chat" className="text-2xl" aria-label="Chat"><MessageOutlined /></Link>
          </div>
        </div>

        {/* Mobile search bar */}
        {isSearchOpen && (
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-4 md:hidden">
            <form onSubmit={(e)=>e.preventDefault()} className="flex items-stretch border border-gray-300 w-full max-w-md">
              <input type="search" placeholder="Tìm sản phẩm của chúng tôi" className="flex-1 px-3 py-2 focus:outline-none" />
              <button className="px-4 bg-[#8b2e0f] text-white"><SearchOutlined /></button>
            </form>
          </div>
        )}

        {/* Row 2: Category button + Primary nav + Promo */}
        <div>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div ref={topCatRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTopCategoriesOpen((s) => !s)}
                    className={`bg-[#2b2b2b] text-white px-4 py-3 flex items-center gap-3 rounded-none transition-colors ${
                      isTopCategoriesOpen ? 'bg-[#1f1f1f]' : 'hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <span>Danh mục hàng đầu</span>
                    <span className={`text-xl transition-transform duration-200 ${isTopCategoriesOpen ? 'rotate-90' : ''}`}>≡</span>
                  </button>
                  <div
                    className={`absolute left-0 top-full w-80 bg-white rounded-none shadow-xl ring-1 ring-black/5 z-40 transform transition-all duration-200 origin-top ${
                      isTopCategoriesOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    {categories && categories.length > 0 ? (
                      <ul className="py-2 overflow-hidden">
                        {categories.map((c: ICategory) => (
                          <li key={c.category_id}>
                            <Link
                              to={`/products?category=${encodeURIComponent(c.name)}`}
                              className="block px-5 py-3 text-base text-gray-800 transition-all duration-150 hover:bg-[#8b2e0f] hover:text-white hover:pl-6 active:bg-red-600 active:text-white"
                              onClick={() => setIsTopCategoriesOpen(false)}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-5 py-3 text-base text-gray-500">Không có danh mục</div>
                    )}
                  </div>
                </div>

                <nav className="hidden md:flex items-center gap-6 ml-6 text-[15px]">
                  <Link to="/" className="hover:text-red-700 flex items-center gap-1">Trang chủ</Link>

                  {/* Hover dropdown kept open when moving into panel; panel flush with trigger edge */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsHoverCatsOpen(true)}
                    onMouseLeave={() => setIsHoverCatsOpen(false)}
                  >
                    <Link to="/products" className="hover:text-red-700 flex items-center gap-1">
                      Danh mục <span className="text-xs">▾</span>
                    </Link>
                    <div
                      className={`absolute left-0 top-full w-80 bg-white rounded-none shadow-xl ring-1 ring-black/5 z-40 transform transition-all duration-200 ${
                        isHoverCatsOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
                      }`}
                    >
                      {categories && categories.length > 0 ? (
                        <ul className="py-2 overflow-hidden">
                          {categories.map((c: ICategory) => (
                            <li key={c.category_id}>
                              <Link
                                to={`/products?category=${encodeURIComponent(c.name)}`}
                                className="block px-5 py-3 text-base text-gray-800 transition-all duration-150 hover:bg-[#8b2e0f] hover:text-white hover:pl-6 active:bg-red-600 active:text-white"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-5 py-3 text-base text-gray-500">Không có danh mục</div>
                      )}
                    </div>
                  </div>

                  <Link to="/blog" className="hover:text-red-700">Blog</Link>
                </nav>
              </div>
              <div className="hidden md:flex items-center py-3">
                <div className="text-[#8b2e0f] font-semibold min-h-[24px]">{offers[offerIdx]}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                aria-label={heroSlides[heroIndex].targetId === 'best-sellers' ? 'Xem Best Sellers' : 'Xem New Arrivals'}
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
      <div className="text-4xl text-[#8b2e0f]"><SafetyCertificateOutlined /></div>
      <div className="text-left">
        <div className="font-semibold text-lg">Miễn phí vận chuyển</div>
        <div className="text-sm text-gray-600">Đơn từ 500.000đ</div>
      </div>
    </div>

    {/* Item 2 */}
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="text-4xl text-[#8b2e0f]"><SyncOutlined /></div>
      <div className="text-left">
        <div className="font-semibold text-lg">Đổi trả 30 ngày</div>
        <div className="text-sm text-gray-600">Bảo hành chính hãng</div>
      </div>
    </div>

    {/* Item 3 */}
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="text-4xl text-[#8b2e0f]"><CarryOutOutlined /></div>
      <div className="text-left">
        <div className="font-semibold text-lg">Thanh toán an toàn</div>
        <div className="text-sm text-gray-600">Đa phương thức</div>
      </div>
    </div>

    {/* Item 4 */}
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="text-4xl text-[#8b2e0f]"><CustomerServiceOutlined /></div>
      <div className="text-left">
        <div className="font-semibold text-lg">Hỗ trợ 24/7</div>
        <div className="text-sm text-gray-600">Tư vấn chuyên nghiệp</div>
      </div>
    </div>
  </div>
  {/* ====== COLLECTION BANNERS (placeholders) ====== */}
        <section id="collections" className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['3.png', '4.png', '5.png'].map((file, idx) => (
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
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">Best Sellers</h2>
            </div>

            {loading && <div className="text-center py-8">Đang tải dữ liệu...</div>}
            {error && <div className="text-red-600 border border-red-300 p-3 mb-4">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {featuredProducts.map((p: IProduct) => {
                const percent = getDiscountPercent(p);
                const oldPrice = getOldPrice(p.price, percent);
                const imgUrl = buildImageUrl(p.image);
                return (
                  <div key={p.product_id} className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300">
                    {/* Image */}
                    <div className="relative bg-white h-72 flex items-center justify-center overflow-hidden">
                      {/* Discount badge */}
                      <div className="absolute top-4 left-4 z-10 bg-[#8b2e0f] text-white text-xs font-semibold px-2 py-1">{percent}%</div>
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.10] group-hover:-translate-y-1" />
                      ) : (
                        <div className="text-5xl text-gray-400">📦</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-8 text-center">
                      <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2">{p.name}</h3>
                      <div className="flex items-baseline justify-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold text-gray-900">{formatPrice(p.price)}</span>
                        <span className="text-gray-400 line-through">{formatPrice(oldPrice)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="text-amber-400 text-lg leading-none">★ ★ ★ ★ ★</div>
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
              <h2 className="text-[30px] inline-block border-b-2 border-[brown]">New Arrivals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {newArrivals.map((p: IProduct) => {
                const percent = getDiscountPercent(p);
                const oldPrice = getOldPrice(p.price, percent);
                const imgUrl = buildImageUrl(p.image);
                return (
                  <div key={p.product_id} className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300">
                    {/* Image */}
                    <div className="relative bg-white h-72 flex items-center justify-center overflow-hidden">
                      {/* Discount badge */}
                      <div className="absolute top-4 left-4 z-10 bg-[#8b2e0f] text-white text-xs font-semibold px-2 py-1">{percent}%</div>
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.10] group-hover:-translate-y-1" />
                      ) : (
                        <div className="text-5xl text-gray-400">🆕</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-6 pb-8 text-center">
                      <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2">{p.name}</h3>
                      <div className="flex items-baseline justify-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold text-gray-900">{formatPrice(p.price)}</span>
                        <span className="text-gray-400 line-through">{formatPrice(oldPrice)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="text-amber-400 text-lg leading-none">★ ★ ★ ★ ★</div>
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
      <h2 className="text-[25px] inline-block border-b-2 border-[brown]">Đăng ký nhận bản tin của chúng tôi</h2>
      <p className="text-gray-600 mt-2">Nhận khuyến mãi và sản phẩm mới mỗi tuần</p>
    </div>
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-stretch gap-3"
    >
      <label htmlFor="nl-email" className="sr-only">Email</label>
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
    <p className="text-xs text-gray-500 mt-2">Bạn có thể hủy đăng ký bất cứ lúc nào.</p>
  </div>
</section>

      </main>

      {/* ====== FOOTER ====== */}
      <footer className="bg-[#1f1f1f] text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Top: Brand + Address + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#8b2e0f] text-white font-bold flex items-center justify-center rounded-sm">E</div>
                <span className="text-2xl font-semibold text-white">Electon</span>
              </div>
              <p className="text-sm text-gray-400">
                Có rất nhiều biến thể của đoạn văn lorem ipsum, nhưng phần lớn đã bị thay đổi.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Địa chỉ</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-3">
                  <span>92 Quang Trung, Thạch Thang, Hải Châu, TP Đà Nẵng</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Liên hệ với chúng tôi</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3"><span>(+33) 1 23 45 67 89</span></li>
                <li className="flex items-center gap-3"><span>demo@demo.com</span></li>
              </ul>
            </div>
          </div>

          <hr className="my-8 border-gray-700" />

          {/* Middle: Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Thông tin</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white">Về chúng tôi</Link></li>
                <li><Link to="/contact" className="hover:text-white">Liên hệ với chúng tôi</Link></li>
                <li><Link to="/faq" className="hover:text-white">Câu hỏi thường gặp</Link></li>
                <li><Link to="/cart" className="hover:text-white">Giỏ hàng của tôi</Link></li>
                <li><Link to="/wishlist" className="hover:text-white">Danh sách mong muốn</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Công ty</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/payment-policy" className="hover:text-white">Chính sách thanh toán</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Chính sách bảo mật</Link></li>
                <li><Link to="/returns" className="hover:text-white">Chính sách hoàn trả</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Chính sách vận chuyển</Link></li>
                <li><Link to="/terms" className="hover:text-white">Điều khoản và điều kiện</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products?sort=new" className="hover:text-white">Sản phẩm mới</Link></li>
                <li><Link to="/products?tag=featured" className="hover:text-white">Sản phẩm nổi bật</Link></li>
                <li><Link to="/products?sort=best" className="hover:text-white">Bán chạy nhất</Link></li>
                <li><Link to="/products?category=Máy%20tính" className="hover:text-white">Máy tính</Link></li>
                <li><Link to="/sitemap" className="hover:text-white">Sơ đồ trang web</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Tài khoản của tôi</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/account" className="hover:text-white">Tài khoản</Link></li>
                <li><Link to="/cart" className="hover:text-white">Giỏ Hàng</Link></li>
                <li><Link to="/payment-policy" className="hover:text-white">Chính sách thanh toán</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Chính sách vận chuyển</Link></li>
                <li><Link to="/wishlist" className="hover:text-white">Danh sách mong muốn</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-700 pt-6">
            <div className="text-sm text-gray-500">
              Bản quyền © Thương mại điện tử năm 2025 của spacingtech ™
            </div>
            <div className="flex items-center gap-2">
              <a href="#" aria-label="Facebook" className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center">f</a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center">x</a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center">ig</a>
              <a href="#" aria-label="Pinterest" className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center">p</a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 border border-gray-600 hover:border-white flex items-center justify-center">yt</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 border border-gray-700">VISA</span>
              <span className="px-2 py-1 border border-gray-700">AMEX</span>
              <span className="px-2 py-1 border border-gray-700">PayPal</span>
              <span className="px-2 py-1 border border-gray-700">Mastercard</span>
            </div>
          </div>
        </div>

        {/* Back to top button */}
        {isVisible && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 bg-[#8b2e0f] text-white flex items-center justify-center rounded-none shadow hover:bg-red-600 transition-all"
        >
          ↑
        </button>
        )}
      </footer>
    </div>
  );
};

export default Homepage;
