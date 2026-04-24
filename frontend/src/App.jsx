import { useMemo, useState } from "react";
import { createResource, deactivateResource, fetchResources, patchResource } from "./api";

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
        capacity: Number(resourceForm.capacity)
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
          {Object.keys(EMPTY_FILTERS).map((key) => (
            <label key={key}>
              {key}
              <input
                value={filters[key]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
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
            {Object.keys(EMPTY_RESOURCE_FORM).map((key) => (
              <label key={key}>
                {key}
                <input
                  value={resourceForm[key]}
                  onChange={(e) => setResourceForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </label>
            ))}
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
