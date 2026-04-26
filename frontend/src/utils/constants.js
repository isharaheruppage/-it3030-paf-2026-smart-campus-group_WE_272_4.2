export const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081"}/api`;

export const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export const REVIEWABLE_STATUSES = ["APPROVED", "REJECTED"];

export const RESOURCE_OPTIONS = [
  { id: 1, name: "Lab 3A", capacity: 40, location: "Engineering Building - Floor 3" },
  { id: 2, name: "Conference Room B", capacity: 12, location: "Administration Block" }
];

export const TIME_SLOT_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM"
];
