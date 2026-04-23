import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAllBookings, reviewBooking } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";
import { BOOKING_STATUSES, REVIEWABLE_STATUSES } from "../../utils/constants";

function BookingApproval() {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState({
    status: "PENDING",
    resourceId: "",
    requesterId: "",
    bookingDate: ""
  });
  const [reviewState, setReviewState] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== "")
      );
      const data = await getAllBookings(cleanedFilters);
      setBookings(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load booking queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleReviewChange = (bookingId, field, value) => {
    setReviewState((previous) => ({
      ...previous,
      [bookingId]: {
        status: previous[bookingId]?.status || "APPROVED",
        reason: previous[bookingId]?.reason || "",
        [field]: value
      }
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    loadBookings(filters);
  };

  const handleReview = async (bookingId) => {
    const entry = reviewState[bookingId] || { status: "APPROVED", reason: "" };

    try {
      await reviewBooking(bookingId, {
        adminId: currentUser.id,
        status: entry.status,
        reason: entry.reason
      });
      toast.success(`Booking #${bookingId} ${entry.status.toLowerCase()}`);
      loadBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to review booking");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-8 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Admin Booking Workflow
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Review and manage bookings</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Filter the queue, inspect requester details, and move pending bookings to approved or
          rejected with an admin reason.
        </p>

        <form onSubmit={handleApplyFilters} className="mt-8 grid gap-4 lg:grid-cols-5">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:bg-white"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="resourceId"
            placeholder="Resource ID"
            value={filters.resourceId}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:bg-white"
          />

          <input
            type="number"
            name="requesterId"
            placeholder="Requester ID"
            value={filters.requesterId}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:bg-white"
          />

          <input
            type="date"
            name="bookingDate"
            value={filters.bookingDate}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:bg-white"
          />

          <button
            type="submit"
            className="rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Apply Filters
          </button>
        </form>
      </section>

      <section className="grid gap-5">
        {loading ? (
          <div className="rounded-[32px] bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            Loading booking queue...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            No bookings match the current filters.
          </div>
        ) : (
          bookings.map((booking) => {
            const reviewEntry = reviewState[booking.id] || { status: "APPROVED", reason: "" };

            return (
              <article
                key={booking.id}
                className="rounded-[32px] bg-white p-7 shadow-panel"
              >
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        Booking #{booking.id}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-semibold text-ink">
                        {booking.resourceName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.resourceLocation} · {booking.resourceType}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-ink">Requester:</span> {booking.requesterName}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Email:</span> {booking.requesterEmail}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Date:</span> {booking.bookingDate}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Time:</span> {booking.startTime} - {booking.endTime}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Attendees:</span> {booking.expectedAttendees}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Current reason:</span> {booking.adminReason || "N/A"}
                      </p>
                    </div>

                    <p className="rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-ink">Purpose:</span> {booking.purpose}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-slate-50 p-5">
                    <h3 className="font-display text-xl font-semibold text-ink">Admin action</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Only pending bookings can be reviewed by the backend.
                    </p>

                    <div className="mt-6 space-y-4">
                      <select
                        value={reviewEntry.status}
                        onChange={(event) =>
                          handleReviewChange(booking.id, "status", event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                      >
                        {REVIEWABLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <textarea
                        rows="4"
                        placeholder="Add an admin reason"
                        value={reviewEntry.reason}
                        onChange={(event) =>
                          handleReviewChange(booking.id, "reason", event.target.value)
                        }
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                      />

                      <button
                        type="button"
                        onClick={() => handleReview(booking.id)}
                        className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

export default BookingApproval;
