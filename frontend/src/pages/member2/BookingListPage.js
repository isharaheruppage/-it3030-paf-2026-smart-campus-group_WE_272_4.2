import React, { useState, useEffect, useCallback } from "react";
import { getAllBookings, deleteBooking, updateBooking, updateBookingStatus } from "../../api/bookingApi";
import "./BookingListPage.css";

const STATUS_COLORS = {
  PENDING: "status-pending",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
  CANCELLED: "status-cancelled",
};

const EMPTY_FORM = {
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

export default function BookingListPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit modal state
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status update modal state
  const [statusModal, setStatusModal] = useState(null); // { booking }
  const [newStatus, setNewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load bookings. Is the backend running?");
      console.error("Booking fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ---- DELETE ----
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteBooking(deletingId);
      setBookings((prev) => prev.filter((b) => b.id !== deletingId));
      setDeletingId(null);
    } catch {
      setError("Failed to delete booking.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---- EDIT ----
  const openEdit = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      bookingDate: booking.bookingDate || "",
      startTime: booking.startTime || "",
      endTime: booking.endTime || "",
      purpose: booking.purpose || "",
      expectedAttendees: booking.expectedAttendees || "",
    });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        resourceId: editingBooking.resourceId,
        userId: editingBooking.userId,
        bookingDate: editForm.bookingDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose: editForm.purpose,
        expectedAttendees: parseInt(editForm.expectedAttendees, 10) || null,
      };
      const updated = await updateBooking(editingBooking.id, payload);
      setBookings((prev) =>
        prev.map((b) => (b.id === editingBooking.id ? updated : b))
      );
      setEditingBooking(null);
    } catch {
      setEditError("Failed to update booking.");
    } finally {
      setEditLoading(false);
    }
  };

  // ---- STATUS UPDATE ----
  const openStatusModal = (booking) => {
    setStatusModal({ booking });
    setNewStatus(booking.status);
    setRejectionReason(booking.rejectionReason || "");
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      const updated = await updateBookingStatus(statusModal.booking.id, newStatus, rejectionReason);
      setBookings((prev) =>
        prev.map((b) => (b.id === statusModal.booking.id ? updated : b))
      );
      setStatusModal(null);
    } catch {
      setError("Failed to update booking status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ---- FILTER ----
  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (b.resourceName || "").toLowerCase().includes(q) ||
      (b.userName || "").toLowerCase().includes(q) ||
      (b.purpose || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="booking-list-page">
      {/* Header */}
      <div className="booking-list-header">
        <div className="booking-list-title">
          <span className="booking-icon">📅</span>
          <h1>All Bookings</h1>
          <span className="booking-count-badge">{filtered.length}</span>
        </div>
        <div className="booking-list-controls">
          <input
            className="booking-search"
            type="text"
            placeholder="Search resource, user, purpose…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="booking-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button className="booking-refresh-btn" onClick={fetchBookings} title="Refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && <div className="booking-error-banner">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="booking-loading">
          <div className="booking-spinner" />
          <span>Loading bookings…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="booking-empty">
          <div className="booking-empty-icon">📋</div>
          <p>No bookings found.</p>
          {(searchQuery || statusFilter !== "ALL") && (
            <button
              className="booking-clear-btn"
              onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="booking-row">
                  <td className="booking-id">#{booking.id}</td>
                  <td>
                    <div className="booking-resource-name">{booking.resourceName || "—"}</div>
                    {booking.resourceLocation && (
                      <div className="booking-resource-loc">📍 {booking.resourceLocation}</div>
                    )}
                  </td>
                  <td>
                    <div className="booking-user-name">{booking.userName || "—"}</div>
                    {booking.userEmail && (
                      <div className="booking-user-email">{booking.userEmail}</div>
                    )}
                  </td>
                  <td>{booking.bookingDate || "—"}</td>
                  <td>
                    {booking.startTime && booking.endTime
                      ? `${booking.startTime} – ${booking.endTime}`
                      : "—"}
                  </td>
                  <td className="booking-purpose">{booking.purpose || "—"}</td>
                  <td>{booking.expectedAttendees || "—"}</td>
                  <td>
                    <span className={`booking-status-chip ${STATUS_COLORS[booking.status] || ""}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="booking-actions">
                      <button
                        className="booking-btn booking-btn-edit"
                        onClick={() => openEdit(booking)}
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="booking-btn booking-btn-status"
                        onClick={() => openStatusModal(booking)}
                        title="Change Status"
                      >
                        🔄 Status
                      </button>
                      <button
                        className="booking-btn booking-btn-delete"
                        onClick={() => setDeletingId(booking.id)}
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- DELETE CONFIRM MODAL ---- */}
      {deletingId !== null && (
        <div className="booking-modal-overlay" onClick={() => !deleteLoading && setDeletingId(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-icon">⚠️</div>
            <h3>Delete Booking</h3>
            <p>Are you sure you want to permanently delete this booking? This cannot be undone.</p>
            <div className="booking-modal-actions">
              <button
                className="booking-btn booking-btn-cancel"
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="booking-btn booking-btn-delete"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {editingBooking && (
        <div className="booking-modal-overlay" onClick={() => !editLoading && setEditingBooking(null)}>
          <div className="booking-modal booking-modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit Booking <span className="modal-id">#{editingBooking.id}</span></h3>
            {editError && <div className="booking-modal-error">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="booking-edit-form">
              <div className="booking-form-row">
                <div className="booking-form-group">
                  <label>Booking Date</label>
                  <input
                    type="date"
                    value={editForm.bookingDate}
                    onChange={(e) => setEditForm({ ...editForm, bookingDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="booking-form-row">
                <div className="booking-form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="booking-form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="booking-form-group">
                <label>Purpose</label>
                <textarea
                  value={editForm.purpose}
                  onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="booking-form-group">
                <label>Expected Attendees</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.expectedAttendees}
                  onChange={(e) => setEditForm({ ...editForm, expectedAttendees: e.target.value })}
                />
              </div>
              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="booking-btn booking-btn-cancel"
                  onClick={() => setEditingBooking(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="booking-btn booking-btn-save" disabled={editLoading}>
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- STATUS MODAL ---- */}
      {statusModal && (
        <div className="booking-modal-overlay" onClick={() => !statusLoading && setStatusModal(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔄 Update Status <span className="modal-id">#{statusModal.booking.id}</span></h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="booking-form-group">
                <label>New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              {newStatus === "REJECTED" && (
                <div className="booking-form-group">
                  <label>Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Provide a reason for rejection…"
                  />
                </div>
              )}
              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="booking-btn booking-btn-cancel"
                  onClick={() => setStatusModal(null)}
                  disabled={statusLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="booking-btn booking-btn-save" disabled={statusLoading}>
                  {statusLoading ? "Updating…" : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
