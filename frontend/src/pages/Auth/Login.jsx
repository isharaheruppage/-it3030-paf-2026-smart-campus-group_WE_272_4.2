import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { loginAs } = useAuth();

  const handleLogin = (role) => {
    loginAs(role);
    toast.success(`Logged in as ${role.toLowerCase()}`);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.45),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(233,213,255,0.45),_transparent_30%),linear-gradient(135deg,_#faf5ff_0%,_#ffffff_48%,_#f3e8ff_100%)] px-4 py-10">
      <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[32px] border border-violet-100 bg-violet-950/95 p-8 text-white shadow-panel backdrop-blur-xl">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
            IT3030 Booking Module
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Manage campus bookings with clear user and admin workflows.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-violet-100/85 sm:text-lg">
            This booking frontend is focused on your assignment part: users can create and track
            requests, while admins can filter, approve, and reject bookings with instant feedback.
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-violet-950">Choose a demo role</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use the seeded backend accounts for fast development and Postman-friendly testing.
          </p>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={() => handleLogin("USER")}
              className="w-full rounded-3xl border border-violet-200 bg-violet-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-violet-100"
            >
              <p className="font-display text-lg font-semibold text-violet-950">Continue as User</p>
              <p className="mt-1 text-sm text-violet-700/80">
                Create bookings, monitor statuses, and cancel approved requests.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleLogin("ADMIN")}
              className="w-full rounded-3xl border border-purple-200 bg-purple-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-purple-100"
            >
              <p className="font-display text-lg font-semibold text-purple-950">Continue as Admin</p>
              <p className="mt-1 text-sm text-purple-700/80">
                Review pending requests and manage the booking approval flow.
              </p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
