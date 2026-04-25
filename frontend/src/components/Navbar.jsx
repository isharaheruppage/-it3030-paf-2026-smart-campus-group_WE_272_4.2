import React from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 active:scale-95",
          isActive
            ? "mr-4 bg-gradient-to-r from-[#2f76e6] to-[#4a90f0] text-white shadow-[0_0_18px_rgba(59,130,246,0.45)]"
            : "text-slate-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-md"
        ].join(" ")
      }
    >
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
    </NavLink>
  );
}

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <aside className="w-full border-b border-white/10 bg-gradient-to-b from-[#0B1F3A] to-[#1E3A8A] text-blue-500 shadow-2xl shadow-blue-900/20 lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-b-0">
      <div className="px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
            S
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white">Smart Campus Hub</h1>
            <p className="text-xs text-blue-300 opacity-80">Booking Management Suite</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">{currentUser?.name}</p>
          <p className="text-xs text-blue-200">{currentUser?.email}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-blue-300">
            {currentUser?.role === "ADMIN" ? "Admin workspace" : "User workspace"}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 pb-6">
        <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200/80">
          Booking Sections
        </p>
        <SidebarLink to="/dashboard" icon="dashboard" label="Dashboard" end />
        {currentUser?.role === "USER" && <SidebarLink to="/bookings/new" icon="event_available" label="New Booking" />}
        <SidebarLink to="/bookings/mine" icon="view_list" label="My Bookings" />
        {currentUser?.role === "ADMIN" && <SidebarLink to="/admin/bookings" icon="admin_panel_settings" label="Admin Panel" />}
      </nav>

      <div className="px-4 pb-8 pt-2">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
