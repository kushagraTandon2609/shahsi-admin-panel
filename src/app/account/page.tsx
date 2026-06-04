"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  ChevronRight,
  Heart,
  Loader2,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
  Ruler,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";

import { getMe } from "@/lib/api/account.api";
import { getOrders } from "@/lib/api/orders.api";
import { getUserProfile } from "@/lib/api/userProfile.api";
import { getBridalEventStatus } from "@/lib/api/bridalParty.api";

type User = {
  id?: string;
  userId?: string;
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
};

type OrderItem = {
  id?: string;
  productId?: string;
  name?: string;
  title?: string;
  image?: string;
  quantity?: number;
  price?: number;
};

type Order = {
  id?: string;
  orderId?: string;
  status?: string;
  total?: number;
  amount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

type UserProfile = {
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bodyType?: string;
  fitPreference?: string;
};

type BridalStatus = {
  eventId?: string;
  id?: string;
  eventName?: string;
  totalMembers?: number;
  joined?: number;
  sizeSubmitted?: number;
  approved?: number;
  paid?: number;
  members?: any[];
  data?: any;
};

const navItems = [
  ["Overview", ShoppingBag],
  ["Orders", PackageCheck],
  ["Rentals", Box],
  ["Subscription", RefreshCcw],
  ["Fit Profile", Ruler],
  ["Wishlist", Heart],
  ["Bridal Parties", Users],
  ["Returns", RotateCcw],
];

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bridalStatus, setBridalStatus] = useState<BridalStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAccount() {
    try {
      setLoading(true);
      setError("");

      const [meRes, ordersRes, profileRes] = await Promise.allSettled([
        getMe(),
        getOrders(),
        getUserProfile(),
      ]);

      if (meRes.status === "fulfilled") {
        setUser(meRes.value?.user || meRes.value?.data?.user || meRes.value?.data || null);
      }

      if (ordersRes.status === "fulfilled") {
        const raw = ordersRes.value as any;
        const list = Array.isArray(raw) ? raw : raw?.data || raw?.orders || [];
        setOrders(Array.isArray(list) ? list : []);
      }

      if (profileRes.status === "fulfilled") {
        const raw = profileRes.value as any;
        setProfile(raw?.data || raw?.profile || raw || null);
      }

      if (typeof window !== "undefined") {
        const savedEventId =
          localStorage.getItem("bridalEventId") ||
          localStorage.getItem("shahsiBridalEventId");

        if (savedEventId) {
          try {
            const bridal = await getBridalEventStatus(savedEventId);
            setBridalStatus(bridal as BridalStatus);
          } catch {
            setBridalStatus(null);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Account data load nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccount();
  }, []);

  const latestOrder = orders[0];

  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      return !["cancelled", "delivered", "completed", "returned"].includes(status);
    }).length;
  }, [orders]);

  const bridalCount =
    bridalStatus?.totalMembers ||
    bridalStatus?.data?.totalMembers ||
    bridalStatus?.members?.length ||
    0;

  const fitComplete = Boolean(
    profile?.height && profile?.weight && profile?.chest && profile?.waist
  );

  const displayName =
    user?.name ||
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Shahsi user";

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-neutral-950">
      <TopBar />

      <section className="mx-auto max-w-[1500px] px-4 py-10 lg:px-8">
        <Hero
          activeOrders={activeOrders}
          bridalCount={bridalCount}
          fitComplete={fitComplete}
        />

        {loading && (
          <div className="mt-8 flex items-center justify-center rounded-[2rem] bg-white p-10 ring-1 ring-neutral-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading account...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <Sidebar user={user} displayName={displayName} />

            <section className="grid gap-6">
              <SummaryGrid
                activeOrders={activeOrders}
                bridalCount={bridalCount}
                fitComplete={fitComplete}
              />

              <LatestOrder order={latestOrder} />

              <div className="grid gap-6 lg:grid-cols-2">
                <SavedFitProfile profile={profile} fitComplete={fitComplete} />
                <GownloopBox />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <BridalPartyCard bridalStatus={bridalStatus} />
                <ReturnsCard />
              </div>
            </section>
          </div>
        )}
      </section>

      <OrderTrackingPreview latestOrder={latestOrder} />
      <ModuleMap />
    </main>
  );
}

function TopBar() {
  return (
    <div className="border-b border-neutral-200 bg-[#fbfaf7]">
      <div className="mx-auto flex max-w-[1500px] justify-between px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-neutral-500 lg:px-8">
        <span>Account dashboard</span>
        <span className="hidden md:block">Orders · Rentals · Subscription · Resale</span>
        <span className="hidden lg:block">Fit + style intelligence saved to profile</span>
      </div>
    </div>
  );
}

function Hero({
  activeOrders,
  bridalCount,
  fitComplete,
}: {
  activeOrders: number;
  bridalCount: number;
  fitComplete: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[2.5rem] bg-neutral-950 p-8 text-white md:p-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">
            Account Dashboard
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
            Everything you wear, rent, order, return, and resell — in one place.
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-white/65">
            Manage Shahsi orders, bridal parties, Gownloop subscription, rentals,
            saved fit profile, wishlist, returns, and resale listings from one modular
            account hub.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <HeroMetric icon={<ShoppingBag />} label="Active orders" value={activeOrders} />
          <HeroMetric icon={<Users />} label="Bridal parties" value={bridalCount} />
          <HeroMetric
            icon={<Ruler />}
            label="Fit profile"
            value={fitComplete ? "Complete" : "Incomplete"}
          />
          <HeroMetric icon={<RefreshCcw />} label="Gownloop" value="Active" />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <div className="mb-4 h-5 w-5 text-white/60">{icon}</div>
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Sidebar({
  user,
  displayName,
}: {
  user: User | null;
  displayName: string;
}) {
  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
        <div className="rounded-2xl bg-[#f3eee5] p-4">
          <p className="font-semibold capitalize">{displayName}</p>
          <p className="mt-1 text-sm text-neutral-500">{user?.email || "No email"}</p>
        </div>

        <div className="mt-5 grid gap-1">
          {navItems.map(([label, Icon], index) => (
            <button
              key={String(label)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${
                index === 0
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-700 hover:bg-[#f8f5ef]"
              }`}
            >
              <span className="flex items-center gap-2">
                {React.createElement(Icon as any, { className: "h-4 w-4" })}
                {String(label)}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SummaryGrid({
  activeOrders,
  bridalCount,
  fitComplete,
}: {
  activeOrders: number;
  bridalCount: number;
  fitComplete: boolean;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <SummaryCard icon={<ShoppingBag />} label="Orders" value={`${activeOrders} active`} copy="Retail, MTO, and rental orders" />
      <SummaryCard icon={<Users />} label="Bridal parties" value={`${bridalCount} members`} copy="Selections and payments in progress" />
      <SummaryCard icon={<Ruler />} label="Fit profile" value={fitComplete ? "Complete" : "Incomplete"} copy="Measurements ready for recommendations" />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  copy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eee5]">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-neutral-500">{copy}</p>
    </div>
  );
}

function LatestOrder({ order }: { order?: Order }) {
  if (!order) {
    return (
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-neutral-200">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Latest order
        </p>
        <h2 className="mt-3 text-3xl font-semibold">No orders yet</h2>
        <p className="mt-2 text-neutral-500">
          Tumhare account me abhi koi order nahi hai.
        </p>
        <Link
          href="/collection"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const orderId = order.orderId || order.id || "Order";
  const amount = order.total || order.amount || 0;
  const status = order.status || "Processing";
  const firstItem = order.items?.[0];

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-neutral-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Latest order
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{orderId}</h2>
        </div>

        <Link
          href={`/orders/${orderId}`}
          className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold hover:bg-[#f8f5ef]"
        >
          View tracking
        </Link>
      </div>

      <div className="mt-6 max-w-xl rounded-[1.5rem] border border-neutral-200 p-4">
        <div className="flex gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f3eee5]">
            {firstItem?.image ? (
              <img
                src={firstItem.image}
                alt={firstItem.name || firstItem.title || "Order item"}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <ShoppingBag className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {status}
            </span>
            <p className="mt-3 font-semibold">
              {firstItem?.name || firstItem?.title || "Shahsi order"}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "Date not available"}
            </p>
            <p className="mt-1 font-semibold">₹{amount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SavedFitProfile({
  profile,
  fitComplete,
}: {
  profile: UserProfile | null;
  fitComplete: boolean;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex items-center gap-2">
        <Ruler className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Saved Fit Profile</h2>
      </div>

      {!fitComplete ? (
        <div>
          <p className="text-neutral-500">Fit profile incomplete hai.</p>
          <Link
            href="/fit-profile"
            className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Complete fit profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 text-center">
          <FitMetric label="Bust" value={profile?.chest || "-"} />
          <FitMetric label="Waist" value={profile?.waist || "-"} />
          <FitMetric label="Hip" value={profile?.hips || "-"} />
          <FitMetric label="Height" value={profile?.height || "-"} />
        </div>
      )}
    </section>
  );
}

function FitMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#f8f5ef] p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function GownloopBox() {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex items-center gap-2">
        <RefreshCcw className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Gownloop Box</h2>
      </div>
      <p className="leading-7 text-neutral-600">
        Next box recommendations will use your saved fit profile, color preferences,
        rental history, and return feedback signals.
      </p>
      <button className="mt-6 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white">
        Manage box
      </button>
    </section>
  );
}

function BridalPartyCard({ bridalStatus }: { bridalStatus: BridalStatus | null }) {
  const total =
    bridalStatus?.totalMembers ||
    bridalStatus?.data?.totalMembers ||
    bridalStatus?.members?.length ||
    0;

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Bridal Party</h2>
      </div>

      <p className="text-neutral-600">
        {total > 0
          ? `${total} members connected in your bridal workspace.`
          : "No active bridal party found."}
      </p>

      <Link
        href="/bridal-party"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
      >
        Open bridal party <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function ReturnsCard() {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex items-center gap-2">
        <RotateCcw className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Returns & Exchange</h2>
      </div>
      <p className="leading-7 text-neutral-600">
        Returns will feed Fit Engine and Recommendation Engine with fit, color,
        length, and style feedback.
      </p>
      <Link
        href="/returns"
        className="mt-6 inline-flex rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold"
      >
        Start return
      </Link>
    </section>
  );
}

function OrderTrackingPreview({ latestOrder }: { latestOrder?: Order }) {
  return (
    <section className="bg-[#f3eee5] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
          /orders/:id
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">
          Order tracking detail page pattern.
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-neutral-600">
          Use this same visual system for individual order tracking pages with shipping,
          rental return, group status, MTO production, and payment state.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-neutral-200">
            <p className="text-sm text-neutral-500">Order</p>
            <h3 className="mt-1 text-3xl font-semibold">
              {latestOrder?.orderId || latestOrder?.id || "No order yet"}
            </h3>
          </div>

          <div className="rounded-[2rem] bg-white p-6 ring-1 ring-neutral-200">
            <h3 className="text-2xl font-semibold">Tracking timeline</h3>
            <div className="mt-5 grid gap-3">
              {["Payment confirmed", "Processing", "Shipped / Production", "Group / Rental state"].map(
                (step) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white">
                      <PackageCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">{step}</p>
                      <p className="text-sm text-neutral-500">Status will update from backend.</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleMap() {
  const items = [
    ["Account", "Orders, rentals, subscription, fit profile, wishlist, bridal parties, returns, resale listings"],
    ["Orders", "Cart, checkout, payment state, shipment, fulfillment, and order history"],
    ["Rental", "Rental window, backup size, return deadline, event readiness"],
    ["Subscription", "Monthly Gownloop box, curation rules, learning signals"],
    ["User Profile", "Saved measurements, fit preferences, style inputs"],
    ["Fit Engine", "Recommended size, body measurements, fit confidence"],
    ["Style Engine", "Color match, modesty match, body-shape guidance"],
    ["Bridal Party", "Event workspace, assignments, payment, shared checkout"],
    ["Returns Feedback", "Return reasons and fit-result learning signals"],
  ];

  return (
    <section className="bg-neutral-950 py-16 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          Modular monolith ownership
        </p>
        <h2 className="mt-3 text-4xl font-semibold">Account and order tracking module map.</h2>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}