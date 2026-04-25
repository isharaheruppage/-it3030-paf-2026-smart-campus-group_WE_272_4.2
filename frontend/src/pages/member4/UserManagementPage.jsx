import React, { useEffect, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);

  const load = () => moduleApi.get("/users").then((res) => setUsers(res.data));
  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id, role) => {
    await moduleApi.put(`/users/${id}/role`, { role });
    load();
  };

  const deleteUser = async (u) => {
    if (u.role === "ADMIN") return;
    await moduleApi.delete(`/users/${u.id}`);
    load();
  };

  return (
    <div className="module-page">
      <h2>User Management (Admin)</h2>
      <div className="card">
        {users.map((u) => (
          <div key={u.id} className="list-row">
            <div>
              <strong>{u.firstName} {u.lastName}</strong>
              <div className="muted">{u.email} | {u.role}</div>
            </div>
            <div className="row-actions">
              <select className="input" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                <option>USER</option>
                <option>TECHNICIAN</option>
                <option>ADMIN</option>
              </select>
              <button className="btn-danger" disabled={u.role === "ADMIN"} onClick={() => deleteUser(u)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagementPage;
