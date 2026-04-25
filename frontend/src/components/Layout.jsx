import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";

function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,_#fff7ed_0%,_#eff6ff_50%,_#f8fafc_100%)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
