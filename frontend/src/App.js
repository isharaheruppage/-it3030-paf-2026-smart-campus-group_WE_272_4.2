import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import TicketList from "./pages/Tickets/TicketList";
import TicketForm from "./pages/Tickets/TicketForm";
import TicketDetails from "./pages/Tickets/TicketDetails";
import TicketEdit from "./pages/Tickets/TicketEdit";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import HomePage from "./pages/home/HomePage";
import FacilitiesAssetsPage from "./pages/member1/FacilitiesAssetsPage";
import BookingFormPage from "./pages/member2/BookingFormPage";
import MyBookingsPage from "./pages/member2/MyBookingsPage";
import BookingApprovalPage from "./pages/member2/BookingApprovalPage";
import BookingListPage from "./pages/member2/BookingListPage";
import LoginPage from "./pages/member4/LoginPage";
import NotificationsPage from "./pages/member4/NotificationsPage";
import UserManagementPage from "./pages/member4/UserManagementPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Smart Campus Hub</div>
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/member1/facilities-assets">Facilities & Assets</Link>
          <Link to="/member2/bookings/new">New Booking</Link>
          <Link to="/bookings">All Bookings</Link>
          <Link to="/member4/users">Users</Link>
          <Link to="/member4/notifications">Notifications</Link>
        </nav>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/member1/facilities-assets" element={<FacilitiesAssetsPage />} />

          <Route path="/member2/bookings/new" element={<BookingFormPage />} />
          <Route path="/member2/bookings/my" element={<MyBookingsPage />} />
          <Route path="/member2/bookings/admin" element={<BookingApprovalPage />} />
          <Route path="/bookings" element={<BookingListPage />} />

          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<TicketForm />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/tickets/:id/edit" element={<TicketEdit />} />
          <Route path="/admin/tickets" element={<TicketListPage userRole="ADMIN" />} />
          <Route path="/admin/tickets/:id" element={<TicketDetailPage userRole="ADMIN" currentUser="admin@example.com" />} />
          <Route path="/tech/dashboard" element={<TechnicianDashboard />} />
          <Route path="/member4/notifications" element={<NotificationsPage />} />
          <Route path="/member4/users" element={<UserManagementPage />} />

          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
