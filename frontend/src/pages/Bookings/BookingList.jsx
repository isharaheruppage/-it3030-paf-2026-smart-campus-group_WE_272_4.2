import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { cancelBooking, getAllBookings, getBookingsByRequester } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";

function statusBadge(status) {
  const styles = {
    PENDING: "bg-violet-100 text-violet-800",
    APPROVED: "bg-purple-100 text-purple-800",
    REJECTED: "bg-violet-50 text-violet-700",
    CANCELLED: "bg-slate-200 text-slate-700"
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function BookingList() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null, reason: "" });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data =
        currentUser.role === "ADMIN"
          ? await getAllBookings()
          : await getBookingsByRequester(currentUser.id);
      setBookings(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data =
          currentUser.role === "ADMIN"
            ? await getAllBookings()
            : await getBookingsByRequester(currentUser.id);
        setBookings(data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser.id, currentUser.role]);

  const handleCancel = async (bookingId, reason) => {
    try {
      await cancelBooking(bookingId, currentUser.id, reason);
      toast.success("Booking cancelled");
      loadBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to cancel booking");
    }
  };

  const openCancelDialog = (bookingId) => {
    setCancelDialog({ open: true, bookingId, reason: "" });
  };

  const closeCancelDialog = () => {
    setCancelDialog({ open: false, bookingId: null, reason: "" });
  };

  const submitCancelDialog = async () => {
    const reason = cancelDialog.reason.trim();

    if (!reason) {
      toast.error("Reason is required when cancelling a booking");
      return;
    }

    await handleCancel(cancelDialog.bookingId, reason);
    closeCancelDialog();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-violet-100 bg-white p-7 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
              {currentUser.role === "ADMIN" ? "Admin View" : "User View"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-violet-950">
              {currentUser.role === "ADMIN" ? "All bookings" : "My bookings"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {currentUser.role === "ADMIN"
                ? "Inspect the full booking history across users and resources."
                : "Track each request status and cancel approved bookings when needed."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            Refresh List
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-violet-700 to-purple-700 text-left text-xs uppercase tracking-[0.18em] text-white">
              <tr>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                    No bookings found yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-6 py-5 align-top">
                      <p className="font-semibold text-violet-950">#{booking.id} · {booking.resourceName}</p>
                      <p className="mt-1 text-slate-500">{booking.resourceLocation}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-violet-400">
                        {booking.resourceType}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-medium text-violet-950">{booking.requesterName}</p>
                      <p className="mt-1 text-slate-500">{booking.requesterEmail}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-medium text-violet-950">{booking.bookingDate}</p>
                      <p className="mt-1 text-slate-500">
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="mt-2 text-slate-500">{booking.purpose}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-slate-500">
                      {booking.cancellationReason || booking.adminReason || "No reason added"}
                    </td>
                    <td className="px-6 py-5 align-top">
                      {currentUser.role === "USER" && booking.status === "APPROVED" ? (
                        <button
                          type="button"
                          onClick={() => openCancelDialog(booking.id)}
                          className="rounded-full bg-violet-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-800"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-violet-400">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {cancelDialog.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 px-4">
          <div className="w-full max-w-lg rounded-[28px] border border-violet-100 bg-white p-6 shadow-[0_24px_60px_rgba(76,29,149,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
                  Add Reason
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-violet-950">
                  Enter cancellation reason
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Please add a short reason before cancelling this booking.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCancelDialog}
                className="rounded-full border border-violet-200 px-3 py-1 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Close
              </button>
            </div>

            <textarea
              rows="5"
              value={cancelDialog.reason}
              onChange={(event) =>
                setCancelDialog((previous) => ({ ...previous, reason: event.target.value }))
              }
              placeholder="Type the reason here..."
              className="mt-5 w-full rounded-[22px] border border-violet-200 bg-violet-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCancelDialog}
                className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCancelDialog}
                className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                Submit Reason
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default BookingList;
