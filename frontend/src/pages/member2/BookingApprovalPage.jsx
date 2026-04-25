import React, { useEffect, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const BookingApprovalPage = () => {
  const [bookings, setBookings] = useState([]);

  const load = () => moduleApi.get("/bookings").then((res) => setBookings(res.data));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="module-page">
      <h2>Admin Booking Approval</h2>
      <div className="card">
        {bookings.map((b) => (
          <div key={b.id} className="list-row">
            <div>
              <strong>Booking #{b.id}</strong>
              <div className="muted">
                {b.resource?.name || "Resource"} | {b.bookingDate} | {b.startTime} - {b.endTime}
              </div>
            </div>
            <div className="row-actions">
              <span className="status-chip">{b.status}</span>
              <button className="btn-primary" onClick={async () => { await moduleApi.put(`/bookings/${b.id}/approve`, null, { params: { adminId: 1 } }); load(); }}>Approve</button>
              <button className="btn-danger" onClick={async () => { await moduleApi.put(`/bookings/${b.id}/reject`, { reason: "Not available for requested slot" }); load(); }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingApprovalPage;
