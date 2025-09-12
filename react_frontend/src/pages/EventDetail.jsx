import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchEventById,
  getSseUrlForEvent,
  isApiSuccess,
  getApiErrorMessage
} from '../api/client';
import BookingForm from '../components/BookingForm';

// PUBLIC_INTERFACE
export default function EventDetail() {
  /** Shows event detail, live seat updates via SSE, and booking form */
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const eventSourceRef = useRef(null);

  // Load event details
  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await fetchEventById(id);
        if (isApiSuccess(res)) {
          ok && setEvent(res.data);
        } else {
          ok && setErr(getApiErrorMessage(res, 'Failed to load event'));
        }
      } catch (e) {
        ok && setErr(getApiErrorMessage(e, 'Network error while loading event'));
      } finally {
        ok && setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [id]);

  // Subscribe to SSE for live seat updates
  useEffect(() => {
    if (!id) return;
    const url = getSseUrlForEvent(id);
    try {
      const es = new EventSource(url, { withCredentials: false });
      eventSourceRef.current = es;
      es.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          // Expecting payload like { available_seats: number }
          setEvent(prev => prev ? { ...prev, available_seats: data.available_seats ?? prev.available_seats } : prev);
        } catch {
          // ignore malformed messages
        }
      };
      es.onerror = () => {
        // On error browser auto-reconnects; no-op
      };
    } catch {
      // EventSource may fail in some environments; ignore
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [id]);

  if (loading) return <p>Loading event…</p>;
  if (err) return <p style={{ color: 'crimson' }}>{err}</p>;
  if (!event) return <p>Event not found. <Link to="/">Back</Link></p>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
      <Link to="/" className="App-link">← Back to events</Link>
      <h1 className="title" style={{ marginTop: 8 }}>{event.title}</h1>
      <p className="description" style={{ opacity: 0.85 }}>{event.description}</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        margin: '16px 0'
      }}>
        <Info label="Date" value={new Date(event.date).toLocaleString()} />
        <Info label="Price" value={`$${Number(event.price).toFixed(2)}`} />
        <Info label="Total seats" value={String(event.total_seats)} />
        <Info label="Available" value={String(event.available_seats)} />
      </div>

      <BookingForm
        eventId={event.id}
        availableSeats={event.available_seats}
        onBooked={(booking, newAvailable) => {
          // Optimistically update available seats from server response if given
          setEvent(prev => prev ? { ...prev, available_seats: typeof newAvailable === 'number' ? newAvailable : prev.available_seats } : prev);
        }}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
