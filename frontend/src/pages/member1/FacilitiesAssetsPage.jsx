import React, { useEffect, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const emptyForm = {
  name: "",
  type: "LECTURE_HALL",
  capacity: 30,
  location: "",
  status: "ACTIVE",
  description: "",
};

const FacilitiesAssetsPage = () => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const params = search ? { search } : {};
    const res = await moduleApi.get("/resources", { params });
    setResources(res.data);
  };

  useEffect(() => {
    load();
  }, [search]);

  const save = async (e) => {
    e.preventDefault();
    if (editingId) {
      await moduleApi.put(`/resources/${editingId}`, form);
    } else {
      await moduleApi.post("/resources", form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  return (
    <div className="module-page">
      <h2>Facilities & Assets Module</h2>
      <div className="card">
        <input
          placeholder="Search by name or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>
      <div className="grid-2">
        <form className="card" onSubmit={save}>
          <h3>{editingId ? "Update Resource" : "Create Resource"}</h3>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>LECTURE_HALL</option><option>LAB</option><option>EQUIPMENT</option><option>MEETING_ROOM</option>
          </select>
          <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="Capacity" />
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>ACTIVE</option><option>OUT_OF_SERVICE</option><option>MAINTENANCE</option>
          </select>
          <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <button className="btn-primary" type="submit">{editingId ? "Update" : "Create"}</button>
        </form>
        <div className="card">
          <h3>Resource Listing</h3>
          {resources.map((r) => (
            <div key={r.id} className="list-row">
              <div>
                <strong>{r.name}</strong> <span className="muted">({r.type})</span>
                <div className="muted">{r.location} - {r.status}</div>
              </div>
              <div className="row-actions">
                <button className="btn-outline" onClick={() => { setEditingId(r.id); setForm({ ...r, capacity: r.capacity || 0 }); }}>Edit</button>
                <button className="btn-danger" onClick={async () => { await moduleApi.delete(`/resources/${r.id}`); load(); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesAssetsPage;
