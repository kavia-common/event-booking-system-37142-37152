import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEventById } from '../api/client';
import BookingForm from '../components/BookingForm';
import { useEventRefresh } from '../hooks/useEventRefresh';
import { usePolling } from '../hooks/usePolling';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const refresh = useEventRefresh(setEvent);

  const load = React.useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchEventById(id, controller.signal)
      .then(setEvent)
      .catch((e) => setError(e?.response?.data?.detail || e?.message || 'Failed to load event'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  React.useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  // Live polling of this specific event every 4 seconds
  usePolling({
    fetcher: () => fetchEventById(id),
    onData: setEvent,
    intervalMs: 4000,
    enabled: true
  });

  const handleBooked = async () => {
    // After booking, refresh this event to reflect new availability quickly
    await refresh(id);
  };

  if (loading) return <p className="helper">Loading event…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!event) return <p className="helper">Event not found.</p>;

  const soldOut = (event.available_seats ?? 0) <= 0;

  return (
    <article aria-live="polite">
      <Link to="/" className="helper">← Back to events</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>{event.title}</h2>
            <p className="helper" style={{ marginTop: -6 }}>
              {new Date(event.date_time).toLocaleString()} · {event.venue}
            </p>
          </div>
          <div>
            <span className="badge" aria-label={`${event.available_seats} seats left`}>
              {soldOut ? 'Sold out' : `${event.available_seats} left`}
            </span>
          </div>
        </div>
        <p style={{ marginTop: 8 }}>{event.description}</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <BookingForm event={event} onBooked={handleBooked} />
      </div>
    </article>
  );
}
