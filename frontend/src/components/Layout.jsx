import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";

function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(at_0%_0%,_rgba(191,219,254,0.18)_0px,transparent_50%),radial-gradient(at_100%_0%,_rgba(191,219,254,0.12)_0px,transparent_50%),linear-gradient(180deg,_#f1f5f9_0%,_#f8fbff_100%)] text-[#171c1f]">
      <Navbar />
      <main className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-40 border-b border-white/20 bg-white/45 shadow-sm backdrop-blur-[15px] lg:fixed lg:left-72 lg:right-0 lg:top-0 lg:h-16">
          <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <div className="hidden text-lg font-bold text-slate-900 md:block">Command Center</div>
            <div className="flex-1 max-w-md">
              <div className="group relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search bookings, resources, or users..."
                  className="w-full rounded-lg border border-slate-200/50 bg-slate-100/50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800" type="button">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800" type="button">
                <span className="material-symbols-outlined text-xl">settings</span>
              </button>
              <button className="ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800" type="button">
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:mt-16 lg:gap-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
