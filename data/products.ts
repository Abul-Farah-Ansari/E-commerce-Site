export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Oversized Shirt",
    slug: "classic-oversized-shirt",
    category: "men",
    price: 1499,
    oldPrice: 1999,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    description:
      "A relaxed oversized shirt designed for effortless everyday style.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Beige"],
    featured: true,
  },

  {
    id: 2,
    name: "Minimal Women's Jacket",
    slug: "minimal-womens-jacket",
    category: "women",
    price: 2499,
    oldPrice: 3299,
    discount: 24,
    image:
      "https://images.unsplash.com/photo-1548624313-0396c75ce9b1?auto=format&fit=crop&w=900&q=85",
    description:
      "A clean and sophisticated jacket made for modern everyday looks.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Cream"],
    featured: true,
  },

  {
    id: 3,
    name: "Urban Classic Sneakers",
    slug: "urban-classic-sneakers",
    category: "shoes",
    price: 2999,
    oldPrice: 3999,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    description:
      "Minimal everyday sneakers combining comfort with modern street style.",
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["White", "Black"],
    featured: true,
  },

  {
    id: 4,
    name: "Minimal Classic Watch",
    slug: "minimal-classic-watch",
    category: "accessories",
    price: 1999,
    oldPrice: 2799,
    discount: 29,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    description:
      "A timeless minimalist watch designed to complement any outfit.",
    colors: ["Black", "Silver"],
    featured: true,
  },

  {
    id: 5,
    name: "Relaxed Linen Shirt",
    slug: "relaxed-linen-shirt",
    category: "men",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85",
    description:
      "Lightweight linen shirt perfect for relaxed and comfortable styling.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Beige"],
    isNew: true,
  },

  {
    id: 6,
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    category: "women",
    price: 2799,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
    description:
      "A versatile denim jacket that works effortlessly across seasons.",
    sizes: ["S", "M", "L"],
    colors: ["Blue", "Black"],
    isNew: true,
  },

  {
    id: 7,
    name: "Everyday Canvas Shoes",
    slug: "everyday-canvas-shoes",
    category: "shoes",
    price: 2299,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85",
    description:
      "Comfortable canvas shoes designed for everyday movement.",
    sizes: ["7", "8", "9", "10"],
    colors: ["White", "Black", "Green"],
    isNew: true,
  },

  {
    id: 8,
    name: "Premium Leather Bag",
    slug: "premium-leather-bag",
    category: "accessories",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description:
      "A premium everyday leather bag with a clean and timeless design.",
    colors: ["Black", "Brown"],
    isNew: true,
  },
];