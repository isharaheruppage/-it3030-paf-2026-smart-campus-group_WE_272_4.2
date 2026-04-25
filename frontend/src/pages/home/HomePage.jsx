import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="home">
      <div className="hero">
        <h1>Smart Campus Operations Hub</h1>
        <p>
          One platform for facilities, bookings, maintenance tickets, users,
          notifications, and secure role-based workflows.
        </p>
      </div>

      <div className="home-grid">
        <article className="card">
          <h3>Member 1: Facilities & Assets</h3>
          <p>Manage resources, filter by type/status, and keep assets updated.</p>
          <Link to="/member1/facilities-assets">Open Module</Link>
        </article>
        <article className="card">
          <h3>Member 2: Booking Management</h3>
          <p>Create bookings by date/time slot and review approvals.</p>
          <Link to="/member2/bookings/new">Open Module</Link>
        </article>
        <article className="card">
          <h3>Member 3: Maintenance & Tickets</h3>
          <p>Track issue lifecycle, assignments, comments, and attachments.</p>
          <Link to="/tickets">Open Module</Link>
        </article>
        <article className="card">
          <h3>Member 4: Auth, Security & Alerts</h3>
          <p>Manage users, roles, notifications, and protected workflows.</p>
          <Link to="/member4/users">Open Module</Link>
        </article>
      </div>
    </section>
  );
};

export default HomePage;
