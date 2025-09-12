import React from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/client';
import { usePolling } from '../hooks/usePolling';

function EventCard({ event }) {
  const soldOut = (event.available_seats ?? 0) <= 0;
  return (
    <div className="card" role="article" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <h3 style={{ marginTop: 0 }}>{event.title}</h3>
        <span className="badge" aria-label={`${event.available_seats} seats left`}>
          {soldOut ? 'Sold out' : `${event.available_seats} left`}
        </span>
      </div>
      <p className="helper" style={{ marginTop: -6 }}>{new Date(event.date_time).toLocaleString()} at {event.venue}</p>
      <p style={{ marginTop: 8 }}>
        {event.description?.length > 160 ? event.description.slice(0, 160) + '…' : event.description}
      </p>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/events/${event.id}`} className="button" aria-disabled={soldOut}>
          View details
        </Link>
      </div>
    </div>
  );
}

export default function EventList() {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const initialLoad = React.useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchEvents(controller.signal)
      .then(setEvents)
      .catch((e) => setError(e?.message || 'Failed to load events'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    const cleanup = initialLoad();
    return cleanup;
  }, [initialLoad]);

  // Live polling for availability every 5 seconds
  const { start, stop } = usePolling({
    fetcher: () => fetchEvents(),
    onData: setEvents,
    intervalMs: 5000,
    enabled: true
  });

  // Improve UX: refresh when tab/window gains focus
  React.useEffect(() => {
    const onFocus = () => start();
    const onBlur = () => stop();
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [start, stop]);

  return (
    <section aria-busy={loading}>
      <h2 style={{ marginTop: 0 }}>Upcoming Events</h2>
      {loading && <p className="helper">Loading events…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="list">
          {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
        </div>
      )}
    </section>
  );
}
