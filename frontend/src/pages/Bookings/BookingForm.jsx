import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createBooking, getAllBookings } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext.jsx";
import { RESOURCE_OPTIONS, TIME_SLOT_OPTIONS } from "../../utils/constants";

const initialForm = {
  resourceId: "1",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "1"
};

function BookingForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("Select date and time to check availability.");
  const [availabilityType, setAvailabilityType] = useState("neutral");

  const selectedResource = RESOURCE_OPTIONS.find(
    (resource) => resource.id === Number(formData.resourceId)
  );

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

  useEffect(() => {
    if (!canCheckAvailability) {
      setAvailabilityType("neutral");
      setAvailabilityMessage("Select date and time to check availability.");
      return;
    }

    const checkAvailability = async () => {
      setCheckingAvailability(true);

      try {
        const bookings = await getAllBookings({
          resourceId: Number(formData.resourceId),
          bookingDate: formData.bookingDate
        });

        const startTime = convertDisplayTimeTo24Hour(formData.startTime);
        const endTime = convertDisplayTimeTo24Hour(formData.endTime);

        if (endTime <= startTime) {
          setAvailabilityType("error");
          setAvailabilityMessage("End time must be later than start time.");
          return;
        }

        const conflict = bookings.find(
          (booking) =>
            ["PENDING", "APPROVED"].includes(booking.status) &&
            booking.startTime < endTime &&
            booking.endTime > startTime
        );

        if (conflict) {
          setAvailabilityType("error");
          setAvailabilityMessage(
            `Not available. Conflicts with booking #${conflict.id} from ${formatBackendTime(
              conflict.startTime
            )} to ${formatBackendTime(conflict.endTime)}.`
          );
          return;
        }

        setAvailabilityType("success");
        setAvailabilityMessage("Available for the selected time slot.");
      } catch (error) {
        setAvailabilityType("warning");
        setAvailabilityMessage(
          error?.response?.data?.message || "Could not verify availability right now."
        );
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [canCheckAvailability, formData.bookingDate, formData.endTime, formData.resourceId, formData.startTime]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        resourceId: Number(formData.resourceId),
        requesterId: currentUser.id,
        bookingDate: formData.bookingDate,
        startTime: `${convertDisplayTimeTo24Hour(formData.startTime)}:00`,
        endTime: `${convertDisplayTimeTo24Hour(formData.endTime)}:00`,
        purpose: formData.purpose.trim(),
        expectedAttendees: Number(formData.expectedAttendees)
      };

      const response = await createBooking(payload);
      toast.success(`Booking #${response.id} submitted for review`);
      setFormData(initialForm);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to create booking. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.8fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-panel">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            User Booking Form
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Request a new booking</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Create a booking request for a room or lab. The request will enter the pending queue
            until an admin reviews it.
          </p>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Select resource</span>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
            >
              {RESOURCE_OPTIONS.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="grid gap-2 sm:col-span-1">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Start time</span>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
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
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
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
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
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
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[32px] bg-slate-900 p-7 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
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
          <h2 className="font-display text-xl font-semibold text-ink">Availability check</h2>
          <p
            className={`mt-4 rounded-3xl px-4 py-4 text-sm leading-6 ${
              availabilityType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : availabilityType === "error"
                  ? "bg-rose-50 text-rose-700"
                  : availabilityType === "warning"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-50 text-slate-600"
            }`}
          >
            {checkingAvailability ? "Checking current booking availability..." : availabilityMessage}
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-7 shadow-panel">
          <h2 className="font-display text-xl font-semibold text-ink">Booking tips</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Use future dates or today only.</li>
            <li>Make sure end time is later than start time.</li>
            <li>Attendee count must not exceed the selected resource capacity.</li>
            <li>Overlapping bookings on the same resource are blocked automatically.</li>
          </ul>
        </section>
      </aside>
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
