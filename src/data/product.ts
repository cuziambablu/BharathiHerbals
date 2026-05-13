export interface ProductVariant {
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  variants: ProductVariant[];
  images: string[];
  ingredients: string[];
  benefits: string[];
  howToUse: string[];
  hairTypes: string[];
  storage: string[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  badge?: string;
}

export const productData = {
  name: "BHARATHI Herbal Hair Oil",
  price: "₹199",
  mainTagline: "Ancient Herbs. Modern Hair Revival.",
  finalTagline: "ROOTED IN NATURE. POWERED BY HERBS.",
  ingredients: [
    "Castor Oil",
    "Amla Oil",
    "Coconut Oil",
    "Almond Oil",
    "Rosemary",
    "Curry Leaves",
    "Methi",
    "Cloves",
  ],
  benefits: [
    "Controls Hair Fall",
    "Promotes Hair Growth",
    "Deep Root Nourishment",
    "Strengthens Hair Naturally",
    "100% Natural Ingredients",
    "Chemical-Free Formula",
    "Reduces Breakage",
    "Adds Shine & Thickness",
  ],
  sections: [
    "ROOT STRENGTH BEGINS HERE",
    "INFUSED WITH 8 POWERFUL HERBS",
    "100% NATURAL HAIR THERAPY",
    "FROM ROOT TO RADIANCE",
  ],
};

export const heroProduct: Product = {
  id: "bharathi-herbal-oil",
  name: "BHARATHI Herbal Hair Oil",
  slug: "bharathi-herbal-oil",
  tagline: "Ancient Herbs. Modern Hair Revival.",
  description:
    "A luxurious blend of 8 potent Ayurvedic herbs, cold-pressed and slow-cooked to deliver deep root nourishment. BHARATHI Herbal Hair Oil strengthens from root to tip, reduces hair fall, and restores natural shine — all with zero chemicals.",
  category: "Hair Oil",
  variants: [
    { size: "100ml", price: 199, originalPrice: 399, stock: 124, sku: "BHO-100" },
  ],
  images: [
    "/images/bharathi-oil.png",
    "/images/bharathi-oil.png",
    "/images/bharathi-oil.png",
    "/images/bharathi-oil.png",
  ],
  ingredients: [
    "Castor Oil",
    "Amla Oil",
    "Coconut Oil",
    "Almond Oil",
    "Rosemary",
    "Curry Leaves",
    "Methi",
    "Cloves",
  ],
  benefits: [
    "Controls Hair Fall",
    "Promotes Hair Growth",
    "Deep Root Nourishment",
    "Strengthens Hair Naturally",
    "100% Natural Ingredients",
    "Chemical-Free Formula",
    "Reduces Breakage",
    "Adds Shine & Thickness",
  ],
  howToUse: [
    "Take a generous amount of oil in your palms.",
    "Gently massage into scalp using circular motions for 5–10 minutes.",
    "Apply remaining oil along the length of hair, focusing on tips.",
    "Leave for at least 1 hour or overnight for best results.",
    "Wash off with a mild herbal shampoo.",
    "Use 2–3 times per week for optimal results.",
  ],
  hairTypes: [
    "Straight Hair",
    "Wavy Hair",
    "Curly Hair",
    "Coily Hair",
    "Fine & Thin Hair",
    "Thick & Dense Hair",
    "Color-Treated Hair",
    "All Hair Types",
  ],
  storage: [
    "Store in a cool, dry place away from direct sunlight.",
    "Keep the cap tightly closed after each use.",
    "Best used within 12 months of opening.",
    "Do not refrigerate.",
  ],
  reviews: [
    {
      id: "r1",
      name: "Priya Sharma",
      rating: 5,
      date: "2026-04-15",
      text: "My hair fall has reduced by 70% in just 3 weeks. The oil smells divine and doesn't feel greasy at all. Best purchase I've made!",
      verified: true,
    },
    {
      id: "r2",
      name: "Ananya Reddy",
      rating: 5,
      date: "2026-04-02",
      text: "I've tried dozens of hair oils. This is genuinely the first one that made a visible difference. My hair is thicker and shinier.",
      verified: true,
    },
    {
      id: "r3",
      name: "Meera Patel",
      rating: 4,
      date: "2026-03-28",
      text: "Lovely herbal fragrance and my hair feels so much stronger. Only wish the 100ml bottle was bigger for the price. Will buy more next!",
      verified: true,
    },
  ],
  rating: 4.8,
  reviewCount: 2847,
  badge: "Bestseller",
};

export const bestSellers: Product[] = [
  heroProduct,
];

export const faqData = [
  {
    q: "How often should I use BHARATHI Herbal Hair Oil?",
    a: "For best results, apply 2–3 times per week. Leave it on for at least 1 hour or overnight before washing with a mild shampoo.",
  },
  {
    q: "Is this oil suitable for all hair types?",
    a: "Yes! BHARATHI Herbal Hair Oil is formulated for all hair types — straight, wavy, curly, coily, fine, or thick.",
  },
  {
    q: "Are there any chemicals or artificial ingredients?",
    a: "Absolutely not. Our oil is 100% natural, chemical-free, paraben-free, and sulfate-free. Only pure herbal ingredients.",
  },
  {
    q: "When will I see results?",
    a: "Most customers notice reduced hair fall within 2–3 weeks of regular use. Significant improvements in thickness and shine are typically visible within 6–8 weeks.",
  },
  {
    q: "Can I use this oil on color-treated hair?",
    a: "Yes, our herbal formula is gentle enough for color-treated hair and will not strip or fade your color.",
  },
];

export const trustBadges = [
  { icon: "🌿", title: "100% Natural", desc: "Pure herbal ingredients only" },
  { icon: "🚫", title: "Chemical Free", desc: "Zero parabens & sulfates" },
  { icon: "💪", title: "Hair Fall Control", desc: "Clinically observed results" },
  { icon: "🕉️", title: "Ayurvedic Formula", desc: "Ancient wisdom, modern science" },
  { icon: "⭐", title: "Premium Quality", desc: "Cold-pressed & slow-cooked" },
];
