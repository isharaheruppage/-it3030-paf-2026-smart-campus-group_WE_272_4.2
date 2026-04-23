import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getAllBookings, getBookingAnalytics, reviewBooking } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";
import { BOOKING_STATUSES, REVIEWABLE_STATUSES } from "../../utils/constants";

function statusBadge(status) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

function iconClassNames(accent) {
  const styles = {
    blue: "from-violet-600 to-blue-500 shadow-[0_18px_30px_rgba(59,91,246,0.35)]",
    amber: "from-amber-400 to-orange-500 shadow-[0_18px_30px_rgba(251,146,60,0.32)]",
    green: "from-emerald-400 to-teal-500 shadow-[0_18px_30px_rgba(16,185,129,0.32)]",
    pink: "from-fuchsia-500 to-pink-600 shadow-[0_18px_30px_rgba(236,72,153,0.32)]"
  };

  return styles[accent] || styles.blue;
}

function SummaryIcon({ type, accent }) {
  const wrapperClass = `flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br text-white ${iconClassNames(
    accent
  )}`;

  if (type === "list") {
    return (
      <div className={wrapperClass}>
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="M4 6h.01" />
          <path d="M4 12h.01" />
          <path d="M4 18h.01" />
        </svg>
      </div>
    );
  }

  if (type === "clock") {
    return (
      <div className={wrapperClass}>
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      </div>
    );
  }

  if (type === "check") {
    return (
      <div className={wrapperClass}>
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.2 2.3 4.8-5" />
        </svg>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    </div>
  );
}

function ActionIcon({ type }) {
  if (type === "analytics") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V5" />
        <path d="M9 19v-8" />
        <path d="M14 19v-5" />
        <path d="M19 19V9" />
      </svg>
    );
  }

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
    status: "",
    resourceId: "",
    requesterId: "",
    bookingDate: ""
  });
  const [reviewState, setReviewState] = useState({});
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

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
      status: "",
      resourceId: "",
      requesterId: "",
      bookingDate: ""
    };

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [bookingResult, analyticsResult] = await Promise.allSettled([
          getAllBookings(),
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
      status: "",
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
          glow: "from-violet-100 via-blue-50 to-white",
          icon: "list"
        },
        {
          label: "PENDING ACTION",
          value: analytics.pendingBookings,
          accent: "amber",
          glow: "from-amber-100 via-orange-50 to-white",
          icon: "clock"
        },
        {
          label: "APPROVED",
          value: analytics.approvedBookings,
          accent: "green",
          glow: "from-emerald-100 via-cyan-50 to-white",
          icon: "check"
        },
        {
          label: "DECLINED",
          value: analytics.rejectedBookings,
          accent: "pink",
          glow: "from-pink-100 via-rose-50 to-white",
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
      <section className="overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_24%),linear-gradient(180deg,_#ffffff,_#f7f9fc)] p-8 shadow-panel sm:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Booking Administration
            </p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-none text-slate-950 sm:text-6xl">
              Booking Management
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-500">
              Monitor facility reservations, orchestrate approvals, and export comprehensive
              audit reports instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4 xl:items-end">
            <button
              type="button"
              onClick={() => setShowInsights((previous) => !previous)}
              className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-slate-200 bg-white px-8 py-5 text-lg font-semibold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <ActionIcon type="analytics" />
              {showInsights ? "Hide Analytics" : "View Analytics"}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-slate-950 px-8 py-5 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              <ActionIcon type="download" />
              Export CSV Report
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading && !analytics ? (
            <div className="md:col-span-2 xl:col-span-4 rounded-[28px] bg-white/80 px-6 py-12 text-center text-sm text-slate-500 shadow-[0_18px_40px_rgba(148,163,184,0.15)]">
              Loading booking statistics...
            </div>
          ) : (
            summaryCards.map((card) => (
              <article
                key={card.label}
                className={`relative overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br ${card.glow} p-8 shadow-[0_18px_45px_rgba(148,163,184,0.18)]`}
              >
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/65 blur-sm" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.24em] text-slate-400">
                      {card.label}
                    </p>
                    <p className="mt-4 text-5xl font-bold leading-none text-slate-900">
                      {card.value}
                    </p>
                  </div>
                  <SummaryIcon type={card.icon} accent={card.accent} />
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-5">
          {topTabs.map((tab) => {
            const isActive = currentQuickTab === tab.key;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleQuickTab(tab.key)}
                className={`inline-flex items-center gap-3 rounded-[22px] border px-7 py-5 text-lg font-semibold transition ${
                  isActive
                    ? "border-transparent bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-[0_20px_35px_rgba(59,91,246,0.28)]"
                    : "border-slate-200 bg-white text-slate-600 shadow-[0_10px_25px_rgba(148,163,184,0.12)] hover:bg-slate-50"
                }`}
              >
                <ActionIcon type={tab.icon} />
                <span>{tab.label}</span>
                {tab.count > 0 ? (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {showInsights ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] bg-white p-7 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Extended Analytics
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">
              Booking performance overview
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Today&apos;s bookings</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {analytics?.todaysBookings ?? 0}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Upcoming approved</p>
                <p className="mt-3 text-3xl font-bold text-emerald-600">
                  {analytics?.upcomingApprovedBookings ?? 0}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Approval rate</p>
                <p className="mt-3 text-3xl font-bold text-blue-600">
                  {analytics ? `${analytics.approvalRate.toFixed(1)}%` : "0.0%"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-7 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Resource Demand
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">
              Most requested spaces
            </h2>
            <div className="mt-6 space-y-4">
              {analytics?.topResources?.length ? (
                analytics.topResources.map((resource) => (
                  <article
                    key={resource.resourceId}
                    className="rounded-[24px] bg-slate-50 px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{resource.resourceName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Resource #{resource.resourceId}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-slate-900">{resource.totalBookings} total</p>
                        <p className="mt-1 text-emerald-600">
                          {resource.approvedBookings} approved
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  No booking analytics available yet.
                </div>
              )}
            </div>
          </article>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(148,163,184,0.14)]">
        <div className="border-b border-slate-100 px-8 py-7">
          <p className="text-xl font-semibold uppercase tracking-[0.22em] text-slate-400">
            Filter Results
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form
            onSubmit={handleApplyFilters}
            className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-[0_10px_35px_rgba(148,163,184,0.12)]"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <ActionIcon type="filter" />
                  <span className="text-xl font-medium">Filter by Status:</span>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuickTab("")}
                      className={`rounded-2xl px-6 py-3 text-lg font-semibold transition ${
                        filters.status === ""
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {BOOKING_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleQuickTab(status)}
                        className={`rounded-2xl px-6 py-3 text-lg font-semibold transition ${
                          filters.status === status
                            ? status === "PENDING"
                              ? "bg-amber-100 text-amber-900 shadow-lg shadow-amber-100"
                              : status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-900 shadow-lg shadow-emerald-100"
                                : status === "REJECTED"
                                  ? "bg-rose-100 text-rose-900 shadow-lg shadow-rose-100"
                                  : "bg-slate-200 text-slate-900 shadow-lg shadow-slate-200"
                            : status === "PENDING"
                              ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                : status === "REJECTED"
                                  ? "bg-rose-50 text-rose-800 hover:bg-rose-100"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {status === "REJECTED" ? "Rejected" : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <input
                  type="number"
                  name="resourceId"
                  placeholder="Resource ID"
                  value={filters.resourceId}
                  onChange={handleFilterChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
                <input
                  type="number"
                  name="requesterId"
                  placeholder="Requester ID"
                  value={filters.requesterId}
                  onChange={handleFilterChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
                <input
                  type="date"
                  name="bookingDate"
                  value={filters.bookingDate}
                  onChange={handleFilterChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-2xl border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-[32px] bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            Loading booking records...
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center text-sm text-slate-500 shadow-panel">
            No bookings match the current filters.
          </div>
        ) : (
          visibleBookings.map((booking) => {
            const reviewEntry = reviewState[booking.id] || { status: "APPROVED", reason: "" };

            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_45px_rgba(148,163,184,0.15)]"
              >
                <div className="border-b border-slate-100 px-7 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                        Booking #{booking.id}
                      </span>
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-semibold ${statusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Created on {formatTimestamp(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 p-7 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-display text-3xl font-semibold text-slate-950">
                        {booking.resourceName}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {booking.resourceLocation} · {booking.resourceType}
                      </p>
                    </div>

                    <div className="grid gap-4 rounded-[28px] bg-slate-50 p-5 sm:grid-cols-2">
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Requester:</span>{" "}
                        {booking.requesterName}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Email:</span>{" "}
                        {booking.requesterEmail}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Date:</span>{" "}
                        {booking.bookingDate}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Time:</span>{" "}
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Attendees:</span>{" "}
                        {booking.expectedAttendees}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Reviewed by:</span>{" "}
                        {booking.reviewedByName || "Not reviewed"}
                      </p>
                    </div>

                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Booking Purpose
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{booking.purpose}</p>
                    </div>

                    <div className="rounded-[28px] bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Admin Note
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {booking.adminReason || "No admin note has been added yet."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[30px] bg-[linear-gradient(180deg,_#f8fafc,_#ffffff)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Admin Action
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                      Review this booking
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Pending bookings can be approved or rejected here. Reviewed records stay visible
                      for tracking and audit.
                    </p>

                    <div className="mt-6 space-y-4">
                      <select
                        value={reviewEntry.status}
                        onChange={(event) =>
                          handleReviewChange(booking.id, "status", event.target.value)
                        }
                        disabled={booking.status !== "PENDING"}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {REVIEWABLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <textarea
                        rows="5"
                        placeholder="Add an admin reason"
                        value={reviewEntry.reason}
                        onChange={(event) =>
                          handleReviewChange(booking.id, "reason", event.target.value)
                        }
                        disabled={booking.status !== "PENDING"}
                        className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />

                      {booking.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => handleReview(booking.id)}
                          className="w-full rounded-[22px] bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Submit Review
                        </button>
                      ) : (
                        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
                          This booking has already been reviewed. You can still inspect its full
                          booking details in this admin view.
                        </div>
                      )}
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
