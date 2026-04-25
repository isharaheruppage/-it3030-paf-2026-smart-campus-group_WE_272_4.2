import axios from "axios";

import { API_BASE_URL } from "../utils/constants";

const bookingClient = axios.create({
  baseURL: API_BASE_URL
});

export async function createBooking(payload) {
  const response = await bookingClient.post("/bookings", payload);
  return response.data;
}

export async function getAllBookings(filters = {}) {
  const response = await bookingClient.get("/bookings", { params: filters });
  return response.data;
}

export async function getBookingsByRequester(requesterId) {
  const response = await bookingClient.get(`/bookings/users/${requesterId}`);
  return response.data;
}

export async function getBookingById(bookingId) {
  const response = await bookingClient.get(`/bookings/${bookingId}`);
  return response.data;
}

export async function getBookingAnalytics(adminId) {
  const response = await bookingClient.get("/bookings/admin/analytics", {
    params: { adminId }
  });
  return response.data;
}

export async function reviewBooking(bookingId, payload) {
  const response = await bookingClient.patch(`/bookings/${bookingId}/review`, payload);
  return response.data;
}

export async function cancelBooking(bookingId, requesterId, reason) {
  const response = await bookingClient.patch(`/bookings/${bookingId}/cancel`, null, {
    params: { requesterId, reason }
  });
  return response.data;
}

export async function deleteBooking(bookingId) {
  await bookingClient.delete(`/bookings/${bookingId}`);
}
