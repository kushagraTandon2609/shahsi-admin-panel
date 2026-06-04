import { apiRequest } from "./client";

export type CartItem = {
  id?: string;
  cartItemId?: string;
  productId?: string;
  product?: any;
  quantity?: number;
  size?: string;
  color?: string;
  price?: number;
  total?: number;
};

export type CartResponse = {
  success?: boolean;
  data?: any;
  cart?: any;
  items?: CartItem[];
};

export type AddCartPayload = {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
};

export function getCart() {
  return apiRequest<CartResponse | CartItem[]>("/cart", {
    method: "GET",
  });
}

export function addToCart(payload: AddCartPayload) {
  return apiRequest<any>("/cart/add", {
    method: "POST",
    body: payload,
  });
}

export function removeCartItem(id: string) {
  return apiRequest<any>(`/cart/remove/${id}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return apiRequest<any>("/cart/clear", {
    method: "DELETE",
  });
}