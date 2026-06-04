"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Heart,
  Menu,
  Package,
  Palette,
  RefreshCcw,
  Ruler,
  Scissors,
  Search,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  SwatchBook,
  Truck,
  Users,
  Wand2,
  X,
} from "lucide-react";

type CommerceMode = "all" | "buy" | "mto" | "rent" | "subscribe" | "resale";
type SortKey = "recommended" | "newest" | "priceLow" | "priceHigh" | "fit" | "groupReady";

type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  rentalPrice: number;
  resalePrice: number;
  colorCount: number;
  image: string;
  hoverImage: string;
  tag: string;
  fabric: string;
  colorFamily: string;
  silhouette: string;
  neckline: string;
  rating: number;
  reviews: number;
  shipsNow: boolean;
  groupReady: boolean;
  recommendedSize: string;
  fitConfidence: "High" | "Medium" | "Low";
  colorMatch: "High" | "Medium" | "Low";
  modestyMatch: "High" | "Good" | "Medium" | "Low";
  bodyShapeGuidance: string;
  modules: CommerceMode[];
};

const products: Product[] = [
  {
    id: "1",
    name: "Mira Chiffon Dress",
    subtitle: "Sage · V-neck · A-line",
    price: 99,
    rentalPrice: 42,
    resalePrice: 68,
    colorCount: 78,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
    tag: "Ships ASAP",
    fabric: "Chiffon",
    colorFamily: "Green",
    silhouette: "A-Line",
    neckline: "V-Neck",
    rating: 4.8,
    reviews: 1042,
    shipsNow: true,
    groupReady: true,
    recommendedSize: "M",
    fitConfidence: "High",
    colorMatch: "High",
    modestyMatch: "Good",
    bodyShapeGuidance: "A-line recommended",
    modules: ["buy", "rent", "subscribe", "resale"],
  },
  {
    id: "2",
    name: "Azra Bondi Ruffled Chiffon Dress",
    subtitle: "Sky Blue · Ruffled · Floor length",
    price: 99,
    rentalPrice: 44,
    resalePrice: 70,
    colorCount: 72,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
    tag: "Group ready",
    fabric: "Chiffon",
    colorFamily: "Blue",
    silhouette: "A-Line",
    neckline: "V-Neck",
    rating: 4.7,
    reviews: 684,
    shipsNow: true,
    groupReady: true,
    recommendedSize: "A8",
    fitConfidence: "High",
    colorMatch: "High",
    modestyMatch: "Good",
    bodyShapeGuidance: "Balanced and pear friendly",
    modules: ["buy", "mto", "rent", "subscribe", "resale"],
  },
  {
    id: "3",
    name: "Sorrel Stretch Satin Dress",
    subtitle: "Ganache · Strapless · Fitted",
    price: 149,
    rentalPrice: 58,
    resalePrice: 96,
    colorCount: 46,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
    tag: "Rentable",
    fabric: "Stretch Satin",
    colorFamily: "Brown",
    silhouette: "Mermaid",
    neckline: "Strapless",
    rating: 4.6,
    reviews: 225,
    shipsNow: true,
    groupReady: true,
    recommendedSize: "A10",
    fitConfidence: "Medium",
    colorMatch: "Medium",
    modestyMatch: "Medium",
    bodyShapeGuidance: "Best for hourglass shapes",
    modules: ["buy", "rent", "resale"],
  },
  {
    id: "4",
    name: "Debra Convertible Chiffon Dress",
    subtitle: "Champagne · Convertible · Pockets",
    price: 119,
    rentalPrice: 39,
    resalePrice: 70,
    colorCount: 84,
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=900&auto=format&fit=crop",
    tag: "All flows",
    fabric: "Chiffon",
    colorFamily: "Neutral",
    silhouette: "A-Line",
    neckline: "Convertible",
    rating: 4.9,
    reviews: 312,
    shipsNow: true,
    groupReady: true,
    recommendedSize: "A8",
    fitConfidence: "High",
    colorMatch: "High",
    modestyMatch: "High",
    bodyShapeGuidance: "Flexible neckline coverage",
    modules: ["buy", "mto", "rent", "subscribe", "resale"],
  },
  {
    id: "5",
    name: "Nora Soft Crepe Dress",
    subtitle: "Rosewood · Square neck · Column",
    price: 139,
    rentalPrice: 51,
    resalePrice: 88,
    colorCount: 38,
    image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
    tag: "New arrival",
    fabric: "Crepe",
    colorFamily: "Pink",
    silhouette: "Sheath",
    neckline: "Square Neck",
    rating: 4.5,
    reviews: 91,
    shipsNow: false,
    groupReady: false,
    recommendedSize: "M",
    fitConfidence: "Medium",
    colorMatch: "High",
    modestyMatch: "Good",
    bodyShapeGuidance: "Clean neckline, fitted body",
    modules: ["buy", "mto", "subscribe"],
  },
  {
    id: "6",
    name: "Valentine Floral Burnout Dress",
    subtitle: "Olive Floral · Midi · Sweetheart",
    price: 129,
    rentalPrice: 49,
    resalePrice: 82,
    colorCount: 18,
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
    tag: "Garden edit",
    fabric: "Floral Burnout",
    colorFamily: "Floral",
    silhouette: "A-Line",
    neckline: "Sweetheart",
    rating: 4.4,
    reviews: 34,
    shipsNow: true,
    groupReady: false,
    recommendedSize: "S",
    fitConfidence: "High",
    colorMatch: "High",
    modestyMatch: "Good",
    bodyShapeGuidance: "Garden wedding friendly",
    modules: ["buy", "resale"],
  },
];

const colorStories = [
  ["All", "linear-gradient(135deg,#9ba88f,#8eb9d6,#d7a0a6)"],
  ["Green", "#7f8f69"],
  ["Blue", "#8eb9d6"],
  ["Pink", "#d7a0a6"],
  ["Neutral", "#d6c4aa"],
  ["Red", "#9d2f36"],
  ["Brown", "#7a4f3c"],
  ["Black", "#111111"],
  ["Floral", "linear-gradient(135deg,#c69091,#9ba88f,#d8c4a2)"],
];

const filters = [
  { title: "Availability", values: ["Ships ASAP", "Ready to Ship", "Group Ready", "Under $100", "New Arrivals"] },
  { title: "Commerce", values: ["Buy", "Made-to-order", "Rent", "Subscribe", "Resale"] },
  { title: "Fabric", values: ["Chiffon", "Matte Satin", "Stretch Satin", "Crepe", "Velvet", "Floral Burnout"] },
  { title: "Silhouette", values: ["A-Line", "Mermaid", "Column", "Sheath", "Convertible"] },
  { title: "Neckline", values: ["V-Neck", "Strapless", "Square Neck", "Sweetheart", "One Shoulder", "Convertible"] },
  { title: "Fit Confidence", values: ["High", "Medium", "Low"] },
  { title: "Style Match", values: ["Color Match High", "Modesty Good", "Body Shape Recommended"] },
];

export default function ShahsiBridesmaidCollectionPage() {
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedColor, setSelectedColor] = useState("All");
  const [mode, setMode] = useState<CommerceMode>("all");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [quickView, setQuickView] = useState<Product | null>(null);

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => {
      const colorMatch = selectedColor === "All" || product.colorFamily === selectedColor;
      const modeMatch = mode === "all" || product.modules.includes(mode);
      return colorMatch && modeMatch;
    });

    if (sort === "priceLow") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "fit") result = [...result].sort((a, b) => fitScore(b.fitConfidence) - fitScore(a.fitConfidence));
    if (sort === "groupReady") result = [...result].sort((a, b) => Number(b.groupReady) - Number(a.groupReady));
    if (sort === "newest") result = [...result].reverse();

    return result;
  }, [selectedColor, mode, sort]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />
      <CollectionHero />

      <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        <QuickCategoryTiles />
        <ColorStory value={selectedColor} onChange={setSelectedColor} />
        <CommerceTabs value={mode} onChange={setMode} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[286px_1fr]">
          <aside className="hidden lg:block">
            <FilterSidebar />
          </aside>

          <section>
            <Toolbar
              count={visibleProducts.length}
              sort={sort}
              setSort={setSort}
              openFilters={() => setMobileFilters(true)}
            />
            <ProductGrid products={visibleProducts} onQuickView={setQuickView} />
          </section>
        </div>
      </section>

      <BridalPartyBand />
      <IntelligenceBand />
      <ModuleOwnership />

      {mobileFilters && <MobileFilters onClose={() => setMobileFilters(false)} />}
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Get 10 free swatches for bridal parties</span>
        <span>Ships-now dresses available</span>
        <span>Fit + style intelligence on every dress</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <button className="rounded-full border border-neutral-300 p-3 lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Gownloop fashion system</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Bridesmaid Dresses</a>
          <a>Free Swatches</a>
          <a>Wedding Guest</a>
          <a>Gownloop</a>
          <a>Resale</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="hidden rounded-full border border-neutral-950 px-5 py-3 text-sm font-medium md:block">Sign in</button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Create party</button>
        </div>
      </div>
    </header>
  );
}

function CollectionHero() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
      <div className="overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white shadow-sm">
        <div className="grid min-h-[520px] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="flex flex-col justify-center p-6 md:p-12 lg:p-14">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Bridesmaid dresses</p>
            <h1 className="mt-5 text-5xl font-medium leading-[0.96] tracking-tight md:text-7xl">Shop the bridal party edit.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 md:text-lg">
              Discover dresses by color, fabric, fit confidence, group readiness, and commerce flow — buy, made-to-order, rent, subscribe, or verified resale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Shop all dresses <ArrowRight className="h-4 w-4" /></button>
              <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Use fit profile</button>
            </div>
          </div>
          <div className="relative min-h-[420px]">
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" alt="Bridesmaid collection" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-neutral-950/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
              <HeroMetric icon={<Sparkles className="h-4 w-4" />} title="Smart Fit" copy="Size confidence" />
              <HeroMetric icon={<Palette className="h-4 w-4" />} title="Style Match" copy="Palette guidance" />
              <HeroMetric icon={<Users className="h-4 w-4" />} title="Group Ready" copy="Shared order flow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur"><div className="mb-1 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm text-neutral-600">{copy}</p></div>;
}

function QuickCategoryTiles() {
  const tiles = [
    ["Ready to Ship", "Fast timelines", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop"],
    ["Under $100", "Budget-friendly bridal", "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop"],
    ["Best Sellers", "Group-approved favorites", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop"],
    ["Plus Size", "Fit confidence included", "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop"],
  ];
  return <div className="grid gap-4 md:grid-cols-4">{tiles.map(([title, copy, image]) => <article key={title} className="group relative min-h-[260px] overflow-hidden rounded-[2rem] bg-neutral-100"><img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" /><div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white"><h3 className="text-2xl font-medium">{title}</h3><p className="mt-1 text-sm text-white/80">{copy}</p></div></article>)}</div>;
}

function ColorStory({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Shop by color</p><h2 className="mt-2 text-3xl font-medium tracking-tight">Build the palette before the order.</h2></div>
        <button className="hidden items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] md:inline-flex"><SwatchBook className="h-4 w-4" /> Free swatches</button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {colorStories.map(([name, background]) => <button key={name} onClick={() => onChange(String(name))} className={`rounded-[1.5rem] border bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 ${value === name ? "border-neutral-950" : "border-neutral-200"}`}><span className="mx-auto block h-12 w-12 rounded-full border border-neutral-200" style={{ background: String(background) }} /><span className="mt-3 block text-sm font-medium">{name}</span></button>)}
      </div>
    </section>
  );
}

function CommerceTabs({ value, onChange }: { value: CommerceMode; onChange: (value: CommerceMode) => void }) {
  const tabs: Array<[CommerceMode, React.ReactNode, string]> = [["all", <BadgeCheck className="h-4 w-4" />, "All"], ["buy", <ShoppingBag className="h-4 w-4" />, "Buy"], ["mto", <Scissors className="h-4 w-4" />, "MTO"], ["rent", <Package className="h-4 w-4" />, "Rent"], ["subscribe", <RefreshCcw className="h-4 w-4" />, "Subscribe"], ["resale", <Shirt className="h-4 w-4" />, "Resale"]];
  return <div className="mt-8 rounded-[1.5rem] bg-white p-2 shadow-sm ring-1 ring-neutral-200"><div className="grid grid-cols-3 gap-2 md:grid-cols-6">{tabs.map(([id, icon, label]) => <button key={id} onClick={() => onChange(id)} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${value === id ? "bg-neutral-950 text-white" : "hover:bg-neutral-100"}`}>{icon}{label}</button>)}</div></div>;
}

function FilterSidebar() {
  return <div className="sticky top-28 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200"><div className="mb-5 flex items-center justify-between"><h2 className="font-medium">Filters</h2><button className="text-sm underline underline-offset-4">Clear</button></div><label className="mb-5 flex items-center gap-3 rounded-2xl border border-neutral-200 p-4 text-sm font-medium"><input type="checkbox" className="h-4 w-4" />Ships ASAP</label><div className="space-y-5">{filters.map((group) => <FilterGroup key={group.title} title={group.title} values={group.values} />)}</div></div>;
}

function FilterGroup({ title, values }: { title: string; values: string[] }) {
  const [open, setOpen] = useState(true);
  return <div className="border-t border-neutral-200 pt-4"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left font-medium">{title}<ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /></button>{open && <div className="mt-3 space-y-2">{values.map((value) => <label key={value} className="flex items-center gap-3 text-sm text-neutral-700"><input type="checkbox" className="h-4 w-4" />{value}</label>)}</div>}</div>;
}

function Toolbar({ count, sort, setSort, openFilters }: { count: number; sort: SortKey; setSort: (sort: SortKey) => void; openFilters: () => void }) {
  return <div className="mb-5 flex flex-col justify-between gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200 md:flex-row md:items-center"><div><h2 className="text-2xl font-medium">Bridesmaid Dresses</h2><p className="mt-1 text-sm text-neutral-600">{count} styles · ranked by fit, style, availability, and group readiness</p></div><div className="flex items-center gap-3"><button onClick={openFilters} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-3 text-sm font-medium lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium"><option value="recommended">Recommended</option><option value="newest">Newest</option><option value="priceLow">Price: Low to High</option><option value="priceHigh">Price: High to Low</option><option value="fit">Best Fit</option><option value="groupReady">Group Ready</option></select></div></div>;
}

function ProductGrid({ products, onQuickView }: { products: Product[]; onQuickView: (product: Product) => void }) {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} onQuickView={() => onQuickView(product)} />)}</div>;
}

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: () => void }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-neutral-200">
      <div className="relative overflow-hidden bg-neutral-100">
        <img src={product.image} alt={product.name} className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:hidden" />
        <img src={product.hoverImage} alt={`${product.name} hover`} className="hidden aspect-[3/4] w-full object-cover transition duration-700 group-hover:block" />
        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
        <div className="absolute left-3 top-3 flex flex-col gap-2"><Badge>{product.tag}</Badge>{product.groupReady && <Badge>Group ready</Badge>}</div>
        <button onClick={onQuickView} className="absolute bottom-3 left-3 right-3 rounded-full bg-white/95 py-3 text-sm font-semibold uppercase tracking-[0.14em] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">Quick view</button>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between"><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">+{product.colorCount} colors</p><div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />{product.rating}</div></div>
        <h3 className="min-h-[48px] font-medium leading-6">{product.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{product.subtitle}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><Metric label="Fit" value={product.fitConfidence} tone={product.fitConfidence === "High" ? "success" : product.fitConfidence === "Low" ? "warning" : "neutral"} /><Metric label="Size" value={product.recommendedSize} /><Metric label="Style" value={product.colorMatch} tone={product.colorMatch === "High" ? "success" : "neutral"} /></div>
        <div className="mt-4 rounded-2xl bg-[#f7f2ea] p-3 text-sm text-neutral-700"><p><strong>Style:</strong> {product.bodyShapeGuidance}</p><p className="mt-1"><strong>Modesty:</strong> {product.modestyMatch}</p></div>
        <div className="mt-4 flex flex-wrap gap-1.5">{product.modules.map((module) => <ModulePill key={module} module={module} />)}</div>
        <div className="mt-4 flex items-end justify-between"><div><p className="font-semibold">${product.price}</p><p className="text-xs text-neutral-500">Rent ${product.rentalPrice} · Resale ${product.resalePrice}</p></div><button className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">View</button></div>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">{children}</span>; }
function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "success" | "warning" | "neutral" }) { const toneClass = tone === "success" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-neutral-950"; return <div className="rounded-xl bg-[#f7f2ea] p-2"><p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className={`font-semibold ${toneClass}`}>{value}</p></div>; }
function ModulePill({ module }: { module: CommerceMode }) { const labels: Record<CommerceMode, string> = { all: "All", buy: "Buy", mto: "MTO", rent: "Rent", subscribe: "Sub", resale: "Resale" }; return <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-neutral-600">{labels[module]}</span>; }

function BridalPartyBand() { return <section className="bg-[#f7f2ea] py-14"><div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"><div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Bridal Party Dashboard</p><h2 className="mt-3 text-4xl font-medium tracking-tight">Turn collection browsing into group ordering.</h2><p className="mt-4 leading-7 text-neutral-600">Assign products directly from the collection page, track member size status, approval, and payment readiness.</p><button className="mt-8 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Create bridal party</button></div><div className="grid gap-3 sm:grid-cols-2">{[["Maya", "Size complete", "Dress selected", "Payment pending"], ["Aisha", "Invite accepted", "Needs size", "Not started"], ["Sofia", "Size complete", "Needs approval", "Not started"], ["Lina", "Size complete", "Dress selected", "Paid"]].map(([name, s1, s2, s3]) => <div key={name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200"><div className="mb-3 flex items-center justify-between"><h3 className="font-medium">{name}</h3><Users className="h-4 w-4" /></div><p className="text-sm text-neutral-600">{s1}</p><p className="text-sm text-neutral-600">{s2}</p><p className="mt-1 text-sm font-medium">{s3}</p></div>)}</div></div></section>; }
function IntelligenceBand() { return <section className="bg-neutral-950 py-14 text-white"><div className="mx-auto grid max-w-[1500px] gap-4 px-4 lg:grid-cols-3 lg:px-8"><DarkCard icon={<Ruler className="h-5 w-5" />} title="Fit Engine" copy="Size recommendation, bust/waist/hip fit, length warning, confidence." /><DarkCard icon={<Palette className="h-5 w-5" />} title="Style Engine" copy="Color match, modesty match, skin tone, and body-shape guidance." /><DarkCard icon={<Wand2 className="h-5 w-5" />} title="Recommendation Engine" copy="Ranks styles using fit, style, availability, feedback, and commerce flow." /></div></section>; }
function DarkCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="rounded-[1.5rem] border border-white/15 p-6"><div className="mb-4 flex items-center gap-2">{icon}<h3 className="text-xl font-medium">{title}</h3></div><p className="leading-7 text-white/70">{copy}</p></div>; }

function ModuleOwnership() { const items = [["Catalog", "Product cards, images, variants, colors, fabric, measurements"], ["Retail", "Buy flow and collection pricing"], ["Made-to-order", "MTO filter and production-ready styles"], ["Rental", "Rental availability, event readiness, backup sizing"], ["Subscription", "Gownloop eligibility and personalization"], ["Resale", "Verified resale pricing and garment data quality"], ["Fit Engine", "Recommended size and fit confidence"], ["Style Engine", "Color, modesty, and body-shape match"], ["Recommendation Engine", "Sort/rank by fit, style, availability, feedback"], ["Bridal Party", "Assign items and track group readiness"], ["Orders", "Add to bag, quick view, checkout handoff"], ["Returns Feedback", "Review/return signals for future ranking"]]; return <section className="bg-white py-14"><div className="mx-auto max-w-[1500px] px-4 lg:px-8"><div className="mb-8"><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Modular Monolith Mapping</p><h2 className="mt-3 text-4xl font-medium tracking-tight">Collection page module ownership.</h2></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{items.map(([title, copy]) => <div key={title} className="rounded-2xl bg-[#fbfaf6] p-4"><div className="mb-2 flex items-center gap-2"><BadgeCheck className="h-4 w-4" /><h3 className="font-medium">{title}</h3></div><p className="text-sm leading-6 text-neutral-600">{copy}</p></div>)}</div></div></section>; }

function MobileFilters({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-50 bg-neutral-950/40 lg:hidden"><div className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-[2rem] bg-white p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-medium">Filters</h2><button onClick={onClose} className="rounded-full border border-neutral-300 p-2"><X className="h-4 w-4" /></button></div><FilterSidebar /></div></div>; }

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) { return <div className="fixed inset-0 z-50 bg-neutral-950/50 p-4 backdrop-blur-sm"><div className="mx-auto mt-8 grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl md:grid-cols-[0.9fr_1.1fr]"><img src={product.image} alt={product.name} className="h-full min-h-[520px] w-full object-cover" /><div className="p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Quick View</p><h2 className="mt-3 text-3xl font-medium tracking-tight">{product.name}</h2><p className="mt-2 text-neutral-600">{product.subtitle} · +{product.colorCount} colors</p></div><button onClick={onClose} className="rounded-full border border-neutral-300 p-2"><X className="h-4 w-4" /></button></div><div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm"><Metric label="Fit" value={product.fitConfidence} tone={product.fitConfidence === "High" ? "success" : product.fitConfidence === "Low" ? "warning" : "neutral"} /><Metric label="Size" value={product.recommendedSize} /><Metric label="Style" value={product.colorMatch} tone={product.colorMatch === "High" ? "success" : "neutral"} /></div><div className="mt-6 rounded-2xl bg-[#f7f2ea] p-4"><div className="mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4" /><p className="font-medium">Final Recommendation</p></div><p className="text-sm leading-6 text-neutral-700">Recommended size {product.recommendedSize}. Fit confidence is {product.fitConfidence}. {product.bodyShapeGuidance}.</p></div><div className="mt-6 flex gap-3"><button className="flex-1 rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">View product</button><button className="flex-1 rounded-full border border-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em]">Add to party</button></div></div></div></div>; }

function fitScore(fit: Product["fitConfidence"]) { if (fit === "High") return 3; if (fit === "Medium") return 2; return 1; }
