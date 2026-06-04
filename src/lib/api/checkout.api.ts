import { apiRequest } from "./client";

export type CheckoutPayload = {
  mode?: "individual" | "group";
  eventId?: string;
  notes?: string;
};

export type CheckoutResponse = {
  success?: boolean;
  data?: {
    orderId?: string;
    paymentUrl?: string;
    paymentSessionId?: string;
    amount?: number;
    status?: string;
  };
  orderId?: string;
  paymentUrl?: string;
  paymentSessionId?: string;
  amount?: number;
  status?: string;
};

export function createCheckout(payload: CheckoutPayload = {}) {
  return apiRequest<CheckoutResponse>("/checkout", {
    method: "POST",
    body: payload,
  });
}