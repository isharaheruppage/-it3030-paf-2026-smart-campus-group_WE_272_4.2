import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function Dashboard() {
  const { currentUser } = useAuth();

  const cards =
    currentUser?.role === "ADMIN"
      ? [
          {
            title: "Review Booking Queue",
            description: "Filter booking requests by date or status and approve or reject them fast.",
            to: "/admin/bookings",
            accent: "from-teal-500 to-cyan-500"
          },
          {
            title: "Monitor User Requests",
            description: "Inspect all booking records with workflow status and audit details.",
            to: "/bookings/mine",
            accent: "from-slate-900 to-slate-700"
          }
        ]
      : [
          {
            title: "Create a Booking Request",
            description: "Send a new room or lab request with date, purpose, and attendee count.",
            to: "/bookings/new",
            accent: "from-orange-500 to-amber-500"
          },
          {
            title: "Track My Bookings",
            description: "Check pending, approved, rejected, and cancelled requests in one place.",
            to: "/bookings/mine",
            accent: "from-sky-500 to-indigo-500"
          }
        ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-panel">
        <div className="grid gap-6 px-8 py-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">
              Booking Management
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold">
              Welcome back, {currentUser?.name}.
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              Your current role is <span className="font-semibold text-white">{currentUser?.role}</span>.
              This interface is tailored to the booking workflow you need for your IT3030 module.
            </p>
          </div>
          <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-300">Demo account</p>
            <p className="mt-2 text-2xl font-semibold">{currentUser?.email}</p>
            <p className="mt-6 text-sm text-slate-300">
              Backend expects `adminId=1`, `requesterId=2`, and seeded resources `1` and `2`.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group overflow-hidden rounded-[28px] bg-white shadow-panel transition hover:-translate-y-1"
          >
            <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
            <div className="p-7">
              <h2 className="font-display text-2xl font-semibold text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              <span className="mt-8 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                Open workspace
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
