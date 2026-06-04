"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Plus,
  RefreshCcw,
  Ruler,
  ShoppingBag,
  Sparkles,
  Truck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import {
  approveDressSelection,
  assignDressToMember,
  BridalEventStatus,
  BridalMember,
  bridalPaymentSuccess,
  createBridalEvent,
  createBridalPayment,
  createShipment,
  getBridalEventStatus,
  getShipment,
  inviteBridalMember,
  joinBridalParty,
  submitMemberSize,
} from "@/lib/api/bridalParty.api";

type ApiState = {
  loading: boolean;
  error: string;
  success: string;
};

function getEventIdFromResponse(data: BridalEventStatus | null) {
  return (
    data?.eventId ||
    data?.id ||
    data?.data?.eventId ||
    data?.data?.id ||
    ""
  );
}

function normalizeMembers(data: BridalEventStatus | null): BridalMember[] {
  const raw =
    data?.members ||
    data?.data?.members ||
    data?.data?.event?.members ||
    data?.data?.bridalPartyMembers ||
    [];

  return Array.isArray(raw) ? raw : [];
}

export default function BridalPartyPage() {
  const [apiState, setApiState] = useState<ApiState>({
    loading: false,
    error: "",
    success: "",
  });

  const [joinToken, setJoinToken] = useState("");
  const [lastInvite, setLastInvite] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const [eventId, setEventId] = useState("");
  const [eventStatus, setEventStatus] = useState<BridalEventStatus | null>(
    null
  );
  const [shipment, setShipment] = useState<any>(null);

  const [eventForm, setEventForm] = useState({
    eventName: "Sofia Wedding",
    brideName: "Sofia",
    weddingDate: "2026-06-22",
    palette: "Sage,Eucalyptus,Champagne,Ivory",
  });

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "BRIDESMAID",
  });

  const [memberAction, setMemberAction] = useState({
    memberId: "",
    productId: "",
    variantId: "",
    selectionId: "",
    dressName: "",
    color: "Sage",
    size: "A8",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    amount: "99",
  });

  const members = useMemo(() => normalizeMembers(eventStatus), [eventStatus]);

  useEffect(() => {
    const saved = localStorage.getItem("shahsiFitProfile");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const measurements = parsed?.measurements;

      if (!measurements) return;

      const recommendedSize = String(parsed?.fitResult?.recommendedSize || "A8");
      const backendSize = recommendedSize.includes("/")
        ? recommendedSize.split("/").pop()?.trim() || "A8"
        : recommendedSize;

      setMemberAction((prev) => ({
        ...prev,
        bust: String(measurements.bust || prev.bust || ""),
        waist: String(measurements.waist || prev.waist || ""),
        hip: String(measurements.hip || prev.hip || ""),
        height:
          measurements.heightFeet && measurements.heightInches !== undefined
            ? `${measurements.heightFeet} ft ${measurements.heightInches} in`
            : prev.height,
        size: backendSize,
      }));
    } catch (error) {
      console.error("Fit profile auto-fill failed:", error);
    }
  }, []);

  useEffect(() => {
    const savedEventId =
      typeof window !== "undefined"
        ? localStorage.getItem("bridalEventId") || ""
        : "";

    if (savedEventId) {
      setEventId(savedEventId);
      refreshDashboard(savedEventId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (eventId && typeof window !== "undefined") {
      localStorage.setItem("bridalEventId", eventId);
    }
  }, [eventId]);

  async function runAction<T>(action: () => Promise<T>, successMessage: string) {
    try {
      setApiState({ loading: true, error: "", success: "" });

      const result = await action();

      setApiState({
        loading: false,
        error: "",
        success: successMessage,
      });

      return result;
    } catch (error: any) {
      setApiState({
        loading: false,
        error: error?.message || "Something went wrong",
        success: "",
      });

      return null;
    }
  }

  async function refreshDashboard(id = eventId) {
    if (!id) {
      setApiState({
        loading: false,
        error:
          "Event ID missing hai. Pehle event create karo ya Event ID paste karo.",
        success: "",
      });
      return;
    }

    const data = await runAction(
      () => getBridalEventStatus(id),
      "Dashboard refreshed"
    );

    if (data) {
      setEventStatus(data);

      const resolvedId = getEventIdFromResponse(data) || id;
      setEventId(resolvedId);
    }
  }

  async function handleCreateEvent() {
    const payload = {
      name: eventForm.eventName,
      eventDate: new Date(eventForm.weddingDate).toISOString(),
    };

    const data = await runAction(
      () => createBridalEvent(payload),
      "Bridal party event created"
    );

    if (data) {
      setEventStatus(data);

      const newEventId = getEventIdFromResponse(data);

      if (newEventId) {
        setEventId(newEventId);
        await refreshDashboard(newEventId);
      }
    }
  }

  async function handleInvite() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    const email = inviteForm.email.trim();

    if (!email || !email.includes("@") || !email.includes(".")) {
      setApiState({
        loading: false,
        error: "Valid email daalo. Example: testmember20260516@gmail.com",
        success: "",
      });
      return;
    }

    const inviteData = await runAction(
      () =>
        inviteBridalMember({
          eventId,
          email,
        }),
      "Invite sent"
    );

    if (inviteData) {
      setLastInvite(inviteData);

      const token =
        inviteData?.token ||
        inviteData?.inviteToken ||
        inviteData?.joinToken ||
        inviteData?.data?.token ||
        "";

      if (token) {
        setJoinToken(token);
      }
    }

    setInviteForm({ name: "", email: "", role: "BRIDESMAID" });
    await refreshDashboard(eventId);
  }

  async function handleJoinInvite() {
    if (!joinToken.trim()) {
      setApiState({
        loading: false,
        error:
          "Join token missing hai. Invite ke baad token auto-fill hona chahiye.",
        success: "",
      });
      return;
    }

    await runAction(
      () => joinBridalParty(joinToken.trim()),
      "Member joined event"
    );

    await refreshDashboard(eventId);
  }

  async function handleSubmitSize() {
    if (!memberAction.memberId) {
      setApiState({
        loading: false,
        error: "Member ID missing hai. Pehle member ke saamne Select dabao.",
        success: "",
      });
      return;
    }

    if (!memberAction.size) {
      setApiState({
        loading: false,
        error: "Size missing hai.",
        success: "",
      });
      return;
    }

    const backendSize = String(memberAction.size).includes("/")
      ? String(memberAction.size).split("/").pop()?.trim() || "A8"
      : String(memberAction.size).trim();

    await runAction(
      () =>
        submitMemberSize({
          memberId: memberAction.memberId,
          size: backendSize,
          preference: memberAction.color || "Sage",
        }),
      "Size submitted"
    );

    if (eventId) {
      await refreshDashboard(eventId);
    }
  }

  async function handleAssignDress() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    if (!memberAction.memberId) {
      setApiState({
        loading: false,
        error: "Member ID missing hai. Members list me Select dabao.",
        success: "",
      });
      return;
    }

    if (!memberAction.productId) {
      setApiState({
        loading: false,
        error: "Product ID missing hai.",
        success: "",
      });
      return;
    }

    if (!memberAction.variantId) {
      setApiState({
        loading: false,
        error: "Variant ID missing hai.",
        success: "",
      });
      return;
    }

    const data = await runAction(
      () =>
        assignDressToMember({
          memberId: memberAction.memberId,
          productId: memberAction.productId,
          variantId: memberAction.variantId,
        }),
      "Dress assigned"
    );

    const selectionId =
      data?.selectionId ||
      data?.id ||
      data?.data?.selectionId ||
      data?.data?.id ||
      "";

    if (selectionId) {
      setMemberAction((prev) => ({
        ...prev,
        selectionId,
      }));
    }

    await refreshDashboard(eventId);
  }

  async function handleApprove() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    if (!memberAction.memberId) {
      setApiState({
        loading: false,
        error: "Member ID missing hai. Members list me Select dabao.",
        success: "",
      });
      return;
    }

    if (!memberAction.selectionId) {
      setApiState({
        loading: false,
        error:
          "Selection ID missing hai. Pehle Assign Dress karo. Assign response se selectionId auto-fill hona chahiye.",
        success: "",
      });
      return;
    }

    await runAction(
      () =>
        approveDressSelection({
          memberId: memberAction.memberId,
          selectionId: memberAction.selectionId,
        }),
      "Dress approved"
    );

    await refreshDashboard(eventId);
  }

  async function handlePayment() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    if (!memberAction.memberId) {
      setApiState({
        loading: false,
        error: "Member ID missing hai. Approved member ke saamne Select dabao.",
        success: "",
      });
      return;
    }

    if (!memberAction.selectionId) {
      setApiState({
        loading: false,
        error: "Selection ID missing hai. Approved member select karo.",
        success: "",
      });
      return;
    }

    const data = await runAction(
      () =>
        createBridalPayment({
          eventId,
          memberId: memberAction.memberId,
          selectionId: memberAction.selectionId,
          amount: Number(memberAction.amount) || 249,
        }),
      "Payment created"
    );

    if (data) {
      setPaymentInfo(data);
      console.log("Payment create response:", data);
    }

    await refreshDashboard(eventId);
  }

  async function handlePaymentSuccess() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai.",
        success: "",
      });
      return;
    }

    await runAction(() => bridalPaymentSuccess(), "Payment marked successful");

    await refreshDashboard(eventId);
  }

  async function handleCreateShipment() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    if (eventStatus && eventStatus.isReadyForOrder === false) {
      setApiState({
        loading: false,
        error:
          "Shipment create nahi ho sakta. Backend ke according event abhi ready for order nahi hai. Pehle members approve/payment complete hone chahiye.",
        success: "",
      });
      return;
    }

    const data = await runAction(
      () => createShipment(eventId),
      "Shipment created"
    );

    if (data) {
      setShipment(data);
      console.log("Shipment create response:", data);
    }

    await refreshDashboard(eventId);
  }

  async function handleGetShipment() {
    if (!eventId) {
      setApiState({
        loading: false,
        error: "Event ID missing hai. Pehle event create/load karo.",
        success: "",
      });
      return;
    }

    const data = await runAction(
      () => getShipment(eventId),
      "Shipment fetched"
    );

    if (data) {
      setShipment(data);
      console.log("Shipment get response:", data);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-neutral-950">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-[#fbfaf6]">
        <div className="absolute left-0 top-0 h-72 w-72 bg-[#d8c4a2]/30 blur-3xl" />
        <div className="absolute right-0 top-8 h-80 w-80 bg-[#7f8f69]/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-4 py-8 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
              Shahsi Bridal Party
            </p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-[#24334f] md:text-6xl">
              Dynamic Bridal Party Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 md:text-base">
              Manage bridal events, invites, member sizes, dress assignments, approvals, payments, and shipment readiness from one workspace.
            </p>
          </div>

          <button
            onClick={() => refreshDashboard()}
            className="inline-flex items-center justify-center gap-2 border border-[#24334f] bg-[#24334f] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-white hover:text-[#24334f]"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Status
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8">
        {apiState.error && (
          <div className="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {apiState.error}
          </div>
        )}

        {apiState.success && (
          <div className="mb-5 border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 shadow-sm">
            {apiState.success}
          </div>
        )}

        {apiState.loading && (
          <div className="mb-5 inline-flex items-center gap-2 border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            API working...
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-5">
            <Card>
              <SectionTitle icon={<Plus className="h-5 w-5" />} title="Create Event" subtitle="POST /bridal-party/event" dark />

              <div className="grid gap-3">
                <Input
                  label="Event Name"
                  value={eventForm.eventName}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, eventName: value }))
                  }
                />

                <Input
                  label="Bride Name"
                  value={eventForm.brideName}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, brideName: value }))
                  }
                />

                <Input
                  label="Wedding Date"
                  type="date"
                  value={eventForm.weddingDate}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, weddingDate: value }))
                  }
                />

                <Input
                  label="Palette comma separated"
                  value={eventForm.palette}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, palette: value }))
                  }
                />

                <button
                  onClick={handleCreateEvent}
                  className="bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24334f]"
                >
                  Create Bridal Party Event
                </button>
              </div>
            </Card>

            <Card>
              <SectionTitle icon={<CalendarDays className="h-5 w-5" />} title="Load Event" subtitle="GET /bridal-party/status/:eventId" />

              <Input
                label="Event ID"
                value={eventId}
                onChange={setEventId}
                placeholder="Paste eventId here"
              />

              <button
                onClick={() => refreshDashboard()}
                className="mt-3 w-full border border-neutral-950 px-5 py-3 text-sm font-semibold transition hover:bg-neutral-950 hover:text-white"
              >
                Load Dashboard
              </button>
            </Card>

            <Card>
              <SectionTitle icon={<UserPlus className="h-5 w-5" />} title="Invite Member" subtitle="POST /bridal-party/invite" />

              <div className="grid gap-3">
                <Input
                  label="Name"
                  value={inviteForm.name}
                  onChange={(value) =>
                    setInviteForm((prev) => ({ ...prev, name: value }))
                  }
                />

                <Input
                  label="Email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(value) =>
                    setInviteForm((prev) => ({ ...prev, email: value }))
                  }
                />

                <Input
                  label="Role"
                  value={inviteForm.role}
                  onChange={(value) =>
                    setInviteForm((prev) => ({ ...prev, role: value }))
                  }
                />

                <button
                  onClick={handleInvite}
                  className="bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24334f]"
                >
                  Send Invite
                </button>
              </div>
            </Card>

            <Card>
              <SectionTitle icon={<UserPlus className="h-5 w-5" />} title="Join Invite" subtitle="POST /bridal-party/join/:token" />

              <div className="grid gap-3">
                <Input
                  label="Join Token"
                  value={joinToken}
                  onChange={setJoinToken}
                  placeholder="Invite token auto-fill hoga"
                />

                {lastInvite?.joinUrl && (
                  <div className="bg-[#fbfaf6] p-4 text-sm ring-1 ring-neutral-200">
                    <p className="mb-1 font-semibold">Join URL</p>
                    <p className="break-all text-neutral-600">
                      {lastInvite.joinUrl}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleJoinInvite}
                  className="bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24334f]"
                >
                  Join Event
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <DashboardSummary eventStatus={eventStatus} members={members} />

            <Card>
              <SectionTitle icon={<Users className="h-5 w-5" />} title="Members" subtitle="Dynamic data from backend" />

              {members.length === 0 ? (
                <EmptyState text="No members found. Invite member or refresh dashboard." />
              ) : (
                <div className="grid gap-3">
                  {members.map((member, index) => {
                    const memberId =
                      member.id || member.memberId || String(index);

                    return (
                      <div
                        key={memberId}
                        className="bg-[#fbfaf6] p-4 ring-1 ring-neutral-200 transition hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <h3 className="font-semibold">
                              {member.name ||
                                member.email ||
                                `Member ${index + 1}`}
                            </h3>
                            <p className="text-sm text-neutral-500">
                              {member.role || "Bridesmaid"} ·{" "}
                              {member.email || "No email"}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setMemberAction((prev) => ({
                                ...prev,
                                memberId,
                                productId:
                                  member.selection?.productId ||
                                  prev.productId,
                                variantId:
                                  member.selection?.variantId ||
                                  prev.variantId,
                                selectionId:
                                  member.selection?.id || prev.selectionId,
                                dressName: member.dress || "",
                                color: member.color || prev.color || "Sage",
                                size: member.size || prev.size || "A8",
                              }))
                            }
                            className="border border-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-neutral-950 hover:text-white"
                          >
                            Select
                          </button>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
                          <StatusPill
                            label="Dress"
                            value={member.selection ? "Selected" : "Not selected"}
                          />

                          <StatusPill
                            label="Size"
                            value={
                              member.status === "size_submitted" ||
                              member.status === "approved" ||
                              member.selection
                                ? "Submitted"
                                : "Pending"
                            }
                          />

                          <StatusPill
                            label="Approval"
                            value={
                              member.selection?.status ||
                              member.status ||
                              "pending"
                            }
                          />

                          <StatusPill
                            label="Payment"
                            value={member.payment || "pending"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <SectionTitle icon={<Sparkles className="h-5 w-5" />} title="Member Actions" subtitle="Size, assign, approve, payment" />

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Member ID"
                  value={memberAction.memberId}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, memberId: value }))
                  }
                />

                <Input
                  label="Product ID"
                  value={memberAction.productId}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, productId: value }))
                  }
                  placeholder="Backend productId"
                />

                <Input
                  label="Variant ID"
                  value={memberAction.variantId}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, variantId: value }))
                  }
                  placeholder="Backend variantId"
                />

                <Input
                  label="Selection ID"
                  value={memberAction.selectionId}
                  onChange={(value) =>
                    setMemberAction((prev) => ({
                      ...prev,
                      selectionId: value,
                    }))
                  }
                  placeholder="Auto-fill after assign"
                />

                <Input
                  label="Dress Name"
                  value={memberAction.dressName}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, dressName: value }))
                  }
                />

                <Input
                  label="Color"
                  value={memberAction.color}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, color: value }))
                  }
                />

                <Input
                  label="Size"
                  value={memberAction.size}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, size: value }))
                  }
                />

                <Input
                  label="Amount"
                  value={memberAction.amount}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, amount: value }))
                  }
                />

                <Input
                  label="Bust"
                  value={memberAction.bust}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, bust: value }))
                  }
                />

                <Input
                  label="Waist"
                  value={memberAction.waist}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, waist: value }))
                  }
                />

                <Input
                  label="Hip"
                  value={memberAction.hip}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, hip: value }))
                  }
                />

                <Input
                  label="Height"
                  value={memberAction.height}
                  onChange={(value) =>
                    setMemberAction((prev) => ({ ...prev, height: value }))
                  }
                  placeholder="5 ft 6 in"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <ActionButton
                  icon={<Ruler className="h-4 w-4" />}
                  onClick={handleSubmitSize}
                >
                  Submit Size
                </ActionButton>

                <ActionButton
                  icon={<ShoppingBag className="h-4 w-4" />}
                  onClick={handleAssignDress}
                >
                  Assign Dress
                </ActionButton>

                <ActionButton
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={handleApprove}
                >
                  Approve
                </ActionButton>

                <ActionButton
                  icon={<CreditCard className="h-4 w-4" />}
                  onClick={handlePayment}
                >
                  Mark Paid
                </ActionButton>

                <ActionButton
                  icon={<CreditCard className="h-4 w-4" />}
                  onClick={handlePaymentSuccess}
                >
                  Payment Success
                </ActionButton>
              </div>

              {paymentInfo && (
                <div className="mt-5 bg-[#fbfaf6] p-4 text-sm ring-1 ring-neutral-200">
                  <p className="font-semibold">Payment Created</p>
                  <p className="mt-1">Amount: {paymentInfo.amount}</p>
                  <p>Currency: {paymentInfo.currency}</p>
                  <p className="break-all">
                    Payment ID: {paymentInfo.paymentId}
                  </p>
                  <p className="break-all">
                    Stripe Intent: {paymentInfo.stripePaymentIntentId}
                  </p>
                </div>
              )}
            </Card>

            <Card>
              <SectionTitle icon={<Truck className="h-5 w-5" />} title="Shipment" subtitle="POST/GET /bridal-party/shipment/:eventId" />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleCreateShipment}
                  className="bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24334f]"
                >
                  Create Shipment
                </button>

                <button
                  onClick={handleGetShipment}
                  className="border border-neutral-950 px-5 py-3 text-sm font-semibold transition hover:bg-neutral-950 hover:text-white"
                >
                  Get Shipment
                </button>
              </div>

              {shipment && (
                <pre className="mt-4 max-h-[260px] overflow-auto bg-neutral-950 p-4 text-xs text-white">
                  {JSON.stringify(shipment, null, 2)}
                </pre>
              )}
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`${dark ? "bg-neutral-950 text-white" : "bg-[#f7f2ea] text-neutral-950"} p-3 ring-1 ring-neutral-200`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}

function DashboardSummary({
  eventStatus,
  members,
}: {
  eventStatus: BridalEventStatus | null;
  members: BridalMember[];
}) {
  const totalMembers =
    eventStatus?.totalMembers ??
    eventStatus?.data?.totalMembers ??
    members.length;

  const sizeDone =
    eventStatus?.sizeSubmitted ??
    eventStatus?.data?.sizeSubmitted ??
    members.filter((m) => m.size && String(m.size).toLowerCase() !== "pending")
      .length;

  const approved =
    eventStatus?.approved ??
    eventStatus?.data?.approved ??
    members.filter(
      (m) => m.status === "approved" || m.selection?.status === "approved"
    ).length;

  const paid =
    eventStatus?.paid ??
    eventStatus?.data?.paid ??
    members.filter((m) => String(m.payment).toLowerCase() === "paid").length;

  return (
    <div className="bg-neutral-950 p-6 text-white shadow-sm">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Event Dashboard
          </p>

          <h2 className="mt-2 font-serif text-4xl font-normal tracking-tight">
            {eventStatus?.eventName ||
              eventStatus?.data?.eventName ||
              eventStatus?.data?.event?.eventName ||
              "Bridal Party"}
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Wedding Date:{" "}
            {eventStatus?.eventDate
              ? new Date(eventStatus.eventDate).toLocaleDateString()
              : eventStatus?.weddingDate ||
                eventStatus?.data?.eventDate ||
                eventStatus?.data?.weddingDate ||
                "Not available"}
          </p>
        </div>

        <div className="bg-white/10 px-4 py-3 text-sm ring-1 ring-white/10">
          Event ID:{" "}
          <span className="font-semibold">
            {eventStatus?.eventId ||
              eventStatus?.id ||
              eventStatus?.data?.eventId ||
              "N/A"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <SummaryBox
          icon={<Users className="h-4 w-4" />}
          label="Members"
          value={totalMembers}
        />

        <SummaryBox
          icon={<Ruler className="h-4 w-4" />}
          label="Size Done"
          value={sizeDone}
        />

        <SummaryBox
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Approved"
          value={approved}
        />

        <SummaryBox
          icon={<CreditCard className="h-4 w-4" />}
          label="Paid"
          value={paid}
        />
      </div>
    </div>
  );
}

function SummaryBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white/10 p-4 ring-1 ring-white/10">
      <div className="mb-2 flex items-center gap-2 text-white/70">
        {icon}
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:bg-white"
      />
    </label>
  );
}

function ActionButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 border border-neutral-950 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-950 hover:text-white"
    >
      {icon}
      {children}
    </button>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 ring-1 ring-neutral-200">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-[#fbfaf6] p-6 text-center text-sm text-neutral-500 ring-1 ring-neutral-200">
      <XCircle className="mx-auto mb-2 h-5 w-5" />
      {text}
    </div>
  );
}
