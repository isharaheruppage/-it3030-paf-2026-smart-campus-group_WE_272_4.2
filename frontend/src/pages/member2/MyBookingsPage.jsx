import React, { useEffect, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    moduleApi.get("/bookings/my", { params: { userId: 3 } }).then((res) => setBookings(res.data));
  }, []);

  return (
    <div className="module-page">
      <h2>My Bookings</h2>
      <div className="card">
        {bookings.map((b) => (
          <div key={b.id} className="list-row">
            <div>
              <strong>{b.resource?.name || "Resource"}</strong>
              <div className="muted">{b.bookingDate} {b.startTime} - {b.endTime}</div>
            </div>
            <span className="status-chip">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookingsPage;
