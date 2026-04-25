import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getAllBookings, getBookingAnalytics, reviewBooking } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";
import { BOOKING_STATUSES } from "../../utils/constants";

function statusBadge(status) {
  const styles = {
    PENDING: "bg-violet-100 text-violet-800 border-violet-200",
    APPROVED: "bg-purple-100 text-purple-800 border-purple-200",
    REJECTED: "bg-violet-50 text-violet-700 border-violet-200",
    CANCELLED: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

function ActionIcon({ type }) {
  if (type === "download") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v11" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  if (type === "filter") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16l-6 7v5l-4 2v-7z" />
      </svg>
    );
  }

  if (type === "list") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6h11" />
        <path d="M9 12h11" />
        <path d="M9 18h11" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      {type === "check" ? <path d="m8.5 12 2.2 2.3 4.8-5" /> : <>
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </>}
    </svg>
  );
}

function formatTimestamp(value) {
  if (!value) {
    return "N/A";
  }

  return value.replace("T", " ");
}

function buildCsv(bookings) {
  const rows = [
    [
      "Booking ID",
      "Status",
      "Resource",
      "Location",
      "Requester",
      "Email",
      "Booking Date",
      "Start Time",
      "End Time",
      "Attendees",
      "Purpose",
      "Admin Reason",
      "Reviewed By",
      "Created At"
    ],
    ...bookings.map((booking) => [
      booking.id,
      booking.status,
      booking.resourceName,
      booking.resourceLocation,
      booking.requesterName,
      booking.requesterEmail,
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      booking.expectedAttendees,
      booking.purpose,
      booking.adminReason || "",
      booking.reviewedByName || "",
      formatTimestamp(booking.createdAt)
    ])
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

function deriveAnalyticsFromBookings(bookings) {
  const today = new Date().toISOString().slice(0, 10);
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const approvedBookings = bookings.filter((booking) => booking.status === "APPROVED").length;
  const rejectedBookings = bookings.filter((booking) => booking.status === "REJECTED").length;
  const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED").length;
  const todaysBookings = bookings.filter((booking) => booking.bookingDate === today).length;
  const upcomingApprovedBookings = bookings.filter(
    (booking) => booking.status === "APPROVED" && booking.bookingDate >= today
  ).length;
  const approvalRate = totalBookings === 0 ? 0 : (approvedBookings * 100) / totalBookings;

  const resourceMap = bookings.reduce((accumulator, booking) => {
    const current = accumulator.get(booking.resourceId) || {
      resourceId: booking.resourceId,
      resourceName: booking.resourceName,
      totalBookings: 0,
      approvedBookings: 0
    };

    current.totalBookings += 1;
    if (booking.status === "APPROVED") {
      current.approvedBookings += 1;
    }

    accumulator.set(booking.resourceId, current);
    return accumulator;
  }, new Map());

  const topResources = [...resourceMap.values()]
    .sort((left, right) => {
      if (right.totalBookings !== left.totalBookings) {
        return right.totalBookings - left.totalBookings;
      }

      if (right.approvedBookings !== left.approvedBookings) {
        return right.approvedBookings - left.approvedBookings;
      }

      return left.resourceName.localeCompare(right.resourceName);
    })
    .slice(0, 5);

  return {
    totalBookings,
    pendingBookings,
    approvedBookings,
    rejectedBookings,
    cancelledBookings,
    todaysBookings,
    upcomingApprovedBookings,
    approvalRate,
    topResources
  };
}

function BookingApproval() {
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState({
    status: "PENDING",
    resourceId: "",
    requesterId: "",
    bookingDate: ""
  });
  const [reviewState, setReviewState] = useState({});
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [reasonDialog, setReasonDialog] = useState({ open: false, bookingId: null, action: null, reason: "" });
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBookings = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== "")
      );
      const [bookingResult, analyticsResult] = await Promise.allSettled([
        getAllBookings(cleanedFilters),
        getBookingAnalytics(currentUser.id)
      ]);

      if (bookingResult.status !== "fulfilled") {
        throw bookingResult.reason;
      }

      setBookings(bookingResult.value);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value);
      } else {
        setAnalytics(deriveAnalyticsFromBookings(bookingResult.value));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load booking queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialFilters = {
      status: "PENDING",
      resourceId: "",
      requesterId: "",
      bookingDate: ""
    };

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [bookingResult, analyticsResult] = await Promise.allSettled([
          getAllBookings({ status: "PENDING" }),
          getBookingAnalytics(currentUser.id)
        ]);

        if (bookingResult.status !== "fulfilled") {
          throw bookingResult.reason;
        }

        setBookings(bookingResult.value);

        if (analyticsResult.status === "fulfilled") {
          setAnalytics(analyticsResult.value);
        } else {
          setAnalytics(deriveAnalyticsFromBookings(bookingResult.value));
        }

        setFilters(initialFilters);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load booking queue");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser.id]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleReviewChange = (bookingId, field, value) => {
    setReviewState((previous) => ({
      ...previous,
      [bookingId]: {
        reason: previous[bookingId]?.reason || "",
        [field]: value
      }
    }));
  };

  const handleQuickReview = async (bookingId, status, reason) => {
    const entry = reviewState[bookingId] || { reason: "" };
    const finalReason = reason ?? entry.reason;

    try {
      await reviewBooking(bookingId, {
        adminId: currentUser.id,
        status,
        reason: finalReason
      });
      toast.success(`Booking #${bookingId} ${status.toLowerCase()}`);
      setExpandedBookingId(null);
      loadBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to review booking");
    }
  };

  const openReasonDialog = (bookingId, action) => {
    setReasonDialog({ open: true, bookingId, action, reason: "" });
  };

  const closeReasonDialog = () => {
    setReasonDialog({ open: false, bookingId: null, action: null, reason: "" });
  };

  const submitReasonDialog = async () => {
    const reason = reasonDialog.reason.trim();

    if (!reason) {
      toast.error("Reason is required");
      return;
    }

    if (reasonDialog.action === "REJECTED") {
      await handleQuickReview(reasonDialog.bookingId, "REJECTED", reason);
    }

    closeReasonDialog();
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

  const handleQuickTab = (status) => {
    const updatedFilters = {
      ...filters,
      status
    };
    setFilters(updatedFilters);
    loadBookings(updatedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "PENDING",
      resourceId: "",
      requesterId: "",
      bookingDate: ""
    };
    setFilters(resetFilters);
    loadBookings(resetFilters);
  };

  const handleExportCsv = () => {
    if (!bookings.length) {
      toast.error("No booking records available to export");
      return;
    }

    const csv = buildCsv(bookings);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "booking-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Booking report exported");
  };

  const summaryCards = analytics
    ? [
        {
          label: "TOTAL BOOKINGS",
          value: analytics.totalBookings,
          accent: "blue",
          glow: "from-violet-100 via-purple-50 to-white",
          icon: "list"
        },
        {
          label: "PENDING ACTION",
          value: analytics.pendingBookings,
          accent: "amber",
          glow: "from-violet-100 via-purple-50 to-white",
          icon: "clock"
        },
        {
          label: "APPROVED",
          value: analytics.approvedBookings,
          accent: "green",
          glow: "from-purple-100 via-violet-50 to-white",
          icon: "check"
        },
        {
          label: "DECLINED",
          value: analytics.rejectedBookings,
          accent: "pink",
          glow: "from-violet-100 via-purple-50 to-white",
          icon: "x"
        }
      ]
    : [];

  const topTabs = [
    {
      key: "",
      label: "All Records",
      icon: "list",
      count: analytics?.totalBookings ?? 0
    },
    {
      key: "PENDING",
      label: "Requires Approval",
      icon: "clock",
      count: analytics?.pendingBookings ?? 0
    },
    {
      key: "APPROVED",
      label: "Approved",
      icon: "check",
      count: analytics?.approvedBookings ?? 0
    },
    {
      key: "REJECTED",
      label: "Declined",
      icon: "x",
      count: analytics?.rejectedBookings ?? 0
    }
  ];

  const currentQuickTab = filters.status === "CANCELLED" ? "" : filters.status;
  const visibleBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [bookings]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] border border-violet-100 bg-[linear-gradient(180deg,_#ffffff,_#f8f4ff)] p-6 shadow-panel sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">
              Booking Administration
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-violet-950">
              Request Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-[15px]">
              Oversee room and resource requests with a calm, high-contrast purple workspace built
              for fast admin review.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row lg:items-center">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center justify-center rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.22)] transition hover:bg-violet-800"
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {topTabs.map((tab) => {
            const isActive = currentQuickTab === tab.key;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleQuickTab(tab.key)}
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-violet-300 bg-violet-100 text-violet-900 shadow-[0_10px_24px_rgba(196,181,253,0.45)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isActive ? "bg-white text-violet-700" : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-violet-950">Current Queue</h2>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                ACTIVE
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Showing {currentQuickTab ? currentQuickTab.toLowerCase() : "all"} bookings in newest-first order.
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-500">Newest First</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {loading ? (
          <div className="xl:col-span-3 rounded-[32px] border border-violet-100 bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            Loading booking records...
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="xl:col-span-3 rounded-[32px] border border-violet-100 bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            No bookings match the current filter.
          </div>
        ) : (
          visibleBookings.map((booking) => {
            const isExpanded = expandedBookingId === booking.id;
            const requestLetter = (booking.requesterName || booking.resourceName || "?").charAt(0);
            const reviewEntry = reviewState[booking.id] || { reason: "" };
            const isPending = booking.status === "PENDING";

            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_18px_38px_rgba(124,58,237,0.10)]"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {requestLetter}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="truncate text-lg font-semibold text-violet-950">
                            {booking.requesterName || booking.resourceName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {booking.resourceName} · {booking.resourceLocation}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-4 rounded-[22px] border border-violet-100 bg-violet-50/70 p-4 text-sm text-slate-600">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <p>
                            <span className="font-semibold text-slate-500">Time</span> - {booking.bookingDate} · {booking.startTime} - {booking.endTime}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Booked By</span> - {booking.requesterName}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Location</span> - {booking.resourceLocation}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Purpose</span> - {booking.purpose}
                          </p>
                          <p className="sm:col-span-2">
                            <span className="font-semibold text-slate-500">Reason</span> - {booking.cancellationReason || booking.adminReason || "No reason added"}
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="mt-4 space-y-3 rounded-[22px] border border-violet-100 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-violet-900">Requester:</span> {booking.requesterEmail}
                            </p>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-violet-900">Reviewed by:</span> {booking.reviewedByName || "Not reviewed"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                              Admin Note
                            </p>
                            <textarea
                              rows="3"
                              placeholder="Add a short admin note before approving or rejecting"
                              value={reviewEntry.reason}
                              onChange={(event) => handleReviewChange(booking.id, "reason", event.target.value)}
                              disabled={!isPending}
                              className="mt-2 w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 disabled:cursor-not-allowed disabled:bg-white"
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickReview(booking.id, "APPROVED", reviewEntry.reason)}
                          disabled={!isPending}
                          className="rounded-full border border-violet-200 bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ✓ Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => openReasonDialog(booking.id, "REJECTED")}
                          disabled={!isPending}
                          className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {reasonDialog.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 px-4">
          <div className="w-full max-w-lg rounded-[28px] border border-violet-100 bg-white p-6 shadow-[0_24px_60px_rgba(76,29,149,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
                  Add Reason
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-violet-950">
                  Enter rejection reason
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Please add a short reason before rejecting this booking.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReasonDialog}
                className="rounded-full border border-violet-200 px-3 py-1 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Close
              </button>
            </div>

            <textarea
              rows="5"
              value={reasonDialog.reason}
              onChange={(event) =>
                setReasonDialog((previous) => ({ ...previous, reason: event.target.value }))
              }
              placeholder="Type the reason here..."
              className="mt-5 w-full rounded-[22px] border border-violet-200 bg-violet-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReasonDialog}
                className="rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReasonDialog}
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

export default BookingApproval;
