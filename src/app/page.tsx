"use client";

import React, { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const navItems = ["New", "Dresses", "Bridal", "Accessories", "Color", "Sale"];

const intentCards = [
  { title: "Wedding", copy: "For the aisle", icon: "✦" },
  { title: "Party", copy: "For the night", icon: "♡" },
  { title: "Vacation", copy: "For the getaway", icon: "☼" },
  { title: "Date Night", copy: "For the dinner", icon: "◐" },
  { title: "Formal", copy: "For the gala", icon: "♢" },
];

const moments = [
  {
    title: "Day to Night",
    copy: "Soft drape, polished finish, easy styling.",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/sage-green-chiffon-maxi-dress-shahsi-heaven-hue.jpg?v=1773986925&width=600",
  },
  {
    title: "Black Tie",
    copy: "Evening-ready gowns with statement silhouettes.",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/black-heaven-v-neck-bridesmaid-dress-front-look.jpg?v=1773997768&width=600",
  },
  {
    title: "Garden Romance",
    copy: "Airy fabric, soft color, and movement.",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/chamelia-champagne-floral-satin-v-neck-bridesmaid-dress.jpg?v=1773402536&width=600",
  },
  {
    title: "Evening Drama",
    copy: "Satin, shine, and deeper tones.",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/black-satin-wrap-maxi-dress-front-view.jpg?v=1776056073&width=600",
  },
];

const colors = [
  ["Sage", "#7f8f69"],
  ["Blue", "#8eb9d6"],
  ["Blush", "#d7a0a6"],
  ["Ivory", "#d6c4aa"],
  ["Terracotta", "#c4775b"],
  ["Merlot", "#9d2f36"],
  ["Brown", "#7a4f3c"],
  ["Black", "#111111"],
  ["Navy", "#24334f"],
  ["Lilac", "#a893c4"],
];

const products = [
  {
    title: "Sage V-Neck Chiffon Dress",
    price: "$109",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/sage-green-chiffon-maxi-dress-shahsi-heaven-hue.jpg?v=1773986925&width=600",
  },
  {
    title: "Black Satin Wrap Gown",
    price: "$128",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/black-satin-wrap-maxi-dress-front-view.jpg?v=1776056073&width=600",
  },
  {
    title: "Black Heaven V Neck Dress",
    price: "$149",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/black-heaven-v-neck-bridesmaid-dress-front-look.jpg?v=1773997768&width=600",
  },
  {
    title: "Champagne Floral Satin Gown",
    price: "$169",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/chamelia-champagne-floral-satin-v-neck-bridesmaid-dress.jpg?v=1773402536&width=600",
  },
  {
    title: "Navy Satin Bridesmaid Gown",
    price: "$158",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/shahida-chamelia-midnight-navy-satin-bridesmaid-gown-full-length.jpg?v=1774070484&width=600",
  },
  {
    title: "White Bridal Maxi Dress",
    price: "$189",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/white-strapless-satin-chiffon-bridal-maxi-dress.png?v=1773741119&width=600",
  },
  {
    title: "Blue Halter Satin Gown",
    price: "$139",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/navy-blue-satin-high-neck-crisscross-halter-maxi-dress.jpg?v=1773732070&width=600",
  },
  {
    title: "Red Multiway Maxi Dress",
    price: "$119",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/Red-women_s-sleeveless-maxi-dress-for-women-designer-shahida-parides-long-dress-multiway-to-wear-maxi-dress-for-women-long-dress_e7b2463a-c021-49ec-a7ed-52f2f7ad9f0f.jpg?v=1760735946&width=600",
  },
];

const collections = [
  {
    title: "Garden Bride",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/champagne-strapless-satin-midi-dress-front-profile.jpg?v=1774334722&width=500",
  },
  {
    title: "Resort Evenings",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/taupe-strapless-satin-midi-dress-front-view.jpg?v=1774346948&width=500",
  },
  {
    title: "Black Tie",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/black-heaven-v-neck-bridesmaid-dress-front-look.jpg?v=1773997768&width=500",
  },
  {
    title: "Soft Romance",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/burgundy-strapless-satin-midi-dress-front-view.jpg?v=1774407209&width=500",
  },
  {
    title: "Blue Hour",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/pale-yellow-maxidress-long-formal-dresses-long-dresses-for-women-long-flowy-dresses-Shahida-Parides-long-dress-for-sale.jpg?v=1770719406&width=500",
  },
];

const editorial = [
  {
    title: "Garden Wedding Edit",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/full-length-black-velvet-wrap-dress-with-belted-waist-and-long-sleeves-modern-classic-evening-wear-for-women-front-facing.jpg?v=1763441989&width=600",
  },
  {
    title: "Storybook Wedding",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/white-strapless-satin-chiffon-bridal-maxi-dress.png?v=1773741119&width=600",
  },
  {
    title: "Jewel Tone Moment",
    image:
      "https://www.shahidaparides.com/cdn/shop/files/burgundy-strapless-satin-midi-dress-front-view.jpg?v=1774407209&width=600",
  },
];

export default function ShahsiHomePage() {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <main className="min-h-screen bg-[#fbf7ef] font-['Helvetica_Neue',Arial,sans-serif] text-[#17130f] selection:bg-[#d7a98b]/40">
      <Header openMenu={openMenu} setOpenMenu={setOpenMenu} />
      {openMenu && <MobileMenu setOpenMenu={setOpenMenu} />}
      <Hero />
      <IntentSection />
      <MomentSection />
      <ColorStrip />
      <ProductRail title="Trending Now" />
      <ProductRail title="Something new for every kind of party" muted />
      <ShopByMoment />
      <BridalDashboard />
      <TrendingCollections />
      <SwatchStory />
      <EditorialEdits />
      <JournalSection />
      <FeatureBar />
      <RentalWardrobe />
      <Footer />
    </main>
  );
}

function Header({
  openMenu,
  setOpenMenu,
}: {
  openMenu: boolean;
  setOpenMenu: (value: boolean) => void;
}) {
  return (
    <>
      <div className="bg-[#17130f] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f8efe1]">
        Free swatches on bridal parties · Ready-to-ship styles available
      </div>

      <header className="sticky top-0 z-50 border-b border-[#e8ddcf] bg-[#fffaf6]/95 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-[1500px] items-center justify-center px-4 py-6 lg:px-8">
          <button
            className="absolute left-4 rounded-full border border-[#d8cbb9] bg-white/50 p-3 transition hover:bg-[#efe4d5] lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
            aria-label="Open menu"
          >
            {openMenu ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>

          <div className="text-center">
            <p
              className={`${bodoni.className} text-5xl font-normal leading-none tracking-[0.08em] text-[#24334f] md:text-6xl`}
            >
              Shahsi
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.32em] text-[#24334f]/60">
              Since 2026
            </p>
          </div>

          <div className="absolute right-4 flex items-center gap-4 text-[#17130f] lg:right-8">
            <button
              className="rounded-full p-2 transition hover:bg-[#efe4d5]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="rounded-full p-2 transition hover:bg-[#efe4d5]"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              className="hidden rounded-full p-2 transition hover:bg-[#efe4d5] sm:block"
              aria-label="Bag"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-[#eee4d8] bg-[#fffaf6]/80 lg:block">
          <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-12 px-8 py-4 text-[12px] font-bold uppercase tracking-[0.22em] text-[#17130f]">
            {navItems.map((item) => (
              <button
                key={item}
                className="relative transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#b9846f] after:transition-all hover:text-[#b9846f] hover:after:w-full"
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}

function MobileMenu({
  setOpenMenu,
}: {
  setOpenMenu: (value: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden">
      <div className="absolute left-0 top-0 h-full w-[82%] bg-[#fffaf1] p-6">
        <div className="mb-8 flex items-center justify-between">
          <p className={`${bodoni.className} text-3xl text-[#24334f]`}>
            Shahsi
          </p>
          <button onClick={() => setOpenMenu(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5 text-sm uppercase tracking-[0.18em]">
          {navItems.map((item) => (
            <button key={item} className="text-left">
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-0 bg-[#fff7ea] shadow-[0_30px_80px_rgba(38,30,20,0.08)] lg:grid-cols-[1.22fr_0.78fr]">
      <div className="relative h-[520px] overflow-hidden lg:h-[650px]">
        <img
          src="https://www.shahidaparides.com/cdn/shop/files/Black_bridesmaid_dress_by_Shahida_Parides_elegant_satin_gown.jpg?v=1775736132&width=1800"
          alt="Shahsi campaign"
          className="h-full w-full object-cover object-[center_34%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#fff7ea]/20" />
      </div>
      <div className="flex items-center bg-[#fff4e3] px-8 py-12 ring-1 ring-inset ring-[#eadfce] lg:px-14">
        <div className="max-w-md">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b9846f]">
            New season edit
          </p>
          <h1
            className={`${bodoni.className} text-6xl font-normal leading-[0.84] tracking-[-0.04em] text-[#24334f] md:text-8xl`}
          >
            Escape in
            <br />
            Style.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-600">
            A wardrobe for weddings, parties, holidays, and every photographed
            moment in between.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="bg-[#17130f] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_14px_30px_rgba(23,19,15,0.18)] transition hover:bg-[#24334f]">
              Shop the edit
            </button>
            <button className="border border-[#17130f] bg-white/40 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] transition hover:bg-white">
              Explore bridal
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntentSection() {
  return (
    <section className="relative bg-[url('https://www.shahidaparides.com/cdn/shop/files/white-strapless-satin-chiffon-bridal-maxi-dress.png?v=1773741119&width=1600')] bg-cover bg-center py-20">
      <div className="absolute inset-0 bg-[#17130f]/35 backdrop-blur-[2px]" />
      <div className="relative mx-auto max-w-4xl border border-white/15 bg-[#17130f]/75 px-6 py-14 text-center text-white shadow-[0_35px_90px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-12">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
          Tell us the moment
        </p>
        <h2
          className={`${bodoni.className} mt-3 text-4xl italic tracking-[-0.03em] md:text-5xl`}
        >
          I&apos;m getting dressed for...
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/65">
          Start with the event and we&apos;ll guide color, fit, fabric, and
          styling.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {intentCards.map((card) => (
            <button key={card.title} className="group text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white text-xl text-[#17130f] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition group-hover:-translate-y-1 group-hover:scale-105">
                {card.icon}
              </span>
              <span className="mt-3 block text-sm font-medium">
                {card.title}
              </span>
              <span className="block text-[11px] text-white/50">
                {card.copy}
              </span>
            </button>
          ))}
        </div>
        <button className="mt-10 bg-[#c8956e] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17130f]">
          Discover your look
        </button>
      </div>
    </section>
  );
}

function MomentSection() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-20 lg:px-8">
      <div className="mb-10 grid gap-5 md:grid-cols-[0.7fr_1fr] md:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#b9846f]">
            Shop by moment
          </p>
          <h2
            className={`${bodoni.className} mt-2 text-4xl leading-tight tracking-[-0.04em] md:text-5xl`}
          >
            One house. Four doors in.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-neutral-500 md:justify-self-end">
          Whether it&apos;s a ceremony, vacation, dinner, or gala, Shahsi helps
          you begin from the occasion.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-4">
        {moments.map((moment) => (
          <article key={moment.title} className="text-center">
            <div className="mx-auto h-56 w-56 overflow-hidden rounded-full bg-[#eee4d5] shadow-sm md:h-52 md:w-52 lg:h-60 lg:w-60">
              <img
                src={moment.image}
                alt={moment.title}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <h3
              className={`${bodoni.className} mt-5 text-2xl tracking-[-0.03em]`}
            >
              {moment.title}
            </h3>
            <p className="mx-auto mt-2 max-w-[230px] text-xs leading-5 text-neutral-500">
              {moment.copy}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ColorStrip() {
  return (
    <section className="border-y border-[#eadfce] bg-[#fffaf6] py-9 shadow-inner">
      <p
        className={`${bodoni.className} mb-5 text-center text-2xl italic tracking-[-0.03em]`}
      >
        Build the palette before the order.
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4">
        {colors.map(([name, color]) => (
          <button key={name} className="group text-center">
            <span
              className="block h-10 w-10 rounded-full border border-black/10 shadow-sm transition group-hover:-translate-y-1"
              style={{ background: color }}
            />
            <span className="mt-2 block text-[10px] uppercase tracking-[0.14em] text-neutral-500">
              {name}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-7 bg-[#e9957f] py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        Can we help you find your shade?
      </div>
    </section>
  );
}

function ProductRail({
  title,
  muted = false,
}: {
  title: string;
  muted?: boolean;
}) {
  return (
    <section
      className={`${muted ? "pt-4" : "pt-14"} mx-auto max-w-[1500px] px-4 pb-10 lg:px-8`}
    >
      <div className="mb-5 flex items-end justify-between">
        <h2
          className={`${bodoni.className} text-3xl italic tracking-[-0.04em]`}
        >
          {title}
        </h2>
        <button className="text-[11px] uppercase tracking-[0.18em] underline underline-offset-4">
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(muted ? 3 : 0, muted ? 8 : 5).map((product) => (
          <ProductCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <article className="group bg-[#fffaf6] p-2 shadow-sm ring-1 ring-[#eadfce] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(38,30,20,0.12)]">
      <div className="relative overflow-hidden bg-[#eee4d5]">
        <img
          src={product.image}
          alt={product.title}
          className="h-[310px] w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
        />
        <button className="absolute right-2 top-2 rounded-full bg-white/90 p-2">
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="pt-3">
        <h3 className="min-h-[36px] text-xs leading-5">{product.title}</h3>
        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3 w-3 fill-[#17130f]" />
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">{product.price}</p>
        <button className="mt-3 w-full border border-[#d8cbb9] bg-white py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-[#17130f] hover:bg-[#17130f] hover:text-white">
          Add to bag
        </button>
      </div>
    </article>
  );
}

function ShopByMoment() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2
          className={`${bodoni.className} text-4xl italic tracking-[-0.04em]`}
        >
          Find your gown by moment.
        </h2>
        <button className="text-[11px] uppercase tracking-[0.18em]">
          View all
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {collections.map((item) => (
          <article
            key={item.title}
            className="group relative h-[320px] overflow-hidden bg-[#eee4d5] shadow-sm"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <h3
              className={`${bodoni.className} absolute bottom-4 left-4 text-2xl text-white`}
            >
              {item.title}
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function BridalDashboard() {
  return (
    <section className="bg-[#efe6d8] px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <h2
          className={`${bodoni.className} text-4xl leading-tight tracking-[-0.04em] md:text-5xl`}
        >
          One coordinated space for the bride,
          <br />
          bridesmaids, and every ceremony.
        </h2>
        <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
          <div className="rounded-2xl bg-[#fffaf1] p-6 shadow-sm">
            <p className="mb-5 text-sm font-semibold">
              Join Emily&apos;s Wedding Party
            </p>
            <input
              className="mb-3 w-full border border-[#d8cbb9] bg-white px-3 py-3 text-xs"
              placeholder="Name"
            />
            <input
              className="mb-3 w-full border border-[#d8cbb9] bg-white px-3 py-3 text-xs"
              placeholder="Email"
            />
            <button className="mt-2 w-full rounded-full bg-[#17130f] py-3 text-[11px] uppercase tracking-[0.16em] text-white">
              Join party
            </button>
          </div>
          <div className="rounded-2xl bg-[#fffaf1] p-6 shadow-sm md:-mt-6">
            <div className="mb-4 h-32 rounded-xl bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center" />
            <p className="font-semibold">Venue Date</p>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <p>☑ Olive palette selected</p>
              <p>☑ 6 bridesmaids invited</p>
              <p>☐ Final dress approval</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[#fffaf1] p-6 shadow-sm">
            <p className="mb-4 font-semibold">Wedding Room</p>
            <div className="grid grid-cols-3 gap-2">
              {products.slice(0, 3).map((p) => (
                <img
                  key={p.title}
                  src={p.image}
                  alt={p.title}
                  className="h-24 rounded-xl object-cover"
                />
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-neutral-600">
              <p>
                <Users className="mr-2 inline h-4 w-4" />4 members ready
              </p>
              <p>
                <UserRound className="mr-2 inline h-4 w-4" />2 need sizing
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendingCollections() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-16 lg:grid-cols-[1.05fr_1fr] lg:px-8">
      <div>
        <h2
          className={`${bodoni.className} mb-6 text-center text-4xl tracking-[-0.04em] lg:text-left`}
        >
          Trending Formal Collections
        </h2>
        <img
          src="https://www.shahidaparides.com/cdn/shop/files/champagne-strapless-satin-midi-dress-front-profile.jpg?v=1774334722&width=900"
          alt="Formal collection"
          className="h-[640px] w-full object-cover object-top"
        />
        <p className="mt-3 text-center text-xs uppercase tracking-[0.16em]">
          Formal dresses
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 content-end">
        {collections.slice(1).map((item) => (
          <article key={item.title}>
            <img
              src={item.image}
              alt={item.title}
              className="h-[245px] w-full object-cover object-top"
            />
            <p className="mt-2 text-center text-xs">{item.title}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SwatchStory() {
  return (
    <section className="bg-[#efe6d8] px-4 py-16 lg:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#b9846f]">
            Free swatches
          </p>
          <h2
            className={`${bodoni.className} mt-3 text-4xl leading-tight tracking-[-0.04em]`}
          >
            Test color, fabric, and camera-read before ordering.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-600">
            Order swatches by palette, fabric, or bridal group. Compare in
            natural light before committing.
          </p>
          <button className="mt-7 bg-[#17130f] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Order free swatches
          </button>
          <div className="mt-6 flex flex-wrap gap-2">
            {colors.slice(0, 8).map(([name, color]) => (
              <span
                key={name}
                className="h-5 w-5 rounded-full border"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
        <div className="relative h-[430px] overflow-hidden bg-[#ddd0bd]">
          <img
            src="https://www.shahidaparides.com/cdn/shop/files/chamelia-champagne-floral-satin-v-neck-bridesmaid-dress.jpg?v=1773402536&width=900"
            alt="Summer bridesmaids"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-y-0 left-0 flex w-1/2 items-center bg-white/35 p-8 backdrop-blur-sm">
            <h3
              className={`${bodoni.className} text-4xl leading-none text-white drop-shadow`}
            >
              Summer
              <br />
              Bridesmaids
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialEdits() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-16 lg:px-8">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#b9846f]">
        Editorial edits
      </p>
      <h2
        className={`${bodoni.className} mt-2 text-4xl leading-tight tracking-[-0.04em]`}
      >
        Curated looks for every
        <br />
        ceremony mood.
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {editorial.map((item) => (
          <article
            key={item.title}
            className="group relative h-[460px] overflow-hidden bg-[#eee4d5] shadow-[0_18px_45px_rgba(38,30,20,0.10)]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 text-white">
              <h3 className={`${bodoni.className} text-3xl`}>{item.title}</h3>
              <button className="mt-4 bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17130f]">
                Shop edit
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function JournalSection() {
  return (
    <section className="border-y border-[#eadfce] bg-[#fffaf1] px-4 py-14 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.24em]">
            Shahsi style journal
          </p>
          <button className="text-[11px] uppercase tracking-[0.18em]">
            View all
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {editorial.map((item, index) => (
            <article key={item.title}>
              <img
                src={item.image}
                alt={item.title}
                className="h-[330px] w-full object-cover"
              />
              <h3 className={`${bodoni.className} mt-4 text-2xl`}>
                {["Color guide", "Bridesmaid styling", "Fit notes"][index]}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBar() {
  return (
    <section className="grid grid-cols-2 gap-px bg-[#ded6c8] text-center text-[10px] uppercase tracking-[0.16em] md:grid-cols-5">
      {[
        "Free shipping",
        "Free returns",
        "Fit intelligence",
        "AI stylist",
        "Group orders",
      ].map((feature) => (
        <div key={feature} className="bg-[#f8f3e9] px-3 py-5">
          <Sparkles className="mx-auto mb-2 h-4 w-4" />
          {feature}
        </div>
      ))}
    </section>
  );
}

function RentalWardrobe() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-16 text-center lg:px-8">
      <h2
        className={`${bodoni.className} mb-8 text-4xl italic tracking-[-0.04em]`}
      >
        Rent your occasion wardrobe
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <img
            key={product.title}
            src={product.image}
            alt={product.title}
            className="h-[320px] w-full object-cover object-top"
          />
        ))}
      </div>
      <button className="mt-8 rounded-full bg-[#17130f] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
        Explore rental
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#15110d] text-white">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-12 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Here to brighten up your inbox.
          </p>
          <h2
            className={`${bodoni.className} mt-3 text-4xl tracking-[-0.04em]`}
          >
            Join the Shahsi list.
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-full bg-white px-4 py-3 text-sm text-black"
            placeholder="Email address"
          />
          <button className="bg-[#c8956e] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black">
            Join
          </button>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50">
        © 2026 Shahsi
      </div>
    </footer>
  );
}
