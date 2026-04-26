import axios from "axios";

import { API_BASE_URL } from "../utils/constants";

const bookingClient = axios.create({
  baseURL: API_BASE_URL
});

const TOKEN_KEYS = ["smart-campus-booking-token", "token"];

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
}

function getAuthHeaders(includeJson = false) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Please sign in again to access bookings.");
  }

  return {
    Authorization: `Bearer ${token}`,
    ...(includeJson ? { "Content-Type": "application/json" } : {})
  };
}

export async function createBooking(payload) {
  const response = await bookingClient.post("/bookings", payload, {
    headers: getAuthHeaders(true)
  });
  return response.data;
}

export async function updateBooking(bookingId, payload) {
  const response = await bookingClient.put(`/bookings/${bookingId}`, payload, {
    headers: getAuthHeaders(true)
  });
  return response.data;
}

export async function getAllBookings(filters = {}) {
  const response = await bookingClient.get("/bookings", {
    params: filters,
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getBookingsByRequester(requesterId) {
  const response = await bookingClient.get(`/bookings/users/${requesterId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getBookingById(bookingId) {
  const response = await bookingClient.get(`/bookings/${bookingId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getBookingAnalytics(adminId) {
  const response = await bookingClient.get("/bookings/admin/analytics", {
    params: { adminId },
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function reviewBooking(bookingId, payload) {
  const response = await bookingClient.patch(`/bookings/${bookingId}/review`, payload, {
    headers: getAuthHeaders(true)
  });
  return response.data;
}

export async function cancelBooking(bookingId, requesterId, reason) {
  const response = await bookingClient.patch(`/bookings/${bookingId}/cancel`, null, {
    headers: getAuthHeaders(),
    params: { requesterId, reason }
  });
  return response.data;
}

export async function deleteBooking(bookingId, requesterId) {
  await bookingClient.delete(`/bookings/${bookingId}`, {
    headers: getAuthHeaders(),
    params: { requesterId }
  });
}

export async function checkAvailability({ resourceId, bookingDate, startTime, endTime, excludeBookingId }) {
  const params = { resourceId, bookingDate, startTime, endTime };
  if (excludeBookingId) {
    params.excludeBookingId = excludeBookingId;
  }

  const response = await bookingClient.get("/bookings/availability", {
    params,
    headers: getAuthHeaders()
  });

  return response.data;
}
