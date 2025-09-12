import React from 'react';
import ConfirmModal from './ConfirmModal';

// simple email regex for validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUBLIC_INTERFACE
export default function BookingForm({ event, onBooked }) {
  /** Booking form for an event; validates and shows a confirm modal before posting. */
  const [values, setValues] = React.useState({
    user_name: '',
    user_email: '',
    seats_booked: 1
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const available = event?.available_seats ?? 0;

  const validate = () => {
    const e = {};
    if (!values.user_name.trim()) e.user_name = 'Name is required.';
    if (!values.user_email.trim()) e.user_email = 'Email is required.';
    else if (!EMAIL_RE.test(values.user_email.trim())) e.user_email = 'Enter a valid email.';
    const seats = Number(values.seats_booked);
    if (!Number.isFinite(seats) || seats <= 0) e.seats_booked = 'Seats must be greater than 0.';
    else if (seats > available) e.seats_booked = `Only ${available} seats available.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: name === 'seats_booked' ? value.replace(/[^0-9]/g, '') : value }));
  };

  const openConfirm = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (validate()) setConfirmOpen(true);
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        event_id: event.id,
        user_name: values.user_name.trim(),
        user_email: values.user_email.trim(),
        seats_booked: Number(values.seats_booked)
      };
      // lazy import to avoid circular deps
      const { createBooking } = await import('../api/client');
      const res = await createBooking(payload);
      setConfirmOpen(false);
      setValues({ user_name: '', user_email: '', seats_booked: 1 });
      onBooked?.(res);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create booking.';
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" aria-live="polite">
      <h3 style={{ marginTop: 0 }}>Book your seats</h3>
      <p className="helper" style={{ marginTop: '-8px' }}>
        Available seats: <span className="badge" aria-label={`Available seats ${available}`}>{available}</span>
      </p>

      <form onSubmit={openConfirm} noValidate>
        <div className="row">
          <div>
            <div className="label">Name</div>
            <input
              className="input"
              name="user_name"
              value={values.user_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
            />
            {errors.user_name && <div className="error">{errors.user_name}</div>}
          </div>

          <div>
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              name="user_email"
              value={values.user_email}
              onChange={handleChange}
              placeholder="jane@example.com"
              required
            />
            {errors.user_email && <div className="error">{errors.user_email}</div>}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="label">Seats</div>
          <input
            className="input"
            type="number"
            min="1"
            max={available}
            name="seats_booked"
            value={values.seats_booked}
            onChange={handleChange}
            placeholder="1"
            required
          />
          {errors.seats_booked && <div className="error">{errors.seats_booked}</div>}
        </div>

        {submitError && <div className="error" role="alert" style={{ marginTop: 12 }}>{submitError}</div>}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button accent" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Review & Confirm'}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm your booking"
        message={`Proceed to book ${values.seats_booked || 0} seat(s) for "${event?.title}"?`}
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Confirm Booking"
        cancelLabel="Back"
        busy={submitting}
      />
    </div>
  );
}
