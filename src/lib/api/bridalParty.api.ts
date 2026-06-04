import { apiRequest } from "./client";

export type BridalMember = {
  id?: string;
  memberId?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;

  selection?: {
    id?: string;
    productId?: string;
    variantId?: string;
    status?: string;
  } | null;

  dress?: string;
  dressId?: string;
  productId?: string;
  color?: string;
  size?: string;
  fitConfidence?: string;
  measurements?: string;
  approval?: string;
  payment?: string;
  total?: string | number;
};

export type BridalEventStatus = {
  id?: string;
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  brideName?: string;
  weddingDate?: string;

  totalMembers?: number;
  joined?: number;
  sizeSubmitted?: number;
  selected?: number;
  approved?: number;
  paid?: number;
  pendingPayments?: number;
  isReadyForOrder?: boolean;

  palette?: string[];
  members?: BridalMember[];
  sharedCart?: any[];
  shipments?: any[];
  payments?: any[];
  approvals?: any[];
  message?: string;
  data?: any;
};

export function createBridalEvent(payload: {
  name: string;
  eventDate: string;
}) {
  return apiRequest<BridalEventStatus>("/bridal-party/event", {
    method: "POST",
    body: payload,
  });
}

export function inviteBridalMember(payload: {
  eventId: string;
  email: string;
}) {
  return apiRequest<any>("/bridal-party/invite", {
    method: "POST",
    body: payload,
  });
}

export function selectDressForMember(payload: {
  eventId: string;
  memberId: string;
  productId: string;
  dressName?: string;
  color?: string;
  size?: string;
}) {
  return apiRequest<any>("/bridal-party/select", {
    method: "POST",
    body: payload,
  });
}

export function markMemberPayment(payload: {
  eventId: string;
  memberId: string;
  amount?: number;
  status?: string;
}) {
  return apiRequest<any>("/bridal-party/pay", {
    method: "POST",
    body: payload,
  });
}

export function joinBridalParty(token: string) {
  return apiRequest<any>(`/bridal-party/join/${token}`, {
    method: "POST",
  });
}

export function submitMemberSize(payload: {
  memberId: string;
  size?: string;
  bust?: number;
  waist?: number;
  hip?: number;
  preference?: string;
}) {
  return apiRequest<any>("/bridal-party/size", {
    method: "POST",
    body: payload,
  });
}

export function assignDressToMember(payload: {
  memberId: string;
  productId: string;
  variantId: string;
}) {
  return apiRequest<any>("/bridal-party/assign", {
    method: "POST",
    body: payload,
  });
}

export function selectAssignedDress(payload: {
  eventId: string;
  memberId: string;
  assignedDressId?: string;
  productId?: string;
}) {
  return apiRequest<any>("/bridal-party/select-assigned", {
    method: "POST",
    body: payload,
  });
}

export function approveDressSelection(payload: {
  memberId: string;
  selectionId: string;
}) {
  return apiRequest<any>("/bridal-party/approve", {
    method: "POST",
    body: payload,
  });
}

// export function bridalPaymentSuccess(payload: {
//   eventId: string;
//   memberId?: string;
//   paymentId?: string;
//   orderId?: string;
// }) {
//   return apiRequest<any>("/bridal-party/payment/success", {
//     method: "POST",
//     body: payload,
//   });
// }

export function getBridalEventStatus(eventId: string) {
  return apiRequest<BridalEventStatus>(`/bridal-party/status/${eventId}`);
}

export function createShipment(eventId: string) {
  return apiRequest<any>(`/bridal-party/shipment/${eventId}`, {
    method: "POST",
  });
}

export function getShipment(eventId: string) {
  return apiRequest<any>(`/bridal-party/shipment/${eventId}`, {
    method: "GET",
  });
}

export function updateShipmentStatus(shipmentId: string, status: string) {
  return apiRequest<any>(
    `/bridal-party/shipment/${shipmentId}/status/${status}`,
    {
      method: "POST",
    }
  );
}

export function createBridalPayment(payload: {
  eventId: string;
  memberId: string;
  selectionId: string;
  amount: number;
}) {
  return apiRequest<any>("/bridal-party/payment/create", {
    method: "POST",
    body: payload,
  });
}

export function bridalPaymentSuccess() {
  return apiRequest<any>("/bridal-party/payment/success", {
    method: "POST",
  });
}