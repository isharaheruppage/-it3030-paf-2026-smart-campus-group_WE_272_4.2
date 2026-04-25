import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function Dashboard() {
  const { currentUser } = useAuth();

  const recentBookings = [
    {
      initials: "IL",
      name: "Innovation Lab",
      type: "Room Booking",
      date: "Oct 15, 2026",
      status: "Approved",
      statusColor: "bg-emerald-100 text-emerald-700",
      budget: "12 attendees"
    },
    {
      initials: "MS",
      name: "Main Seminar Hall",
      type: "Lecture Session",
      date: "Oct 22, 2026",
      status: "Pending",
      statusColor: "bg-amber-100 text-amber-700",
      budget: "85 attendees"
    },
    {
      initials: "CL",
      name: "Computer Lab 3",
      type: "Practical Class",
      date: "Oct 25, 2026",
      status: "Urgent",
      statusColor: "bg-rose-100 text-rose-700",
      budget: "24 attendees"
    },
    {
      initials: "CR",
      name: "Campus Resource Center",
      type: "Workshop Space",
      date: "Nov 02, 2026",
      status: "Scheduled",
      statusColor: "bg-blue-100 text-blue-700",
      budget: "40 attendees"
    }
  ];

  const boardItems =
    currentUser?.role === "ADMIN"
      ? [
          {
            title: "Pending Reviews (3)",
            description: "Approve or reject requests waiting for a final decision.",
            tag: "Review",
            tagColor: "bg-blue-100 text-blue-700",
            highlight: "border-t-blue-400"
          },
          {
            title: "High Priority (2)",
            description: "Requests that need a quick follow-up or resource check.",
            tag: "Priority",
            tagColor: "bg-amber-100 text-amber-700",
            highlight: "border-t-amber-400"
          },
          {
            title: "Approved Today (5)",
            description: "Bookings already confirmed and ready for the owners.",
            tag: "Done",
            tagColor: "bg-emerald-100 text-emerald-700",
            highlight: "border-t-emerald-400"
          }
        ]
      : [
          {
            title: "Upcoming Booking (2)",
            description: "Your next confirmed room or lab reservations.",
            tag: "Soon",
            tagColor: "bg-blue-100 text-blue-700",
            highlight: "border-t-blue-400"
          },
          {
            title: "Awaiting Approval (1)",
            description: "Requests that are still being reviewed by admins.",
            tag: "Pending",
            tagColor: "bg-amber-100 text-amber-700",
            highlight: "border-t-amber-400"
          },
          {
            title: "Completed This Week (4)",
            description: "Recent reservations that have already wrapped up.",
            tag: "Closed",
            tagColor: "bg-emerald-100 text-emerald-700",
            highlight: "border-t-emerald-400"
          }
        ];

  const quickActions =
    currentUser?.role === "ADMIN"
      ? [
          {
            title: "Review Booking Queue",
            description: "Inspect and clear incoming booking requests.",
            to: "/admin/bookings",
            accent: "from-[#2f76e6] to-[#4a90f0]"
          },
          {
            title: "Track My Bookings",
            description: "Open the live booking list and monitor active requests.",
            to: "/bookings/mine",
            accent: "from-[#0f766e] to-[#14b8a6]"
          }
        ]
      : [
          {
            title: "Create a Booking Request",
            description: "Submit a new room or lab reservation in a few steps.",
            to: "/bookings/new",
            accent: "from-[#2f76e6] to-[#4a90f0]"
          },
          {
            title: "Track My Bookings",
            description: "See pending, approved, and rejected requests in one place.",
            to: "/bookings/mine",
            accent: "from-[#6d28d9] to-[#a855f7]"
          }
        ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Booking Management</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#171c1f] sm:text-4xl">Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Welcome back, <span className="font-semibold text-slate-900">{currentUser?.name}</span>. Your
            workspace is tuned for <span className="font-semibold">{currentUser?.role}</span> operations and
            quick booking review.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg border border-blue-400/50 bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/40" type="button">
          <span className="material-symbols-outlined text-base">add</span>
          New Booking
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active Requests", "24", "bg-blue-50 text-blue-700"],
          ["Pending Approval", "6", "bg-amber-50 text-amber-700"],
          ["Approved Today", "11", "bg-emerald-50 text-emerald-700"],
          ["Rooms in Use", "18", "bg-violet-50 text-violet-700"]
        ].map(([label, value, style]) => (
          <div key={label} className="glass-card rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>Live</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="col-span-12 xl:col-span-8 glass-card rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
              <span className="material-symbols-outlined text-xl text-blue-600">timeline</span>
              Most Recent Bookings
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mine Only</span>
              <button className="relative h-5 w-10 rounded-full bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40" type="button">
                <span className="absolute left-1 top-1 h-3 w-3 translate-x-5 rounded-full bg-white shadow-sm transition-transform" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {["All", "Pending", "Approved", "Upcoming", "Cancelled"].map((filter, index) => (
              <button
                key={filter}
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                  index === 0
                    ? "border-blue-400/30 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                ].join(" ")}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/70 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pl-2 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 pr-2 text-right font-medium">Attendees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-sm text-slate-700">
                {recentBookings.map((booking) => (
                  <tr key={booking.name} className="group cursor-pointer transition-colors hover:bg-slate-50/70">
                    <td className="flex items-center gap-3 py-4 pl-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                        {booking.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 transition-colors group-hover:text-blue-600">{booking.name}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${booking.statusColor}`}>
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500">{booking.type}</td>
                    <td className="py-4 text-slate-500">{booking.date}</td>
                    <td className="py-4 pr-2 text-right font-semibold text-slate-900">{booking.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link className="text-sm font-semibold text-blue-600 hover:underline" to="/bookings/mine">
              View All Bookings
            </Link>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
              <span className="material-symbols-outlined text-xl text-slate-500">view_kanban</span>
              Booking Board
            </h2>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100" type="button">
              <span className="material-symbols-outlined text-lg">more_horiz</span>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 rounded-xl border border-slate-200/60 bg-white/45 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {currentUser?.role === "ADMIN" ? "In Review" : "Current Status"}
              </span>
              <span className="material-symbols-outlined text-sm text-slate-500">add</span>
            </div>

            {boardItems.map((item) => (
              <div key={item.title} className={`glass-card rounded-lg border-t-[3px] ${item.highlight} bg-gradient-to-br from-white/80 to-slate-50/60 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${item.tagColor}`}>{item.tag}</span>
                </div>
                <p className="mb-3 text-xs leading-5 text-slate-500">{item.description}</p>
                <div className="flex items-center justify-between border-t border-slate-200/70 pt-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {currentUser?.role === "ADMIN" ? "Action required" : "Booking status"}
                  </span>
                  <span className="material-symbols-outlined text-sm text-emerald-500">
                    {currentUser?.role === "ADMIN" ? "check_circle" : "event_available"}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-auto rounded-xl bg-white/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Actions</p>
              <div className="mt-3 flex flex-col gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="group rounded-lg border border-slate-200/70 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className={`h-1 rounded-full bg-gradient-to-r ${action.accent}`} />
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
