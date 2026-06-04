"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Heart,
  Info,
  MapPin,
  Package,
  Palette,
  Ruler,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wand2,
} from "lucide-react";

type Condition = "new" | "excellent" | "good" | "fair";
type FitConfidence = "High" | "Medium" | "Low";
type SortKey = "matched" | "newest" | "priceLow" | "priceHigh" | "confidence";
type FilterKey = "all" | "verified" | "highFit" | "under100" | "shipsFast";

type Listing = {
  id: string;
  title: string;
  brand: string;
  color: string;
  size: string;
  price: number;
  originalPrice: number;
  condition: Condition;
  conditionScore: number;
  fitConfidence: FitConfidence;
  verified: boolean;
  shipsFrom: string;
  seller: {
    name: string;
    rating: number;
    sales: number;
    verified: boolean;
  };
  measurements: {
    bust?: number;
    waist?: number;
    hip?: number;
    length?: number;
  };
  missingData: string[];
  image: string;
  aiMatch: number;
};

const listings: Listing[] = [
  {
    id: "r1",
    title: "Mira Chiffon Dress",
    brand: "Shahsi",
    color: "Sage",
    size: "M",
    price: 68,
    originalPrice: 99,
    condition: "excellent",
    conditionScore: 94,
    fitConfidence: "High",
    verified: true,
    shipsFrom: "New York, NY",
    seller: { name: "Maya R.", rating: 4.9, sales: 18, verified: true },
    measurements: { bust: 38, waist: 30.5, hip: 42, length: 61 },
    missingData: [],
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    aiMatch: 96,
  },
  {
    id: "r2",
    title: "Sorrel Stretch Satin Dress",
    brand: "Shahsi",
    color: "Ganache",
    size: "A10",
    price: 84,
    originalPrice: 149,
    condition: "good",
    conditionScore: 82,
    fitConfidence: "Medium",
    verified: true,
    shipsFrom: "Austin, TX",
    seller: { name: "Sofia K.", rating: 4.7, sales: 9, verified: true },
    measurements: { bust: 39, waist: 31, length: 62 },
    missingData: ["Hip measurement"],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
    aiMatch: 78,
  },
  {
    id: "r3",
    title: "Debra Convertible Chiffon Dress",
    brand: "Shahsi",
    color: "Champagne",
    size: "A6",
    price: 70,
    originalPrice: 119,
    condition: "excellent",
    conditionScore: 91,
    fitConfidence: "High",
    verified: true,
    shipsFrom: "Los Angeles, CA",
    seller: { name: "Lina A.", rating: 5.0, sales: 24, verified: true },
    measurements: { bust: 36, waist: 28, hip: 40, length: 60 },
    missingData: [],
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    aiMatch: 92,
  },
  {
    id: "r4",
    title: "Valentine Floral Burnout Dress",
    brand: "Shahsi",
    color: "Olive Floral",
    size: "S",
    price: 76,
    originalPrice: 129,
    condition: "new",
    conditionScore: 99,
    fitConfidence: "High",
    verified: false,
    shipsFrom: "Chicago, IL",
    seller: { name: "Aisha M.", rating: 4.8, sales: 12, verified: false },
    measurements: { bust: 35, waist: 27, hip: 39, length: 48 },
    missingData: [],
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
    aiMatch: 88,
  },
];

const moduleMap = [
  ["Reseller Marketplace", "Seller profiles, listings, condition scoring, verified resale, seller shipping, marketplace checkout"],
  ["Fit Engine", "Garment measurement comparison, fit confidence, missing measurement warnings, resale size normalization"],
  ["Catalog", "Product reference, brand, color, fabric, size, original product data, images"],
  ["User Profile", "Buyer measurements, saved size, fit preferences, location and style preferences"],
  ["Recommendation Engine", "AI matching score using fit, style, condition, seller trust, and availability"],
  ["Orders", "Resale purchase flow, seller shipping state, delivery tracking, buyer confirmation"],
  ["Payments", "Marketplace payment authorization, seller payout, buyer protection, Stripe Connect-style flow"],
  ["Returns Feedback", "Buyer fit result, item condition feedback, seller quality signals"],
];

export default function ShahsiResaleMarketplacePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("matched");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0]);

  const visibleListings = useMemo(() => {
    let result = listings.filter((listing) => {
      if (filter === "verified") return listing.verified;
      if (filter === "highFit") return listing.fitConfidence === "High";
      if (filter === "under100") return listing.price < 100;
      if (filter === "shipsFast") return listing.seller.rating >= 4.8;
      return true;
    });

    if (sort === "priceLow") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "confidence") result = [...result].sort((a, b) => b.conditionScore - a.conditionScore);
    if (sort === "matched") result = [...result].sort((a, b) => b.aiMatch - a.aiMatch);
    if (sort === "newest") result = [...result].reverse();

    return result;
  }, [filter, sort]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero />
        <TrustStrip />
        <MarketplaceToolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} count={visibleListings.length} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <ListingGrid listings={visibleListings} selectedListing={selectedListing} setSelectedListing={setSelectedListing} />
          <aside className="xl:sticky xl:top-28 xl:self-start">
            {selectedListing && <ListingDetailPanel listing={selectedListing} />}
          </aside>
        </div>
      </section>

      <SellWithShahsi />
      <MarketplaceFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Verified resale marketplace</span>
        <span>Garment measurements + Fit Engine confidence</span>
        <span>Seller shipping · buyer protection</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Verified resale marketplace</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Shop resale</a>
          <a>Sell</a>
          <a>Verified listings</a>
          <a>Fit confidence</a>
          <a>Seller guide</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">List an item</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[650px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/resale</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">Resale with fit confidence, not sizing guesswork.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi’s resale marketplace normalizes seller sizing with garment measurements, condition scoring, verified resale checks, seller profiles, and AI matching.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Shop verified resale <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Start selling</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" alt="Shahsi resale marketplace" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard icon={<ShieldCheck className="h-4 w-4" />} title="Verified resale" copy="Condition scored" />
            <HeroCard icon={<Ruler className="h-4 w-4" />} title="Fit confidence" copy="Measurements required" />
            <HeroCard icon={<Wand2 className="h-4 w-4" />} title="AI matching" copy="Ranked for you" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur"><div className="mb-2 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm text-neutral-600">{copy}</p></div>;
}

function TrustStrip() {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <MetricCard icon={<ShieldCheck className="h-5 w-5" />} title="Verified resale" value="Condition checked" />
      <MetricCard icon={<Ruler className="h-5 w-5" />} title="Garment data" value="Measurements required" />
      <MetricCard icon={<UserRound className="h-5 w-5" />} title="Seller profiles" value="Ratings + sales" />
      <MetricCard icon={<Truck className="h-5 w-5" />} title="Seller shipping" value="Tracked delivery" />
    </section>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div>
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-1 text-xl font-medium">{value}</p>
    </div>
  );
}

function MarketplaceToolbar({ filter, setFilter, sort, setSort, count }: { filter: FilterKey; setFilter: (filter: FilterKey) => void; sort: SortKey; setSort: (sort: SortKey) => void; count: number }) {
  const filters: Array<[FilterKey, string]> = [["all", "All"], ["verified", "Verified"], ["highFit", "High fit"], ["under100", "Under $100"], ["shipsFast", "Top sellers"]];
  return (
    <section className="mt-10 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Marketplace</p>
          <h2 className="mt-1 text-2xl font-medium">{count} resale listings matched to your profile</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filters.map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${filter === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
          </div>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium">
            <option value="matched">Best AI match</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="confidence">Condition score</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function ListingGrid({ listings, selectedListing, setSelectedListing }: { listings: Listing[]; selectedListing: Listing | null; setSelectedListing: (listing: Listing) => void }) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {listings.map((listing) => <ListingCard key={listing.id} listing={listing} selected={selectedListing?.id === listing.id} onClick={() => setSelectedListing(listing)} />)}
    </section>
  );
}

function ListingCard({ listing, selected, onClick }: { listing: Listing; selected: boolean; onClick: () => void }) {
  return (
    <article onClick={onClick} className={`cursor-pointer overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 transition hover:-translate-y-0.5 ${selected ? "ring-neutral-950" : "ring-neutral-200"}`}>
      <div className="relative overflow-hidden">
        <img src={listing.image} alt={listing.title} className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.04]" />
        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {listing.verified && <Badge>Verified</Badge>}
          <Badge>{listing.aiMatch}% match</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{listing.brand}</p>
          <div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />{listing.seller.rating}</div>
        </div>
        <h3 className="text-xl font-medium">{listing.title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{listing.color} · Size {listing.size} · {conditionLabel(listing.condition)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <Mini label="Fit" value={listing.fitConfidence} tone={listing.fitConfidence === "High" ? "success" : "neutral"} />
          <Mini label="Condition" value={`${listing.conditionScore}`} />
          <Mini label="AI" value={`${listing.aiMatch}%`} tone={listing.aiMatch > 90 ? "success" : "neutral"} />
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-medium">${listing.price}</p>
            <p className="text-sm text-neutral-500">Retail ${listing.originalPrice}</p>
          </div>
          <button className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">View</button>
        </div>
      </div>
    </article>
  );
}

function ListingDetailPanel({ listing }: { listing: Listing }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Selected listing</p>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">{listing.title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{listing.color} · Size {listing.size} · {listing.shipsFrom}</p>
        </div>
        {listing.verified ? <ShieldCheck className="h-6 w-6 text-emerald-700" /> : <AlertTriangle className="h-6 w-6 text-amber-700" />}
      </div>

      <div className="mt-6 grid gap-3">
        <DetailRow label="Price" value={`$${listing.price}`} />
        <DetailRow label="Original price" value={`$${listing.originalPrice}`} />
        <DetailRow label="Condition score" value={`${listing.conditionScore}/100`} />
        <DetailRow label="Fit confidence" value={listing.fitConfidence} />
        <DetailRow label="AI match" value={`${listing.aiMatch}%`} />
      </div>

      <SellerProfile listing={listing} />
      <GarmentMeasurements listing={listing} />
      <FitConfidencePanel listing={listing} />
      <ShippingPanel listing={listing} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Buy resale</button>
        <button className="rounded-full border border-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em]">Ask seller</button>
      </div>
    </section>
  );
}

function SellerProfile({ listing }: { listing: Listing }) {
  return (
    <section className="mt-6 rounded-[1.5rem] bg-[#f7f2ea] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white">{listing.seller.name.charAt(0)}</div>
          <div>
            <p className="font-medium">{listing.seller.name}</p>
            <p className="text-sm text-neutral-500">{listing.seller.sales} sales · {listing.seller.rating} rating</p>
          </div>
        </div>
        {listing.seller.verified && <BadgeCheck className="h-5 w-5" />}
      </div>
      <p className="text-sm leading-6 text-neutral-600">Seller profile helps marketplace trust by showing verification, rating, sales history, and shipping location.</p>
    </section>
  );
}

function GarmentMeasurements({ listing }: { listing: Listing }) {
  const entries = [
    ["Bust", listing.measurements.bust],
    ["Waist", listing.measurements.waist],
    ["Hip", listing.measurements.hip],
    ["Length", listing.measurements.length],
  ];
  return (
    <section className="mt-6 rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center gap-2"><Ruler className="h-5 w-5" /><h3 className="font-medium">Garment measurements</h3></div>
      <div className="grid grid-cols-2 gap-3">
        {entries.map(([label, value]) => <MeasurementBox key={String(label)} label={String(label)} value={value ? `${value} in` : "Missing"} missing={!value} />)}
      </div>
      {listing.missingData.length > 0 && <div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>Missing: {listing.missingData.join(", ")}. Fit confidence may be reduced.</p></div>}
    </section>
  );
}

function FitConfidencePanel({ listing }: { listing: Listing }) {
  return (
    <section className="mt-6 rounded-[1.5rem] bg-neutral-950 p-5 text-white">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h3 className="font-medium">Fit Engine resale confidence</h3></div>
      <div className="grid gap-3">
        <DarkRow label="Recommended size match" value={listing.fitConfidence} />
        <DarkRow label="Measurement quality" value={listing.missingData.length ? "Incomplete" : "Complete"} />
        <DarkRow label="Normalized size" value={`${listing.size} / Shahsi equivalent`} />
      </div>
    </section>
  );
}

function ShippingPanel({ listing }: { listing: Listing }) {
  return (
    <section className="mt-6 rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /><h3 className="font-medium">Seller shipping</h3></div>
      <div className="grid gap-3">
        <DetailRow label="Ships from" value={listing.shipsFrom} />
        <DetailRow label="Handling time" value="2–3 business days" />
        <DetailRow label="Buyer protection" value="Included" />
      </div>
    </section>
  );
}

function SellWithShahsi() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Sell with Shahsi</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">List once, sell with measurement confidence.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Sellers provide garment measurements, condition photos, shipping location, and product details so buyers can shop resale with less sizing risk.</p>
          <button className="mt-8 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Create resale listing</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={<Shirt className="h-5 w-5" />} title="Product details" copy="Brand, color, size, condition, original price." />
          <InfoCard icon={<Ruler className="h-5 w-5" />} title="Garment measurements" copy="Bust, waist, hip, length required for higher confidence." />
          <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Condition scoring" copy="Photos and wear notes support buyer trust." />
          <InfoCard icon={<Truck className="h-5 w-5" />} title="Seller shipping" copy="Tracked shipment and payout after delivery." />
        </div>
      </div>
    </section>
  );
}

function MarketplaceFlow() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Marketplace flow</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Verified resale from listing to delivery.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <FlowStep icon={<Shirt className="h-5 w-5" />} title="List" copy="Seller creates item" />
          <FlowStep icon={<Ruler className="h-5 w-5" />} title="Measure" copy="Fit data required" />
          <FlowStep icon={<Sparkles className="h-5 w-5" />} title="Match" copy="AI ranks listing" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Buy" copy="Marketplace checkout" />
          <FlowStep icon={<Truck className="h-5 w-5" />} title="Ship" copy="Seller ships tracked" />
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Modular Monolith Ownership</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Resale Marketplace module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">{children}</span>; }
function Mini({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "success" | "neutral" }) { return <div className="rounded-xl bg-[#f7f2ea] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className={`font-semibold ${tone === "success" ? "text-emerald-700" : "text-neutral-950"}`}>{value}</p></div>; }
function DetailRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong>{value}</strong></div>; }
function DarkRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong>{value}</strong></div>; }
function MeasurementBox({ label, value, missing }: { label: string; value: string; missing: boolean }) { return <div className={`rounded-2xl p-4 ${missing ? "bg-amber-50" : "bg-[#fbfaf6]"}`}><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className={`mt-1 font-medium ${missing ? "text-amber-700" : "text-neutral-950"}`}>{value}</p></div>; }
function InfoCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200"><div className="mb-3 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm leading-6 text-neutral-600">{copy}</p></div>; }
function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>; }
function conditionLabel(condition: Condition) { return condition === "new" ? "New with tags" : condition.charAt(0).toUpperCase() + condition.slice(1); }


