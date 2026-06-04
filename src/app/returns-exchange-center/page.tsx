
"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Heart,
  Info,
  Package,
  Palette,
  RefreshCcw,
  RotateCcw,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  Wand2,
} from "lucide-react";

type ReturnReason = "fit" | "color" | "style" | "quality" | "late" | "changedMind";
type FitResult = "tooSmall" | "perfect" | "tooLarge" | "tooShort" | "tooLong";
type ProblemArea = "bust" | "waist" | "hip" | "length" | "shoulder" | "none";
type Resolution = "refund" | "exchange" | "storeCredit" | "resale";
type ReturnTab = "start" | "feedback" | "exchange" | "status";

const returnItems = [
  {
    id: "ri-1",
    product: "Sorrel Stretch Satin Dress",
    type: "Rental",
    color: "Ganache",
    size: "A10",
    order: "SH-10188",
    eligible: true,
    deadline: "May 23, 2026",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "ri-2",
    product: "Niamh Corset Dress",
    type: "Retail",
    color: "Rosewood",
    size: "M",
    order: "SH-10144",
    eligible: true,
    deadline: "June 2, 2026",
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "ri-3",
    product: "Mira Pleated One Shoulder Gown",
    type: "Made-to-order",
    color: "Emerald",
    size: "Custom",
    order: "SH-10221",
    eligible: false,
    deadline: "Final sale after approval",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
];

const returnHistory = [
  ["Niamh Corset Dress", "Exchange requested", "Waist too snug", "Fit Engine adjusted corset confidence"],
  ["Rosewood Crepe Dress", "Returned", "Color liked, style not preferred", "Style Engine prioritized warmer pinks"],
  ["Column Satin Dress", "Returned", "Hip too fitted", "Recommendation Engine lowered fitted column styles"],
];

const moduleMap = [
  ["Returns Feedback", "Return reasons, fit result, problem area, color/style signals, exchange outcome"],
  ["Fit Engine", "Learns too small/perfect/too large, body-zone issues, length feedback, backup-size logic"],
  ["Style Engine", "Learns color liked/disliked, modesty mismatch, silhouette preference, style reasons"],
  ["Recommendation Engine", "Updates future ranking based on returns, exchanges, fit history, and style feedback"],
  ["Orders", "Eligibility, order lookup, label generation, return status, exchange order creation"],
  ["Rental", "Rental returns, return deadline, late risk, condition check, return label"],
  ["Payments", "Refunds, store credit, exchange balances, Stripe refund state"],
  ["Reseller Marketplace", "Suggest resale path for ineligible or final-sale items"],
];

export default function ShahsiReturnsExchangeCenterPage() {
  const [activeTab, setActiveTab] = useState<ReturnTab>("start");
  const [selectedItemId, setSelectedItemId] = useState("ri-1");
  const [returnReason, setReturnReason] = useState<ReturnReason>("fit");
  const [fitResult, setFitResult] = useState<FitResult>("tooSmall");
  const [problemArea, setProblemArea] = useState<ProblemArea>("waist");
  const [resolution, setResolution] = useState<Resolution>("exchange");
  const [colorLiked, setColorLiked] = useState(true);

  const selectedItem = returnItems.find((item) => item.id === selectedItemId)!;
  const feedbackScore = useMemo(() => {
    let score = 40;
    if (returnReason) score += 15;
    if (fitResult) score += 15;
    if (problemArea) score += 15;
    if (resolution) score += 15;
    return Math.min(score, 100);
  }, [returnReason, fitResult, problemArea, resolution]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero feedbackScore={feedbackScore} selectedItem={selectedItem} />
        <ReturnTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="grid gap-8">
            {(activeTab === "start" || activeTab === "feedback") && <ReturnItemSelector selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} />}
            {(activeTab === "start" || activeTab === "feedback") && <FeedbackCapture returnReason={returnReason} setReturnReason={setReturnReason} fitResult={fitResult} setFitResult={setFitResult} problemArea={problemArea} setProblemArea={setProblemArea} colorLiked={colorLiked} setColorLiked={setColorLiked} />}
            {(activeTab === "exchange" || activeTab === "start") && <ResolutionOptions resolution={resolution} setResolution={setResolution} selectedItem={selectedItem} />}
            {(activeTab === "status" || activeTab === "start") && <ReturnStatus />}
          </section>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <ReturnSummary selectedItem={selectedItem} feedbackScore={feedbackScore} resolution={resolution} />
            <RecommendationLearning returnReason={returnReason} fitResult={fitResult} problemArea={problemArea} colorLiked={colorLiked} />
            <ReturnHistory />
          </aside>
        </div>
      </section>

      <LearningFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Returns / Exchange Center</span>
        <span>Returns feed the recommendation system</span>
        <span>Fit · style · color · problem-area feedback</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Returns intelligence</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Start Return</a>
          <a>Exchange</a>
          <a>Feedback</a>
          <a>Status</a>
          <a>History</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Start return</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ feedbackScore, selectedItem }: { feedbackScore: number; selectedItem: typeof returnItems[number] }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/returns</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">Return, exchange, and teach Shahsi what fits better next time.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Capture fit, color, style, and problem-area feedback so Fit Engine, Style Engine, and Recommendation Engine improve every future product, rental, and subscription pick.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Continue return <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Exchange instead</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<RotateCcw className="h-4 w-4" />} label="Selected item" value={selectedItem.product} />
          <HeroMetric icon={<BadgeCheck className="h-4 w-4" />} label="Eligibility" value={selectedItem.eligible ? "Eligible" : "Final sale"} />
          <HeroMetric icon={<Sparkles className="h-4 w-4" />} label="Feedback quality" value={`${feedbackScore}%`} />
          <HeroMetric icon={<Package className="h-4 w-4" />} label="Deadline" value={selectedItem.deadline} />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-5 backdrop-blur"><div className="mb-3 flex items-center gap-2 text-white/75">{icon}<span className="text-xs uppercase tracking-[0.14em]">{label}</span></div><p className="line-clamp-2 text-2xl font-medium">{value}</p></div>;
}

function ReturnTabs({ activeTab, setActiveTab }: { activeTab: ReturnTab; setActiveTab: (tab: ReturnTab) => void }) {
  const tabs: Array<[ReturnTab, string, React.ReactNode]> = [
    ["start", "Start", <RotateCcw className="h-4 w-4" />],
    ["feedback", "Feedback", <Sparkles className="h-4 w-4" />],
    ["exchange", "Exchange", <RefreshCcw className="h-4 w-4" />],
    ["status", "Status", <Truck className="h-4 w-4" />],
  ];
  return <section className="mt-8 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200"><div className="flex gap-2 overflow-x-auto pb-1">{tabs.map(([id, label, icon]) => <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${activeTab === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{icon}{label}</button>)}</div></section>;
}

function ReturnItemSelector({ selectedItemId, setSelectedItemId }: { selectedItemId: string; setSelectedItemId: (id: string) => void }) {
  return (
    <Panel eyebrow="Start return" title="Choose item to return or exchange" copy="Eligibility rules depend on item type: retail, rental, made-to-order, subscription, or resale.">
      <div className="grid gap-4">
        {returnItems.map((item) => <button key={item.id} onClick={() => setSelectedItemId(item.id)} className={`grid gap-4 rounded-[1.5rem] border p-4 text-left md:grid-cols-[104px_1fr_auto] md:items-center ${selectedItemId === item.id ? "border-neutral-950 bg-[#fbfaf6]" : "border-neutral-200"}`}><img src={item.image} alt={item.product} className="h-28 w-full rounded-2xl object-cover md:h-24 md:w-24" /><div><div className="mb-2 flex flex-wrap gap-2"><Badge>{item.type}</Badge><Badge>{item.eligible ? "Eligible" : "Final sale"}</Badge></div><h3 className="font-medium">{item.product}</h3><p className="mt-1 text-sm text-neutral-500">{item.order} · {item.color} · Size {item.size}</p></div><p className="text-sm font-medium text-neutral-600">{item.deadline}</p></button>)}
      </div>
    </Panel>
  );
}

function FeedbackCapture({ returnReason, setReturnReason, fitResult, setFitResult, problemArea, setProblemArea, colorLiked, setColorLiked }: { returnReason: ReturnReason; setReturnReason: (v: ReturnReason) => void; fitResult: FitResult; setFitResult: (v: FitResult) => void; problemArea: ProblemArea; setProblemArea: (v: ProblemArea) => void; colorLiked: boolean; setColorLiked: (v: boolean) => void }) {
  return (
    <Panel eyebrow="Recommendation feedback" title="Tell Shahsi why this did not work" copy="This feedback becomes structured learning data for fit, style, color, rental, subscription, and future recommendations.">
      <FeedbackGroup title="Primary reason" value={returnReason} setValue={setReturnReason} options={[["fit", "Fit issue"], ["color", "Color issue"], ["style", "Style not right"], ["quality", "Quality issue"], ["late", "Arrived late"], ["changedMind", "Changed mind"]]} />
      <FeedbackGroup title="Fit result" value={fitResult} setValue={setFitResult} options={[["tooSmall", "Too small"], ["perfect", "Fit was perfect"], ["tooLarge", "Too large"], ["tooShort", "Too short"], ["tooLong", "Too long"]]} />
      <FeedbackGroup title="Problem area" value={problemArea} setValue={setProblemArea} options={[["bust", "Bust"], ["waist", "Waist"], ["hip", "Hip"], ["length", "Length"], ["shoulder", "Shoulder"], ["none", "None"]]} />
      <div className="mt-6 rounded-[1.5rem] border border-neutral-200 p-5">
        <p className="mb-3 font-medium">Did you like the color?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setColorLiked(true)} className={`rounded-2xl border p-4 text-left ${colorLiked ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}>Yes, color worked</button>
          <button onClick={() => setColorLiked(false)} className={`rounded-2xl border p-4 text-left ${!colorLiked ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}>No, avoid this color</button>
        </div>
      </div>
    </Panel>
  );
}

function FeedbackGroup({ title, value, setValue, options }: { title: string; value: string; setValue: (value: any) => void; options: string[][] }) {
  return <div className="mt-6 first:mt-0 rounded-[1.5rem] border border-neutral-200 p-5"><p className="mb-3 font-medium">{title}</p><div className="grid gap-3 sm:grid-cols-3">{options.map(([id, label]) => <button key={id} onClick={() => setValue(id)} className={`rounded-2xl border p-4 text-left text-sm ${value === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}>{label}</button>)}</div></div>;
}

function ResolutionOptions({ resolution, setResolution, selectedItem }: { resolution: Resolution; setResolution: (value: Resolution) => void; selectedItem: typeof returnItems[number] }) {
  const options: Array<[Resolution, string, string, React.ReactNode]> = [
    ["exchange", "Exchange", "Choose a better size, color, or style", <RefreshCcw className="h-5 w-5" />],
    ["refund", "Refund", "Return to original payment method", <CreditCard className="h-5 w-5" />],
    ["storeCredit", "Store credit", "Fastest reusable credit option", <ShoppingBag className="h-5 w-5" />],
    ["resale", "List for resale", "For final-sale or lightly worn items", <Shirt className="h-5 w-5" />],
  ];
  return (
    <Panel eyebrow="Resolution" title="Choose return outcome" copy="The recommended outcome depends on eligibility, item model, final-sale status, and customer intent.">
      {!selectedItem.eligible && <div className="mb-5 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>This item is not eligible for refund because it is made-to-order/final-sale. Shahsi can offer resale listing or support review.</p></div>}
      <div className="grid gap-4 md:grid-cols-2">
        {options.map(([id, title, copy, icon]) => <button key={id} onClick={() => setResolution(id)} className={`rounded-[1.5rem] border p-5 text-left ${resolution === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}><div className="mb-4 flex items-center gap-2">{icon}<h3 className="font-medium">{title}</h3></div><p className={`text-sm leading-6 ${resolution === id ? "text-white/70" : "text-neutral-600"}`}>{copy}</p></button>)}
      </div>
    </Panel>
  );
}

function ReturnStatus() {
  const steps = [["Request started", "Return created and feedback captured", "complete"], ["Label generated", "Return shipping label ready", "active"], ["In transit", "Carrier scan pending", "pending"], ["Received", "Warehouse inspection pending", "pending"], ["Resolved", "Refund, exchange, or credit issued", "pending"]] as const;
  return (
    <Panel eyebrow="Return status" title="Track return or exchange" copy="Orders module tracks labels, transit, inspection, refund/exchange creation, and feedback ingestion.">
      <div className="grid gap-3">{steps.map(([title, copy, status]) => <div key={title} className="flex gap-4 rounded-2xl border border-neutral-200 p-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${status === "complete" ? "bg-emerald-700 text-white" : status === "active" ? "bg-neutral-950 text-white" : "bg-[#f7f2ea] text-neutral-500"}`}>{status === "complete" ? <CheckCircle2 className="h-5 w-5" /> : <Truck className="h-5 w-5" />}</div><div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-600">{copy}</p></div></div>)}</div>
    </Panel>
  );
}

function ReturnSummary({ selectedItem, feedbackScore, resolution }: { selectedItem: typeof returnItems[number]; feedbackScore: number; resolution: Resolution }) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Return summary</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">{selectedItem.product}</h2>
      <img src={selectedItem.image} alt={selectedItem.product} className="mt-6 aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
      <div className="mt-5 grid gap-3">
        <DarkRow label="Order" value={selectedItem.order} />
        <DarkRow label="Eligibility" value={selectedItem.eligible ? "Eligible" : "Final sale"} />
        <DarkRow label="Resolution" value={resolutionLabel(resolution)} />
        <DarkRow label="Feedback quality" value={`${feedbackScore}%`} />
      </div>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Submit return <ArrowRight className="h-4 w-4" /></button>
    </section>
  );
}

function RecommendationLearning({ returnReason, fitResult, problemArea, colorLiked }: { returnReason: ReturnReason; fitResult: FitResult; problemArea: ProblemArea; colorLiked: boolean }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-medium">Learning signals</h2></div>
      <div className="grid gap-3">
        <LightRow label="Reason" value={reasonLabel(returnReason)} />
        <LightRow label="Fit result" value={fitLabel(fitResult)} />
        <LightRow label="Problem area" value={areaLabel(problemArea)} />
        <LightRow label="Color signal" value={colorLiked ? "Color liked" : "Avoid color"} />
      </div>
      <div className="mt-5 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-neutral-700"><strong>System impact:</strong> Future size, silhouette, color, rental backup, and subscription recommendations should adjust from these signals.</div>
    </section>
  );
}

function ReturnHistory() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">History</p>
      <h2 className="mt-2 text-2xl font-medium">Past return learning</h2>
      <div className="mt-5 grid gap-3">{returnHistory.map(([item, status, reason, impact]) => <div key={item} className="rounded-2xl bg-[#fbfaf6] p-4"><p className="font-medium">{item}</p><p className="mt-1 text-sm text-neutral-600">{status} · {reason}</p><p className="mt-2 text-sm font-medium">{impact}</p></div>)}</div>
    </section>
  );
}

function LearningFlow() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Recommendation learning flow</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Returns are not failure. They are intelligence.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Every return should become structured data that improves fit, style, rental safety, subscription curation, and resale recommendations.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <FlowStep icon={<RotateCcw className="h-5 w-5" />} title="Return" copy="Start request" />
          <FlowStep icon={<Ruler className="h-5 w-5" />} title="Fit" copy="Problem area" />
          <FlowStep icon={<Palette className="h-5 w-5" />} title="Style" copy="Color/style signal" />
          <FlowStep icon={<Wand2 className="h-5 w-5" />} title="Learn" copy="Update ranking" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Recommend" copy="Better next pick" />
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Returns / Exchange Center module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Panel({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) {
  return <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6"><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p><h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p><div className="mt-6">{children}</div></section>;
}

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong className="text-right">{value}</strong></div>;
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong className="text-right">{value}</strong></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{children}</span>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}

function reasonLabel(value: ReturnReason) {
  return { fit: "Fit issue", color: "Color issue", style: "Style not right", quality: "Quality issue", late: "Arrived late", changedMind: "Changed mind" }[value];
}
function fitLabel(value: FitResult) {
  return { tooSmall: "Too small", perfect: "Perfect", tooLarge: "Too large", tooShort: "Too short", tooLong: "Too long" }[value];
}
function areaLabel(value: ProblemArea) {
  return { bust: "Bust", waist: "Waist", hip: "Hip", length: "Length", shoulder: "Shoulder", none: "None" }[value];
}
function resolutionLabel(value: Resolution) {
  return { refund: "Refund", exchange: "Exchange", storeCredit: "Store credit", resale: "List for resale" }[value];
}

