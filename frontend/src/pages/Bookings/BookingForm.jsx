import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { listResources } from "../../api/resourceApi";
import { createBooking, updateBooking, checkAvailability } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";
import { TIME_SLOT_OPTIONS } from "../../utils/constants";

const initialForm = {
  resourceId: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "1"
};

function buildInitialForm(booking) {
  if (!booking) {
    return initialForm;
  }

  return {
    resourceId: booking.resourceId || "",
    bookingDate: booking.bookingDate || "",
    startTime: formatBackendTime(booking.startTime || ""),
    endTime: formatBackendTime(booking.endTime || ""),
    purpose: booking.purpose || "",
    expectedAttendees: String(booking.expectedAttendees ?? "1")
  };
}

function BookingForm({
  embedded = false,
  onSuccess,
  onClose,
  mode = "create",
  initialBooking = null,
  submitLabel,
  title,
  description
}) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => buildInitialForm(initialBooking));
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("Select date and time to check availability.");
  const [availabilityType, setAvailabilityType] = useState("neutral");
  const [availabilityModal, setAvailabilityModal] = useState({ open: false, available: null, conflicts: [] });
  const editingBookingId = initialBooking?.id;
  const isEditMode = mode === "edit";

  useEffect(() => {
    setFormData(buildInitialForm(initialBooking));
  }, [initialBooking, mode]);

  useEffect(() => {
    const loadResources = async () => {
      setResourcesLoading(true);

      try {
        const result = await listResources({ status: "ACTIVE" });
        const activeResources = Array.isArray(result) ? result : [];
        setResources(activeResources);

        setFormData((previous) => {
          if (previous.resourceId && activeResources.some((resource) => resource.id === previous.resourceId)) {
            return previous;
          }

          return {
            ...previous,
            resourceId: activeResources[0]?.id || ""
          };
        });
      } catch (error) {
        setResources([]);
        toast.error(error?.message || "Unable to load available resources.");
      } finally {
        setResourcesLoading(false);
      }
    };

    loadResources();
  }, []);

  const selectedResource = resources.find((resource) => resource.id === formData.resourceId);

  const attendeeCount = Number(formData.expectedAttendees || 0);
  const remainingCapacity = selectedResource
    ? Math.max(selectedResource.capacity - attendeeCount, 0)
    : 0;

  const canCheckAvailability = useMemo(
    () =>
      Boolean(
        formData.resourceId &&
          formData.bookingDate &&
          formData.startTime &&
          formData.endTime
      ),
    [formData.bookingDate, formData.endTime, formData.resourceId, formData.startTime]
  );

  // Manual availability check triggered by the user
  const handleManualCheckAvailability = async () => {
    if (!canCheckAvailability) {
      toast.error("Select resource, date, start and end time before checking availability.");
      return;
    }

    setCheckingAvailability(true);

    try {
      const payload = {
        resourceId: formData.resourceId,
        bookingDate: formData.bookingDate,
        startTime: `${convertDisplayTimeTo24Hour(formData.startTime)}:00`,
        endTime: `${convertDisplayTimeTo24Hour(formData.endTime)}:00`,
        excludeBookingId: editingBookingId
      };

      const result = await checkAvailability(payload);

      if (result.available) {
        setAvailabilityType("success");
        setAvailabilityMessage("Available for the selected time slot.");
        setAvailabilityModal({ open: true, available: true, conflicts: [] });
      } else {
        setAvailabilityType("error");
        const conflicts = result.conflicts || [];
        setAvailabilityMessage(`Not available. Conflicts with ${conflicts.length} approved booking(s).`);
        setAvailabilityModal({ open: true, available: false, conflicts });
      }
    } catch (error) {
      setAvailabilityType("warning");
      setAvailabilityMessage(error?.response?.data?.message || "Could not verify availability right now.");
      toast.error(error?.response?.data?.message || "Could not verify availability right now.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (currentUser?.role !== "USER") {
      toast.error("Only the user account can create bookings.");
      return;
    }

    if (!selectedResource) {
      toast.error("Please select a resource.");
      return;
    }

    if (attendeeCount > selectedResource.capacity) {
      toast.error("Expected attendees exceed the room capacity.");
      return;
    }

    if (availabilityType === "error") {
      toast.error("Please choose an available time slot before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        resourceId: formData.resourceId,
        requesterId: currentUser.id,
        bookingDate: formData.bookingDate,
        startTime: `${convertDisplayTimeTo24Hour(formData.startTime)}:00`,
        endTime: `${convertDisplayTimeTo24Hour(formData.endTime)}:00`,
        purpose: formData.purpose.trim(),
        expectedAttendees: Number(formData.expectedAttendees)
      };

      const response = isEditMode
        ? await updateBooking(initialBooking.id, payload)
        : await createBooking(payload);
      toast.success(
        isEditMode
          ? `Booking #${response.id} updated successfully`
          : `Booking #${response.id} submitted for review`
      );
      setFormData(isEditMode ? buildInitialForm(response) : initialForm);

      if (onSuccess) {
        onSuccess(response);
        return;
      }

      navigate("/bookings/mine");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create booking. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={embedded ? "grid gap-6" : "grid gap-6 lg:grid-cols-[1.1fr_0.8fr]"}>
      <section className={embedded ? "rounded-[28px] bg-white/80 p-6 shadow-[0_24px_60px_rgba(76,29,149,0.18)] backdrop-blur-xl" : "rounded-[32px] bg-white p-8 shadow-panel"}>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500">
              {title || (isEditMode ? "Edit Booking Form" : "User Booking Form")}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-violet-950">
              {isEditMode ? "Update your booking request" : "Request a new booking"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {description || (isEditMode
                ? "Make changes to a pending booking request. The request will remain in the pending queue until an admin reviews it again."
                : "Create a booking request for a room or lab. The request will enter the pending queue until an admin reviews it.")}
            </p>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Close
            </button>
          ) : null}
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Select resource</span>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              disabled={resourcesLoading || resources.length === 0}
              required
            >
              <option value="">{resourcesLoading ? "Loading resources..." : "Select a resource"}</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
            {!resourcesLoading && resources.length === 0 ? (
              <span className="text-xs text-rose-600">No active resources are available right now.</span>
            ) : null}
          </label>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="grid gap-2 sm:col-span-1">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Start time</span>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                required
              >
                <option value="">Select start time</option>
                {TIME_SLOT_OPTIONS.map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">End time</span>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
                required
              >
                <option value="">Select end time</option>
                {TIME_SLOT_OPTIONS.map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Purpose</span>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows="4"
              placeholder="State why this resource is needed"
              className="rounded-3xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Expected attendees</span>
            <input
              type="number"
              name="expectedAttendees"
              min="1"
              value={formData.expectedAttendees}
              onChange={handleChange}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 outline-none transition focus:border-violet-400 focus:bg-white"
              required
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualCheckAvailability}
              disabled={!canCheckAvailability || checkingAvailability}
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {checkingAvailability ? "Checking..." : "Check availability"}
            </button>

            <button
              type="submit"
              disabled={submitting || resourcesLoading || resources.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {submitting
                ? isEditMode
                  ? "Saving..."
                  : "Submitting..."
                : submitLabel || (isEditMode ? "Save Changes" : "Submit Booking Request")}
            </button>
          </div>
        </form>
      </section>

      {!embedded ? (
      <aside className="space-y-6">
        <section className="rounded-[32px] bg-violet-950 p-7 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            Resource Snapshot
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold">{selectedResource?.name}</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>Location: {selectedResource?.location}</p>
            <p>Room capacity: {selectedResource?.capacity} attendees</p>
            <p>Requested attendees: {attendeeCount || 0}</p>
            <p>Remaining capacity: {remainingCapacity}</p>
            <p>Requester ID: {currentUser?.id}</p>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-7 shadow-panel">
          <h2 className="font-display text-xl font-semibold text-violet-950">Availability check</h2>
          <p
            className={`mt-4 rounded-3xl px-4 py-4 text-sm leading-6 ${
              availabilityType === "success"
                ? "bg-violet-50 text-violet-700"
                : availabilityType === "error"
                  ? "bg-purple-50 text-purple-700"
                  : availabilityType === "warning"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-slate-50 text-slate-600"
            }`}
          >
            {checkingAvailability ? "Checking current booking availability..." : availabilityMessage}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-7 shadow-panel">
          <h2 className="font-display text-xl font-semibold text-violet-950">Booking tips</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Use future dates or today only.</li>
            <li>Make sure end time is later than start time.</li>
            <li>Attendee count must not exceed the selected resource capacity.</li>
            <li>Overlapping bookings on the same resource are blocked automatically.</li>
          </ul>
        </section>
      </aside>
      ) : null}

      {availabilityModal.open ? (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-[28px] border border-violet-100 bg-white p-6 shadow-[0_24px_60px_rgba(76,29,149,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">Availability</p>
                <h3 className="mt-2 text-2xl font-semibold text-violet-950">
                  {availabilityModal.available ? "Time slot available" : "Time slot not available"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {availabilityModal.available
                    ? "This time slot is available for booking."
                    : `Conflicting approved bookings: ${availabilityModal.conflicts?.length || 0}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvailabilityModal({ open: false, available: null, conflicts: [] })}
                className="rounded-full border border-violet-200 px-3 py-1 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Close
              </button>
            </div>

            {!availabilityModal.available && availabilityModal.conflicts && availabilityModal.conflicts.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {availabilityModal.conflicts.map((c) => (
                  <li key={c.id} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
                    <div className="font-semibold">Booking #{c.id}</div>
                    <div className="text-slate-600">{c.bookingDate} · {c.startTime} - {c.endTime}</div>
                    <div className="text-slate-600">Requested by: {c.requesterName || c.requesterEmail}</div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setAvailabilityModal({ open: false, available: null, conflicts: [] })}
                className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function convertDisplayTimeTo24Hour(displayTime) {
  if (!displayTime) {
    return "";
  }

  const [timePart, meridiem] = displayTime.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatBackendTime(time) {
  const [rawHours, minutes] = time.split(":");
  let hours = Number(rawHours);
  const meridiem = hours >= 12 ? "PM" : "AM";

  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${meridiem}`;
}

export default BookingForm;
