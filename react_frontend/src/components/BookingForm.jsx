import React, { useMemo, useState } from 'react';
import { createBooking, getApiErrorMessage, isApiSuccess } from '../api/client';

// PUBLIC_INTERFACE
export default function BookingForm({ eventId, availableSeats, onBooked }) {
  /** Booking form to create a booking for an event.
   * Props:
   *  - eventId: number|string
   *  - availableSeats: number
   *  - onBooked: function(booking, newAvailableSeats?)
   */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [seats, setSeats] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const disabled = useMemo(() => submitting || availableSeats <= 0, [submitting, availableSeats]);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name';
    // very simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Please enter a valid email';
    const seatsNum = Number(seats);
    if (!Number.isInteger(seatsNum) || seatsNum <= 0) return 'Seats must be a positive integer';
    if (availableSeats < seatsNum) return `Only ${availableSeats} seat(s) left`;
    return '';
  };

  // PUBLIC_INTERFACE
  const submit = async (e) => {
    /** Submit booking to API */
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const v = validate();
    if (v) {
      setMsg({ type: 'error', text: v });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        event_id: Number(eventId),
        user_name: name.trim(),
        user_email: email.trim(),
        seats: Number(seats),
      };
      const res = await createBooking(payload);
      if (isApiSuccess(res)) {
        setMsg({ type: 'success', text: 'Booking confirmed!' });
        setName('');
        setEmail('');
        setSeats(1);
        // If backend returns booking and possibly updated event info, try to derive new available
        let newAvailable = undefined;
        if (res.data && typeof res.data === 'object') {
          // Some backends may echo available seats; if not, compute locally
          if (typeof res.data.available_seats === 'number') {
            newAvailable = res.data.available_seats;
          } else {
            newAvailable = Math.max(0, Number(availableSeats) - Number(payload.seats));
          }
        }
        onBooked && onBooked(res.data, newAvailable);
      } else {
        setMsg({ type: 'error', text: getApiErrorMessage(res, 'Could not create booking') });
      }
    } catch (err) {
      setMsg({ type: 'error', text: getApiErrorMessage(err, 'Network error while creating booking') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
      <h2 style={{ margin: '8px 0' }}>Book your seats</h2>
      <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>
        Available seats: <strong>{availableSeats}</strong>
      </div>

      {msg.text ? (
        <div
          role="alert"
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${msg.type === 'error' ? 'crimson' : 'seagreen'}`,
            color: msg.type === 'error' ? 'crimson' : 'seagreen'
          }}
        >
          {msg.text}
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Name</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            style={inputStyle}
            disabled={disabled}
          />
        </label>

        <label style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
            style={inputStyle}
            disabled={disabled}
          />
        </label>

        <label style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Seats</div>
          <input
            type="number"
            min={1}
            step={1}
            value={seats}
            onChange={e => setSeats(e.target.value)}
            required
            style={inputStyle}
            disabled={disabled}
          />
        </label>

        <div>
          <button
            type="submit"
            className="theme-toggle"
            disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Booking…' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  outline: 'none'
};
