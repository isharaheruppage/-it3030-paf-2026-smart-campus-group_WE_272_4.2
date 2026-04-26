import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import HomeHeader from "./HomeHeader.jsx";

function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(at_0%_0%,_rgba(191,219,254,0.18)_0px,transparent_50%),radial-gradient(at_100%_0%,_rgba(191,219,254,0.12)_0px,transparent_50%),linear-gradient(180deg,_#f1f5f9_0%,_#f8fbff_100%)] text-[#171c1f]">
      <HomeHeader compact />

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Navbar />

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:gap-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
