import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { cancelBooking, getAllBookings, getBookingsByRequester } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";

function statusBadge(status) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-rose-100 text-rose-800",
    CANCELLED: "bg-slate-200 text-slate-700"
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function BookingList() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId, currentUser.id);
      toast.success("Booking cancelled");
      loadBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to cancel booking");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              {currentUser.role === "ADMIN" ? "Admin View" : "User View"}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
              {currentUser.role === "ADMIN" ? "All bookings" : "My bookings"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {currentUser.role === "ADMIN"
                ? "Inspect the full booking history across users and resources."
                : "Track each request status and cancel approved bookings when needed."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh List
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-900 text-left text-sm text-white">
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
                      <p className="font-semibold text-ink">#{booking.id} · {booking.resourceName}</p>
                      <p className="mt-1 text-slate-500">{booking.resourceLocation}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                        {booking.resourceType}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-medium text-ink">{booking.requesterName}</p>
                      <p className="mt-1 text-slate-500">{booking.requesterEmail}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-medium text-ink">{booking.bookingDate}</p>
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
                      {booking.adminReason || "No reason added"}
                    </td>
                    <td className="px-6 py-5 align-top">
                      {currentUser.role === "USER" && booking.status === "APPROVED" ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default BookingList;
