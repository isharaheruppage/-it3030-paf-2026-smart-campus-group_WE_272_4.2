import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Auth/Login.jsx";
import Dashboard from "./pages/Auth/Dashboard.jsx";
import BookingForm from "./pages/Bookings/BookingForm.jsx";
import BookingList from "./pages/Bookings/BookingList.jsx";
import BookingApproval from "./pages/Bookings/BookingApproval.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="bookings/new"
          element={
            <PrivateRoute requiredRole="USER">
              <BookingForm />
            </PrivateRoute>
          }
        />
        <Route path="bookings/mine" element={<BookingList />} />
        <Route
          path="admin/bookings"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <BookingApproval />
            </PrivateRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
