import React from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive ? "bg-white text-ink shadow-md" : "text-slate-600 hover:bg-white/70"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-xl font-semibold text-ink">Smart Campus Booking Hub</p>
          <p className="text-sm text-slate-500">
            {currentUser?.role === "ADMIN" ? "Admin review console" : "User booking workspace"}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 rounded-full bg-slate-100/80 p-2">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/bookings/new">New Booking</NavItem>
          <NavItem to="/bookings/mine">My Bookings</NavItem>
          {currentUser?.role === "ADMIN" && <NavItem to="/admin/bookings">Admin Panel</NavItem>}
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white shadow-panel">
            <p className="font-semibold">{currentUser?.name}</p>
            <p className="text-xs text-slate-300">{currentUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
