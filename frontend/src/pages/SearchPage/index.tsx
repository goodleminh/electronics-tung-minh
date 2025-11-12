import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  actFetchProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";
import {
  actFetchCategories,
  type ICategory,
} from "../../redux/features/category/categorySlice";
import "./style.css";

const SearchPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { products, loading, error } = useSelector((s: RootState) => s.product);
  const { categories } = useSelector((s: RootState) => s.category);

  // Query params
  const params = new URLSearchParams(location.search);
  const qParam = params.get("q") || "";
  const catParam = params.get("category") || "all"; // category_id as string or 'all'
  const minParam = params.get("min") || "";
  const maxParam = params.get("max") || "";
  const sortParam = params.get("sort") || "relevance"; // relevance|price-asc|price-desc|newest

  const [q, setQ] = useState(qParam);
  const [cat, setCat] = useState(catParam);
  const [minPrice, setMinPrice] = useState(minParam);
  const [maxPrice, setMaxPrice] = useState(maxParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Dynamic sticky offset: stick below header when scrolling down, at top when at page top
  const [stickyTop, setStickyTop] = useState(0);
  useEffect(() => {
    const getHeaderEl = () =>
      document.querySelector("header") as HTMLElement | null;
    const calc = () => {
      const hdr = getHeaderEl();
      const headerH = hdr ? hdr.offsetHeight : 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setStickyTop(y > 0 ? headerH + 8 : 0); // +8px spacing under header
    };
    calc();
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calc();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", calc);
    };
  }, []);

  useEffect(() => {
    if (!products.length) dispatch(actFetchProducts());
    if (!categories.length) dispatch(actFetchCategories());
    // sync url -> state when back/forward
    setQ(qParam);
    setCat(catParam);
    setMinPrice(minParam);
    setMaxPrice(maxParam);
    setSortBy(sortParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, catParam, minParam, maxParam, sortParam]);

  // Helpers matching Homepage
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
  const getDiscountPercent = (p: IProduct) => {
    const map = [2, 5, 7, 8];
    return map[p.product_id % map.length];
  };
  const getOldPrice = (price: number, percent: number) =>
    Math.round(Number(price) * (1 + percent / 100));

  const updateUrl = (kv: Record<string, string | undefined>) => {
    const p = new URLSearchParams(location.search);
    Object.entries(kv).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    navigate({ pathname: "/search", search: p.toString() }, { replace: true });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q, category: cat, min: minPrice, max: maxPrice, sort: sortBy });
  };

  // Add reset handler to clear all filters and URL params
  const onReset = () => {
    setQ("");
    setCat("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    updateUrl({ q: "", category: "", min: "", max: "", sort: "" });
  };

  const filtered = useMemo(() => {
    let list: IProduct[] = [...products];
    if (qParam) {
      const kw = qParam.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          (p.description || "").toLowerCase().includes(kw)
      );
    }
    if (catParam !== "all") {
      const cid = Number(catParam);
      list = list.filter((p) => Number(p.category_id) === cid);
    }
    const min = Number(minParam || 0);
    const max = Number(maxParam || 0);
    if (min) list = list.filter((p) => Number(p.price) >= min);
    if (max) list = list.filter((p) => Number(p.price) <= max);

    switch (sortParam) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
        break;
      case "bestseller": {
        const getSold = (x: IProduct) =>
          Number((x as any).sold ?? (x as any).sold_count ?? 0);
        list.sort((a, b) => getSold(b) - getSold(a));
        break;
      }
      default:
        break;
    }
    return list;
  }, [products, qParam, catParam, minParam, maxParam, sortParam]);

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title + count */}
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Tìm kiếm sản phẩm
          </h1>
          <span className="text-sm text-gray-500">
            {filtered.length} kết quả
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Filters */}
          <aside
            className="md:col-span-3 bg-white border border-gray-200 p-4 sticky self-start h-fit"
            style={{ top: stickyTop }}
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Từ khóa
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nhập tên sản phẩm, mô tả..."
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Danh mục
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
                >
                  <option value="all">Tất cả</option>
                  {categories.map((c: ICategory) => (
                    <option
                      key={c.category_id}
                      value={c.category_id.toString()}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Khoảng giá (VND)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Từ"
                    className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
                  />
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Đến"
                    className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8b2e0f]"
                >
                  <option value="relevance">Phù hợp nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="bestseller">Bán chạy nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 text-sm hover:bg-gray-50"
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8b2e0f] text-white py-2 text-sm hover:opacity-90"
                >
                  Áp dụng
                </button>
              </div>
            </form>
          </aside>

          {/* Results with same card style as Homepage */}
          <section className="md:col-span-9">
            {loading && (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className="text-red-600 border border-red-300 p-3 mb-4">
                {error}
              </div>
            )}
            {!loading && filtered.length === 0 && !error && (
              <div className="text-center text-gray-500">
                Không có sản phẩm phù hợp.
              </div>
            )}

            {/* Use auto-fill with minmax so items wrap to new rows when width is insufficient */}
            <div className="grid [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] gap-8">
              {filtered.map((p: IProduct) => {
                const percent = getDiscountPercent(p);
                const oldPrice = getOldPrice(Number(p.price), percent);
                const imgUrl = buildImageUrl(p.image);
                return (
                  <div
                    key={p.product_id}
                    className="group border border-gray-200 bg-white rounded-none overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300"
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
                      <h3 className="text-gray-800 group-hover:text-gray-900 transition font-medium mb-2 line-clamp-2 min-h-[3em]">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold text-gray-900">
                          {formatPrice(Number(p.price))}
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
          </section>
        </div>
      </div>
    </main>
  );
};

export default SearchPage;
