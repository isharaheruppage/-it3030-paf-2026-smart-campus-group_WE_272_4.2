<<<<<<< HEAD
import { useMemo, useState } from "react";
import { createResource, deactivateResource, fetchResources, patchResource } from "./api";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "INACTIVE"];

const EMPTY_FILTERS = {
  type: "",
  minCapacity: "",
  location: "",
  status: "",
  availableFrom: "",
  availableTo: ""
};

const EMPTY_RESOURCE_FORM = {
  name: "",
  type: "LECTURE_HALL",
  capacity: 0,
  location: "",
  availableFrom: "08:00:00",
  availableTo: "17:00:00",
  status: "ACTIVE"
};

function toTimeInputValue(value) {
  return value ? value.slice(0, 5) : "";
}

function toApiTimeValue(value) {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
}

export default function App() {
  const [credentials, setCredentials] = useState({ username: "user", password: "user123" });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE_FORM);
  const [resources, setResources] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [updateLocation, setUpdateLocation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isAdmin = useMemo(() => credentials.username === "admin", [credentials.username]);

  async function loadResources() {
    setError("");
    setMessage("");
    try {
      const data = await fetchResources(credentials, filters);
      setResources(data);
      setMessage(`Loaded ${data.length} resources`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await createResource(credentials, {
        ...resourceForm,
        capacity: Number(resourceForm.capacity),
        availableFrom: toApiTimeValue(resourceForm.availableFrom),
        availableTo: toApiTimeValue(resourceForm.availableTo)
      });
      setMessage("Resource created");
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handlePatch() {
    if (!selectedId) return;
    setError("");
    setMessage("");
    try {
      await patchResource(credentials, selectedId, { location: updateLocation });
      setMessage("Resource updated");
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeactivate() {
    if (!selectedId) return;
    setError("");
    setMessage("");
    try {
      await deactivateResource(credentials, selectedId);
      setMessage("Resource deactivated");
      await loadResources();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="container">
      <h1>Smart Campus Resource Management</h1>
      <p className="sub">Member 01 UI: Facilities and assets catalogue operations</p>

      <section className="card">
        <h2>Authentication</h2>
        <div className="row">
          <label>
            Username
            <input
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
            />
          </label>
          <button onClick={loadResources}>Load Resources</button>
        </div>
        <p className="hint">Use demo accounts: admin/admin123 or user/user123</p>
      </section>

      <section className="card">
        <h2>Catalogue Filters</h2>
        <div className="grid">
          <label>
            Type
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="">All</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minimum Capacity
            <input
              type="number"
              min="0"
              value={filters.minCapacity}
              onChange={(e) => setFilters((prev) => ({ ...prev, minCapacity: e.target.value }))}
            />
          </label>
          <label>
            Location
            <input
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All</option>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Available From
            <input
              type="time"
              value={toTimeInputValue(filters.availableFrom)}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, availableFrom: toApiTimeValue(e.target.value) }))
              }
            />
          </label>
          <label>
            Available To
            <input
              type="time"
              value={toTimeInputValue(filters.availableTo)}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, availableTo: toApiTimeValue(e.target.value) }))
              }
            />
          </label>
        </div>
        <div className="row">
          <button onClick={loadResources}>Apply Filters</button>
          <button onClick={() => setFilters(EMPTY_FILTERS)}>Clear</button>
        </div>
      </section>

      {isAdmin && (
        <section className="card">
          <h2>Create Resource (Admin)</h2>
          <form className="grid" onSubmit={handleCreate}>
            <label>
              Name
              <input
                value={resourceForm.name}
                onChange={(e) => setResourceForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Type
              <select
                value={resourceForm.type}
                onChange={(e) => setResourceForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Capacity
              <input
                type="number"
                min="0"
                value={resourceForm.capacity}
                onChange={(e) => setResourceForm((prev) => ({ ...prev, capacity: e.target.value }))}
                required
              />
            </label>
            <label>
              Location
              <input
                value={resourceForm.location}
                onChange={(e) => setResourceForm((prev) => ({ ...prev, location: e.target.value }))}
                required
              />
            </label>
            <label>
              Available From
              <input
                type="time"
                value={toTimeInputValue(resourceForm.availableFrom)}
                onChange={(e) =>
                  setResourceForm((prev) => ({ ...prev, availableFrom: toApiTimeValue(e.target.value) }))
                }
                required
              />
            </label>
            <label>
              Available To
              <input
                type="time"
                value={toTimeInputValue(resourceForm.availableTo)}
                onChange={(e) =>
                  setResourceForm((prev) => ({ ...prev, availableTo: toApiTimeValue(e.target.value) }))
                }
                required
              />
            </label>
            <label>
              Status
              <select
                value={resourceForm.status}
                onChange={(e) => setResourceForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                {RESOURCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Create</button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Resource List</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <input
                      type="radio"
                      checked={selectedId === resource.id}
                      onChange={() => setSelectedId(resource.id)}
                    />
                  </td>
                  <td>{resource.id}</td>
                  <td>{resource.name}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>
                  <td>{resource.availableFrom}</td>
                  <td>{resource.availableTo}</td>
                  <td>{resource.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin && (
        <section className="card">
          <h2>Admin Quick Actions</h2>
          <div className="row">
            <label>
              New location
              <input value={updateLocation} onChange={(e) => setUpdateLocation(e.target.value)} />
            </label>
            <button onClick={handlePatch} disabled={!selectedId || !updateLocation}>
              Patch Selected
            </button>
            <button onClick={handleDeactivate} disabled={!selectedId}>
              Deactivate Selected
            </button>
          </div>
        </section>
      )}

      {message && <p className="message ok">{message}</p>}
      {error && <p className="message err">{error}</p>}
    </main>
  );
}
=======
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
>>>>>>> origin/Booking-workflow,confict-checking
