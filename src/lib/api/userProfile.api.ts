import { apiRequest } from "./client";

export type UserProfilePayload = {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  bodyType: string;
  fitPreference: string;
};

export function getUserProfile() {
  return apiRequest<any>("/user-profile", {
    method: "GET",
  });
}

export function createUserProfile(payload: UserProfilePayload) {
  return apiRequest<any>("/user-profile", {
    method: "POST",
    body: payload,
  });
}

export function updateUserProfile(payload: UserProfilePayload) {
  return apiRequest<any>("/user-profile", {
    method: "PATCH",
    body: payload,
  });
}