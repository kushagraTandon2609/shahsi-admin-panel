import { apiRequest } from "./client";

export type AccountUser = {
  id?: string;
  userId?: string;
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
};

export type MeResponse = {
  message?: string;
  user?: AccountUser;
  data?: any;
};

export function getMe() {
  return apiRequest<MeResponse>("/auth/me", {
    method: "GET",
  });
}