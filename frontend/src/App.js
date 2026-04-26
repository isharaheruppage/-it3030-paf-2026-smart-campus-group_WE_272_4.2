import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Auth/Login.js";
import Register from "./pages/Auth/Register.js";
import OAuth2Redirect from "./pages/Auth/OAuth2Redirect.js";
import Dashboard from "./pages/Auth/Dashboard.jsx";
import Notifications from "./pages/Auth/Notifications.js";
import UserManagement from "./pages/Auth/UserManagement.js";
import ResourceList from "./pages/Resources/ResourceList.js";
import BookingForm from "./pages/Bookings/BookingForm.jsx";
import BookingList from "./pages/Bookings/BookingList.jsx";
import BookingApproval from "./pages/Bookings/BookingApproval.jsx";
import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/bookings/new"
            element={
              <PrivateRoute requiredRole="USER">
                <BookingForm embedded />
              </PrivateRoute>
            }
          />
          <Route path="/bookings/mine" element={<BookingList />} />
          <Route
            path="/admin/bookings"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <BookingApproval />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ResourceList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UserManagement />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
