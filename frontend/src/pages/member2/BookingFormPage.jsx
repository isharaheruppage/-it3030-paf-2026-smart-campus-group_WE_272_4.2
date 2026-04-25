import React, { useEffect, useMemo, useState } from "react";
import { moduleApi } from "../../api/moduleApi";

const BookingFormPage = () => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId: "",
    userId: 3,
    bookingDate: "",
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
    expectedAttendees: 20,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    moduleApi.get("/resources").then((res) => setResources(res.data));
  }, []);

  const slots = useMemo(
    () => ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    []
  );

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await moduleApi.post("/bookings", form);
      setMessage("Booking request submitted successfully.");
    } catch (err) {
      setMessage(err?.response?.data || "Booking failed. Check overlapping slot.");
    }
  };

  return (
    <div className="module-page">
      <h2>Booking Management - New Booking</h2>
      <form className="card" onSubmit={submit}>
        <label>Facility</label>
        <select className="input" value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: Number(e.target.value) })} required>
          <option value="">Select resource</option>
          {resources.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.location}</option>)}
        </select>
        <label>Date</label>
        <input className="input" type="date" value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} required />
        <div className="grid-2">
          <div>
            <label>Start Time Slot</label>
            <select className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}>{slots.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div>
            <label>End Time Slot</label>
            <select className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}>{slots.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>
        <textarea className="input" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required />
        <input className="input" type="number" placeholder="Expected attendees" value={form.expectedAttendees} onChange={(e) => setForm({ ...form, expectedAttendees: Number(e.target.value) })} />
        <button className="btn-primary" type="submit">Submit Booking</button>
        {message && <p className="muted">{message}</p>}
      </form>
    </div>
  );
};

export default BookingFormPage;
