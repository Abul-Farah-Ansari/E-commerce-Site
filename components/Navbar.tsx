"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function Navbar() {
  const router = useRouter();

  // =========================================================
  // STATES
  // =========================================================

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [search, setSearch] = useState("");

  // =========================================================
  // REFS
  // =========================================================

  const categoriesRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // LOGGED-IN USER
  // =========================================================
  // Temporary user.
  // Later connect this with your actual authentication/session.

  const userName = "Sima Kumar";

  // =========================================================
  // GET USER INITIALS
  //
  // Sima Kumar -> SK
  // Amit Fahad Ansari -> AFA
  // Rahul -> R
  // =========================================================

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const userInitials = getInitials(userName);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    {
      name: "Women",
      href: "/categories/women",
    },
    {
      name: "Men",
      href: "/categories/men",
    },
    {
      name: "Kids",
      href: "/categories/kids",
    },
    {
      name: "Accessories",
      href: "/categories/accessories",
    },
    {
      name: "Footwear",
      href: "/categories/footwear",
    },
  ];

  // =========================================================
  // SHOP SUBMENU
  // =========================================================

  const shopLinks = [
    {
      name: "All Products",
      href: "/shop",
    },
    {
      name: "Best Sellers",
      href: "/shop?sort=best-selling",
    },
    {
      name: "Trending",
      href: "/shop?sort=trending",
    },
    {
      name: "Sale",
      href: "/shop?sale=true",
    },
  ];

  // =========================================================
  // CLOSE DESKTOP DROPDOWNS
  // =========================================================

  const closeDropdowns = () => {
    setCategoriesOpen(false);
    setShopOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    router.push(`/shop?search=${encodeURIComponent(value)}`);

    setSearch("");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    closeDropdowns();
    setMobileOpen(false);

    /*
      IMPORTANT:
      Replace this with your actual authentication logout.

      Example:

      localStorage.removeItem("token");

      or

      await signOut();
    */

    router.push("/login");
  };

  // =========================================================
  // CLICK OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !categoriesRef.current?.contains(target) &&
        !shopRef.current?.contains(target) &&
        !accountRef.current?.contains(target) &&
        !searchRef.current?.contains(target)
      ) {
        closeDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdowns();
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  const closeMobile = () => {
    setMobileOpen(false);
    closeDropdowns();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <nav className="relative w-full">

        {/* =====================================================
            MAIN NAVBAR
        ====================================================== */}

        <div className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* ===================================================
              BRAND
          ==================================================== */}

          <Link
            href="/"
            onClick={closeDropdowns}
            className="flex shrink-0 items-center gap-3"
          >
            <img
              src="/logo.jpeg"
              alt="House Of Orive"
              className="h-11 w-11 object-contain"
            />

            <div className="leading-none">
              <span className="block whitespace-nowrap text-[20px] font-semibold tracking-[-0.02em] text-neutral-950 sm:text-[22px]">
                House Of Orive
              </span>

              <span className="mt-1 hidden text-[8px] font-medium uppercase tracking-[0.28em] text-neutral-400 sm:block">
                Fashion & Lifestyle
              </span>
            </div>
          </Link>

          {/* ===================================================
              DESKTOP NAVIGATION
          ==================================================== */}

          <div className="hidden items-center gap-7 xl:flex">

            {/* HOME */}

            <Link
              href="/"
              onClick={closeDropdowns}
              className="group relative py-7 text-[15px] font-medium text-neutral-900"
            >
              Home

              <span className="absolute bottom-[17px] left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <div
              ref={categoriesRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setCategoriesOpen((prev) => !prev);
                  setShopOpen(false);
                  setAccountOpen(false);
                  setSearchOpen(false);
                }}
                className="flex items-center gap-1.5 py-7 text-[15px] font-medium text-neutral-900"
              >
                Categories

                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`text-[16px] transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute left-1/2 top-[68px] w-[235px] -translate-x-1/2 overflow-hidden border border-neutral-200 bg-white py-2 shadow-[0_15px_40px_rgba(0,0,0,0.10)]">

                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={closeDropdowns}
                      className="group flex items-center justify-between px-5 py-3.5 text-[14px] text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <span>{category.name}</span>

                      <Icon
                        icon="solar:arrow-right-linear"
                        className="text-[16px] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  ))}

                  <div className="mt-1 border-t border-neutral-100 pt-1">
                    <Link
                      href="/categories"
                      onClick={closeDropdowns}
                      className="flex items-center justify-between px-5 py-3.5 text-[14px] font-medium text-black"
                    >
                      <span>View All Categories</span>

                      <Icon
                        icon="solar:arrow-right-linear"
                        className="text-[16px]"
                      />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                SHOP
            ================================================= */}

            <div
              ref={shopRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShopOpen((prev) => !prev);
                  setCategoriesOpen(false);
                  setAccountOpen(false);
                  setSearchOpen(false);
                }}
                className="flex items-center gap-1.5 py-7 text-[15px] font-medium text-neutral-900"
              >
                Shop

                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`text-[16px] transition-transform duration-200 ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {shopOpen && (
                <div className="absolute left-1/2 top-[68px] w-[220px] -translate-x-1/2 overflow-hidden border border-neutral-200 bg-white py-2 shadow-[0_15px_40px_rgba(0,0,0,0.10)]">

                  {shopLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeDropdowns}
                      className="group flex items-center justify-between px-5 py-3.5 text-[14px] text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <span>{item.name}</span>

                      <Icon
                        icon="solar:arrow-right-linear"
                        className="text-[16px] transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            <Link
              href="/new-arrivals"
              onClick={closeDropdowns}
              className="group relative py-7 text-[15px] font-medium text-neutral-900"
            >
              New Arrivals

              <span className="absolute bottom-[17px] left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* =================================================
                ABOUT
            ================================================= */}

            <Link
              href="/about"
              onClick={closeDropdowns}
              className="group relative py-7 text-[15px] font-medium text-neutral-900"
            >
              About

              <span className="absolute bottom-[17px] left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* =================================================
                CONTACT
            ================================================= */}

            <Link
              href="/contact"
              onClick={closeDropdowns}
              className="group relative py-7 text-[15px] font-medium text-neutral-900"
            >
              Contact

              <span className="absolute bottom-[17px] left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          {/* ===================================================
              DESKTOP RIGHT SIDE
          ==================================================== */}

          <div className="hidden items-center gap-5 xl:flex">

            {/* =================================================
                SEARCH
            ================================================= */}

            <div
              ref={searchRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setCategoriesOpen(false);
                  setShopOpen(false);
                  setAccountOpen(false);
                }}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center text-neutral-900 transition-transform duration-200 hover:scale-105"
              >
                <Icon
                  icon="solar:magnifer-linear"
                  className="text-[27px]"
                />
              </button>

              {/* SEARCH BOX */}

              {searchOpen && (
                <div className="absolute right-0 top-[52px] w-[340px] border border-neutral-200 bg-white p-3 shadow-[0_15px_40px_rgba(0,0,0,0.10)]">

                  <form
                    onSubmit={handleSearch}
                    className="flex items-center border border-neutral-300"
                  >
                    <Icon
                      icon="solar:magnifer-linear"
                      className="ml-3 shrink-0 text-[19px] text-neutral-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                      placeholder="Search products..."
                      className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-neutral-400"
                    />

                    <button
                      type="submit"
                      className="mr-1 bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                      Search
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* =================================================
                WISHLIST
            ================================================= */}

            <Link
              href="/wishlist"
              onClick={closeDropdowns}
              aria-label="Wishlist"
              className="transition-transform duration-200 hover:scale-105"
            >
              <Icon
                icon="solar:heart-linear"
                className="text-[27px]"
              />
            </Link>

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((prev) => !prev);
                  setCategoriesOpen(false);
                  setShopOpen(false);
                  setSearchOpen(false);
                }}
                aria-label="Account"
                aria-expanded={accountOpen}
                className="flex items-center gap-1.5"
              >
                {/* INITIALS */}

                <span
                  className={`
                    flex h-9 w-9 items-center justify-center
                    rounded-full
                    border
                    text-[11px]
                    font-semibold
                    tracking-wide
                    transition-all
                    duration-200
                    ${
                      accountOpen
                        ? "border-black bg-black text-white"
                        : "border-neutral-800 bg-white text-black hover:bg-black hover:text-white"
                    }
                  `}
                >
                  {userInitials}
                </span>

                <Icon
                  icon="solar:alt-arrow-down-linear"
                  className={`text-[15px] transition-transform duration-200 ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* =================================================
                  ACCOUNT DROPDOWN
              ================================================= */}

              {accountOpen && (
                <div className="absolute right-0 top-[52px] w-[270px] overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.12)]">

                  {/* USER INFO */}

                  <div className="border-b border-neutral-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                        {userInitials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {userName}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-400">
                          My Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MY PROFILE */}

                  <Link
                    href="/account"
                    onClick={closeDropdowns}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                  >
                    <Icon
                      icon="solar:user-linear"
                      className="text-[20px]"
                    />

                    <span>My Profile</span>
                  </Link>

                  {/* MY ORDERS */}

                  <Link
                    href="/orders"
                    onClick={closeDropdowns}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                  >
                    <Icon
                      icon="solar:box-linear"
                      className="text-[20px]"
                    />

                    <span>My Orders</span>
                  </Link>

                  {/* WISHLIST */}

                  <Link
                    href="/wishlist"
                    onClick={closeDropdowns}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
                  >
                    <Icon
                      icon="solar:heart-linear"
                      className="text-[20px]"
                    />

                    <span>Wishlist</span>
                  </Link>

                  {/* LOGOUT */}

                  <div className="border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Icon
                        icon="solar:logout-2-linear"
                        className="text-[20px]"
                      />

                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                CART
                NO COUNT BADGE
            ================================================= */}

            <Link
              href="/cart"
              onClick={closeDropdowns}
              aria-label="Shopping Bag"
              className="transition-transform duration-200 hover:scale-105"
            >
              <Icon
                icon="solar:bag-4-linear"
                className="text-[27px]"
              />
            </Link>
          </div>

          {/* ===================================================
              MOBILE MENU BUTTON
          ==================================================== */}

          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              closeDropdowns();
            }}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center xl:hidden"
          >
            {mobileOpen ? (
              <Icon
                icon="solar:close-circle-linear"
                className="text-[30px]"
              />
            ) : (
              <Icon
                icon="solar:hamburger-menu-linear"
                className="text-[30px]"
              />
            )}
          </button>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}

        {mobileOpen && (
          <div className="border-t border-neutral-200 bg-white xl:hidden">

            <div className="px-5 py-5">

              {/* MOBILE SEARCH */}

              <form
                onSubmit={handleSearch}
                className="mb-5 flex items-center border border-neutral-300"
              >
                <Icon
                  icon="solar:magnifer-linear"
                  className="ml-3 shrink-0 text-[19px] text-neutral-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="mr-1 bg-black px-4 py-2 text-xs font-medium text-white"
                >
                  Search
                </button>
              </form>

              {/* HOME */}

              <Link
                href="/"
                onClick={closeMobile}
                className="block border-b border-neutral-100 py-4 text-[15px] font-medium"
              >
                Home
              </Link>

              {/* CATEGORIES */}

              <details className="border-b border-neutral-100">
                <summary className="cursor-pointer list-none py-4 text-[15px] font-medium">
                  <div className="flex items-center justify-between">
                    <span>Categories</span>

                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className="text-[17px]"
                    />
                  </div>
                </summary>

                <div className="pb-3 pl-3">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={closeMobile}
                      className="block py-2.5 text-sm text-neutral-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </details>

              {/* SHOP */}

              <details className="border-b border-neutral-100">
                <summary className="cursor-pointer list-none py-4 text-[15px] font-medium">
                  <div className="flex items-center justify-between">
                    <span>Shop</span>

                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className="text-[17px]"
                    />
                  </div>
                </summary>

                <div className="pb-3 pl-3">
                  {shopLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-2.5 text-sm text-neutral-600"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </details>

              {/* NEW ARRIVALS */}

              <Link
                href="/new-arrivals"
                onClick={closeMobile}
                className="block border-b border-neutral-100 py-4 text-[15px] font-medium"
              >
                New Arrivals
              </Link>

              {/* ABOUT */}

              <Link
                href="/about"
                onClick={closeMobile}
                className="block border-b border-neutral-100 py-4 text-[15px] font-medium"
              >
                About
              </Link>

              {/* CONTACT */}

              <Link
                href="/contact"
                onClick={closeMobile}
                className="block border-b border-neutral-100 py-4 text-[15px] font-medium"
              >
                Contact
              </Link>

              {/* =================================================
                  MOBILE ACCOUNT
              ================================================= */}

              <div className="mt-5 border-t border-neutral-200 pt-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                      {userInitials}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {userName}
                      </p>

                      <p className="text-xs text-neutral-400">
                        My Account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">

                    <Link
                      href="/wishlist"
                      onClick={closeMobile}
                      aria-label="Wishlist"
                    >
                      <Icon
                        icon="solar:heart-linear"
                        className="text-[23px]"
                      />
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeMobile}
                      aria-label="Cart"
                    >
                      <Icon
                        icon="solar:bag-4-linear"
                        className="text-[23px]"
                      />
                    </Link>
                  </div>
                </div>

                {/* ACCOUNT LINKS */}

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <Link
                    href="/account"
                    onClick={closeMobile}
                    className="border border-neutral-200 px-4 py-3 text-center text-xs font-medium"
                  >
                    My Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMobile}
                    className="border border-neutral-200 px-4 py-3 text-center text-xs font-medium"
                  >
                    My Orders
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="col-span-2 border border-red-100 px-4 py-3 text-xs font-medium text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}