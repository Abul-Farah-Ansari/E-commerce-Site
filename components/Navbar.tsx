"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category:
    | string
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | null;
  price: number;
  images?: string[];
  featured?: boolean;
  newArrival?: boolean;
  trending?: boolean;
  sale?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  status?: "active" | "inactive";
}

interface SearchSuggestion {
  type: "product" | "category" | "section";
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
  icon: string;
}

const searchSections = [
  {
    title: "New Arrivals",
    subtitle: "Latest pieces",
    href: "/products?sort=newest",
    icon: "solar:stars-minimalistic-linear",
  },
  {
    title: "Best Sellers",
    subtitle: "Most wanted pieces",
    href: "/products?sort=featured",
    icon: "solar:medal-ribbons-star-linear",
  },
  {
    title: "Trending",
    subtitle: "What's popular",
    href: "/products?search=trending",
    icon: "solar:fire-linear",
  },
  {
    title: "Sale",
    subtitle: "Special prices",
    href: "/products?search=sale",
    icon: "solar:tag-price-linear",
  },
];

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollY = useRef(0);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data?.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // --------------------------------------------------
  // PRODUCTS + CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/products", {
              cache: "no-store",
            }),
            fetch("/api/categories", {
              cache: "no-store",
            }),
          ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();

          setProducts(
            Array.isArray(productsData?.products)
              ? productsData.products
              : []
          );
        }

        if (categoriesResponse.ok) {
          const categoriesData =
            await categoriesResponse.json();

          setCategories(
            Array.isArray(categoriesData?.categories)
              ? categoriesData.categories
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load search data:",
          error
        );
      }
    };

    fetchSearchData();
  }, []);

  // --------------------------------------------------
  // SCROLL NAVBAR
  // --------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);

      if (currentScrollY <= 20) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // --------------------------------------------------
  // OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // SEARCH SUGGESTIONS
  // --------------------------------------------------

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const result: SearchSuggestion[] = [];

    // Sections
    searchSections.forEach((section) => {
      if (
        section.title.toLowerCase().includes(query) ||
        section.subtitle.toLowerCase().includes(query)
      ) {
        result.push({
          type: "section",
          title: section.title,
          subtitle: section.subtitle,
          href: section.href,
          icon: section.icon,
        });
      }
    });

    // Categories
    categories
      .filter(
        (category) =>
          category.status !== "inactive" &&
          category.name
            .toLowerCase()
            .includes(query)
      )
      .slice(0, 4)
      .forEach((category) => {
        result.push({
          type: "category",
          title: category.name,
          subtitle: "Category",
          href: `/categories/${category.slug}`,
          icon: "solar:layers-minimalistic-linear",
        });
      });

    // Products
    products
      .filter((product) => {
        const categoryName =
          typeof product.category === "object" &&
          product.category
            ? product.category.name || ""
            : typeof product.category === "string"
            ? product.category
            : "";

        return (
          product.name
            .toLowerCase()
            .includes(query) ||
          product.slug
            .toLowerCase()
            .includes(query) ||
          categoryName
            .toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 6)
      .forEach((product) => {
        result.push({
          type: "product",
          title: product.name,
          subtitle: "Product",
          href: `/products/${product.slug}`,
          image: product.images?.[0],
          icon: "solar:bag-4-linear",
        });
      });

    return result.slice(0, 10);
  }, [search, categories, products]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
  };

  const handleSearchSubmit = () => {
    const value = search.trim();

    if (!value) {
      return;
    }

    setSearchOpen(false);
    setMobileOpen(false);

    router.push(
      `/products?search=${encodeURIComponent(value)}`
    );
  };

  const handleSuggestionClick = (href: string) => {
    setSearch("");
    setSearchOpen(false);
    setMobileOpen(false);

    router.push(href);
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccountOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  // --------------------------------------------------
  // USER INITIALS
  // --------------------------------------------------

  const userInitials = useMemo(() => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("");
  }, [user]);

  // --------------------------------------------------
  // CLOSE MOBILE
  // --------------------------------------------------

  const closeMobile = () => {
    setMobileOpen(false);
    setCategoryOpen(false);
    setShopOpen(false);
  };

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        right-0
        z-[100]
        transition-transform
        duration-300
        ease-out
        ${
          showNavbar
            ? "translate-y-0"
            : "-translate-y-full"
        }
      `}
    >
      <div
        className={`
          border-b
          border-black/10
          bg-[#FAF8F5]
          transition-shadow
          duration-300
          ${
            scrolled
              ? "shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              : ""
          }
        `}
      >
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-10">
          
          {/* ================================================= */}
          {/* BRAND LOGO + BRAND NAME */}
          {/* ================================================= */}

          <Link
            href="/"
            onClick={closeMobile}
            className="flex shrink-0 items-center gap-3"
          >
            {/* Logo Container */}
            <div className="flex h-[52px] w-[px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src="/logo.jpeg"
                alt="House Of Orive Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Brand Name */}
            <div className="hidden sm:block">
              <span className="block text-[18px] font-semibold uppercase leading-none tracking-[0.12em] text-black">
                House Of Orive
              </span>

              <span className="mt-1.5 block text-[8px] font-medium uppercase tracking-[0.34em] text-black/45">
                Fashion & Lifestyle
              </span>
            </div>
          </Link>

          {/* ================================================= */}
          {/* DESKTOP NAV */}
          {/* ================================================= */}

          
<nav className="hidden items-center gap-6 lg:ml-10 xl:ml-16 lg:flex">

            <Link
              href="/"
              className="text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
            >
              Home
            </Link>

            {/* Categories */}
            <div
              className="relative"
              onMouseEnter={() =>
                setCategoryOpen(true)
              }
              onMouseLeave={() =>
                setCategoryOpen(false)
              }
            >
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
              >
                Categories

                <Icon
                  icon="solar:alt-arrow-down-linear"
                  width={15}
                  height={15}
                  className={`
                    transition-transform
                    duration-200
                    ${
                      categoryOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  w-[240px]
                  -translate-x-1/2
                  pt-5
                  transition-all
                  duration-200
                  ${
                    categoryOpen
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }
                `}
              >
                <div className="border border-black/10 bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.08)]">
                  {categories.length > 0 ? (
                    categories
                      .filter(
                        (category) =>
                          category.status !==
                          "inactive"
                      )
                      .map((category) => (
                        <Link
                          key={category._id}
                          href={`/categories/${category.slug}`}
                          className="flex items-center justify-between px-3 py-3 text-[12px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-black/[0.04]"
                        >
                          <span>
                            {category.name}
                          </span>

                          <Icon
                            icon="solar:arrow-right-up-linear"
                            width={15}
                            height={15}
                          />
                        </Link>
                      ))
                  ) : (
                    <Link
                      href="/categories"
                      className="block px-3 py-3 text-[12px] uppercase tracking-[0.14em]"
                    >
                      View Categories
                    </Link>
                  )}

                  <div className="mt-2 border-t border-black/10 pt-2">
                    <Link
                      href="/categories"
                      className="flex items-center justify-between px-3 py-3 text-[12px] font-medium uppercase tracking-[0.14em]"
                    >
                      <span>
                        All Categories
                      </span>

                      <Icon
                        icon="solar:arrow-right-linear"
                        width={16}
                        height={16}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop */}
            <div
              className="relative"
              onMouseEnter={() =>
                setShopOpen(true)
              }
              onMouseLeave={() =>
                setShopOpen(false)
              }
            >
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
              >
                Shop

                <Icon
                  icon="solar:alt-arrow-down-linear"
                  width={15}
                  height={15}
                  className={`
                    transition-transform
                    duration-200
                    ${
                      shopOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  w-[230px]
                  -translate-x-1/2
                  pt-5
                  transition-all
                  duration-200
                  ${
                    shopOpen
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }
                `}
              >
                <div className="border border-black/10 bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.08)]">
                  <Link
                    href="/products"
                    className="flex items-center justify-between px-3 py-3 text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-black/[0.04]"
                  >
                    <span>All Products</span>
                    <Icon
                      icon="solar:arrow-right-up-linear"
                      width={15}
                      height={15}
                    />
                  </Link>

                  <Link
                    href="/products?sort=newest"
                    className="flex items-center justify-between px-3 py-3 text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-black/[0.04]"
                  >
                    <span>New Arrivals</span>
                    <Icon
                      icon="solar:stars-minimalistic-linear"
                      width={16}
                      height={16}
                    />
                  </Link>

                  <Link
                    href="/products?sort=featured"
                    className="flex items-center justify-between px-3 py-3 text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-black/[0.04]"
                  >
                    <span>Best Sellers</span>
                    <Icon
                      icon="solar:medal-ribbons-star-linear"
                      width={16}
                      height={16}
                    />
                  </Link>

                  <Link
                    href="/sale"
                    className="flex items-center justify-between px-3 py-3 text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-black/[0.04]"
                  >
                    <span>Sale</span>
                    <Icon
                      icon="solar:tag-price-linear"
                      width={16}
                      height={16}
                    />
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/products?sort=newest"
              className="text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
            >
              New Arrivals
            </Link>

            <Link
              href="/about"
              className="text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-[13px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:text-black/50"
            >
              Contact
            </Link>
          </nav>

          {/* ================================================= */}
          {/* RIGHT ACTIONS */}
          {/* ================================================= */}

          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* SEARCH */}
            <div
              ref={searchRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    (value) => !value
                  );

                  setTimeout(() => {
                    document
                      .getElementById(
                        "navbar-search-input"
                      )
                      ?.focus();
                  }, 50);
                }}
                className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:text-black/50"
                aria-label="Search"
              >
                <Icon
                  icon="solar:magnifer-linear"
                  width={21}
                  height={21}
                />
              </button>

              {searchOpen && (
                <div className="fixed left-4 right-4 top-[84px] sm:absolute sm:left-auto sm:right-0 sm:top-[52px] sm:w-[430px]">
                  <div className="overflow-hidden border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                    
                    <div className="flex items-center border-b border-black/10 px-4">
                      <Icon
                        icon="solar:magnifer-linear"
                        width={19}
                        height={19}
                        className="shrink-0 text-black/50"
                      />

                      <input
                        id="navbar-search-input"
                        type="text"
                        value={search}
                        onChange={(event) =>
                          handleSearchChange(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter"
                          ) {
                            handleSearchSubmit();
                          }

                          if (
                            event.key === "Escape"
                          ) {
                            setSearchOpen(false);
                          }
                        }}
                        placeholder="Search products, categories..."
                        className="h-14 w-full bg-transparent px-3 text-sm outline-none placeholder:text-black/35"
                      />

                      {search && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearch("")
                          }
                          className="text-black/40 transition-colors hover:text-black"
                        >
                          <Icon
                            icon="solar:close-circle-linear"
                            width={20}
                            height={20}
                          />
                        </button>
                      )}
                    </div>

                    {search && (
                      <div className="max-h-[420px] overflow-y-auto p-2">
                        {suggestions.length > 0 ? (
                          <>
                            {suggestions.map(
                              (
                                suggestion,
                                index
                              ) => (
                                <button
                                  key={`${suggestion.type}-${suggestion.href}-${index}`}
                                  type="button"
                                  onClick={() =>
                                    handleSuggestionClick(
                                      suggestion.href
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-black/[0.04]"
                                >
                                  {suggestion.image ? (
                                    <div className="h-11 w-11 shrink-0 overflow-hidden bg-[#f4f4f4]">
                                      <img
                                        src={
                                          suggestion.image
                                        }
                                        alt={
                                          suggestion.title
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#f6f6f6]">
                                      <Icon
                                        icon={
                                          suggestion.icon
                                        }
                                        width={20}
                                        height={20}
                                        className="text-black/65"
                                      />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-black">
                                      {
                                        suggestion.title
                                      }
                                    </p>

                                    {suggestion.subtitle && (
                                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-black/40">
                                        {
                                          suggestion.subtitle
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <Icon
                                    icon="solar:arrow-right-up-linear"
                                    width={17}
                                    height={17}
                                    className="shrink-0 text-black/30"
                                  />
                                </button>
                              )
                            )}

                            <button
                              type="button"
                              onClick={
                                handleSearchSubmit
                              }
                              className="mt-1 flex w-full items-center justify-center border-t border-black/10 px-3 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:bg-black/[0.04]"
                            >
                              View all results
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-10 text-center">
                            <Icon
                              icon="solar:magnifer-linear"
                              width={28}
                              height={28}
                              className="mx-auto text-black/20"
                            />

                            <p className="mt-3 text-sm text-black/60">
                              No results found
                            </p>

                            <button
                              type="button"
                              onClick={
                                handleSearchSubmit
                              }
                              className="mt-4 text-[11px] font-medium uppercase tracking-[0.15em] underline underline-offset-4"
                            >
                              Search anyway
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WISHLIST */}
            <Link
              href="/wishlist"
              className="hidden h-10 w-10 items-center justify-center text-black transition-colors hover:text-black/50 sm:flex"
              aria-label="Wishlist"
            >
              <Icon
                icon="solar:heart-linear"
                width={21}
                height={21}
              />
            </Link>

            {/* CART */}
            <Link
              href="/cart"
              className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:text-black/50"
              aria-label="Cart"
            >
              <Icon
                icon="solar:bag-4-linear"
                width={21}
                height={21}
              />
            </Link>

            {/* ACCOUNT */}
            {!loadingUser && (
              <div
                ref={accountRef}
                className="relative hidden sm:block"
              >
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setAccountOpen(
                          (value) => !value
                        )
                      }
                      className="flex h-10 items-center gap-2 border-l border-black/10 pl-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-medium text-white">
                        {userInitials}
                      </span>

                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        width={15}
                        height={15}
                        className={`
                          transition-transform
                          ${
                            accountOpen
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-[52px] w-[230px] border border-black/10 bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.08)]">
                        <div className="border-b border-black/10 px-3 pb-4">
                          <p className="truncate text-sm font-medium">
                            {user.name}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-black/40">
                            {user.email}
                          </p>
                        </div>

                        <div className="pt-2">
                          <Link
                            href="/account"
                            onClick={() =>
                              setAccountOpen(
                                false
                              )
                            }
                            className="flex items-center gap-3 px-3 py-3 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-black/[0.04]"
                          >
                            <Icon
                              icon="solar:user-linear"
                              width={18}
                              height={18}
                            />
                            My Profile
                          </Link>

                          <Link
                            href="/orders"
                            onClick={() =>
                              setAccountOpen(
                                false
                              )
                            }
                            className="flex items-center gap-3 px-3 py-3 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-black/[0.04]"
                          >
                            <Icon
                              icon="solar:box-linear"
                              width={18}
                              height={18}
                            />
                            My Orders
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() =>
                              setAccountOpen(
                                false
                              )
                            }
                            className="flex items-center gap-3 px-3 py-3 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-black/[0.04]"
                          >
                            <Icon
                              icon="solar:heart-linear"
                              width={18}
                              height={18}
                            />
                            Wishlist
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-3 text-left text-[12px] uppercase tracking-[0.12em] text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Icon
                              icon="solar:logout-2-linear"
                              width={18}
                              height={18}
                            />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="ml-1 flex h-10 items-center border-l border-black/10 pl-4 text-[12px] font-medium uppercase tracking-[0.14em] text-black transition-colors hover:text-black/50"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (value) => !value
                )
              }
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-label="Toggle menu"
            >
              <Icon
                icon={
                  mobileOpen
                    ? "solar:close-linear"
                    : "solar:hamburger-menu-linear"
                }
                width={23}
                height={23}
              />
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* MOBILE MENU */}
        {/* ================================================= */}

        {mobileOpen && (
          <div className="border-t border-black/10 bg-white lg:hidden">
            <div className="max-h-[calc(100vh-76px)] overflow-y-auto px-5 py-5">
              <div className="flex flex-col">
                
                <Link
                  href="/"
                  onClick={closeMobile}
                  className="border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                >
                  Home
                </Link>

                {/* Categories */}
                <div className="border-b border-black/10">
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryOpen(
                        (value) => !value
                      )
                    }
                    className="flex w-full items-center justify-between py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                  >
                    <span>Categories</span>

                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      width={18}
                      height={18}
                      className={`
                        transition-transform
                        ${
                          categoryOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {categoryOpen && (
                    <div className="pb-3 pl-3">
                      {categories
                        .filter(
                          (category) =>
                            category.status !==
                            "inactive"
                        )
                        .map((category) => (
                          <Link
                            key={category._id}
                            href={`/categories/${category.slug}`}
                            onClick={closeMobile}
                            className="flex items-center justify-between py-3 text-[12px] uppercase tracking-[0.12em] text-black/70"
                          >
                            <span>
                              {category.name}
                            </span>

                            <Icon
                              icon="solar:arrow-right-linear"
                              width={16}
                              height={16}
                            />
                          </Link>
                        ))}

                      <Link
                        href="/categories"
                        onClick={closeMobile}
                        className="mt-1 flex items-center justify-between border-t border-black/10 pt-3 text-[12px] font-medium uppercase tracking-[0.12em]"
                      >
                        <span>
                          All Categories
                        </span>

                        <Icon
                          icon="solar:arrow-right-linear"
                          width={16}
                          height={16}
                        />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Shop */}
                <div className="border-b border-black/10">
                  <button
                    type="button"
                    onClick={() =>
                      setShopOpen(
                        (value) => !value
                      )
                    }
                    className="flex w-full items-center justify-between py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                  >
                    <span>Shop</span>

                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      width={18}
                      height={18}
                      className={`
                        transition-transform
                        ${
                          shopOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {shopOpen && (
                    <div className="pb-3 pl-3">
                      <Link
                        href="/products"
                        onClick={closeMobile}
                        className="block py-3 text-[12px] uppercase tracking-[0.12em] text-black/70"
                      >
                        All Products
                      </Link>

                      <Link
                        href="/products?sort=newest"
                        onClick={closeMobile}
                        className="block py-3 text-[12px] uppercase tracking-[0.12em] text-black/70"
                      >
                        New Arrivals
                      </Link>

                      <Link
                        href="/products?sort=featured"
                        onClick={closeMobile}
                        className="block py-3 text-[12px] uppercase tracking-[0.12em] text-black/70"
                      >
                        Best Sellers
                      </Link>

                      <Link
                        href="/products?search=sale"
                        onClick={closeMobile}
                        className="block py-3 text-[12px] uppercase tracking-[0.12em] text-black/70"
                      >
                        Sale
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/products?sort=newest"
                  onClick={closeMobile}
                  className="border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                >
                  New Arrivals
                </Link>

                <Link
                  href="/about"
                  onClick={closeMobile}
                  className="border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={closeMobile}
                  className="border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.16em]"
                >
                  Contact
                </Link>

                {/* Mobile Account */}
                {!loadingUser && (
                  <div className="pt-5">
                    {user ? (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                            {userInitials}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user.name}
                            </p>

                            <p className="truncate text-[11px] text-black/40">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/account"
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.12em]"
                        >
                          <Icon
                            icon="solar:user-linear"
                            width={18}
                            height={18}
                          />
                          My Profile
                        </Link>

                        <Link
                          href="/orders"
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.12em]"
                        >
                          <Icon
                            icon="solar:box-linear"
                            width={18}
                            height={18}
                          />
                          My Orders
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.12em]"
                        >
                          <Icon
                            icon="solar:heart-linear"
                            width={18}
                            height={18}
                          />
                          Wishlist
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            closeMobile();
                            handleLogout();
                          }}
                          className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.12em] text-red-600"
                        >
                          <Icon
                            icon="solar:logout-2-linear"
                            width={18}
                            height={18}
                          />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={closeMobile}
                        className="flex h-12 items-center justify-center bg-black text-[12px] font-medium uppercase tracking-[0.16em] text-white"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}