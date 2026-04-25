import React, { useEffect, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  const load = () => moduleApi.get("/notifications", { params: { userId: 1 } }).then((res) => setNotifications(res.data));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="module-page">
      <h2>Notifications</h2>
      <div className="card">
        {notifications.map((n) => (
          <div key={n.id} className="list-row">
            <div>
              <strong>{n.title}</strong>
              <div className="muted">{n.message}</div>
            </div>
            <button className="btn-outline" onClick={async () => { await moduleApi.put(`/notifications/${n.id}/read`); load(); }}>
              {n.read ? "Read" : "Mark Read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
