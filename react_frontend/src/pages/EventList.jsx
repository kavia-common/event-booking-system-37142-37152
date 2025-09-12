import React from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../api/client';

function EventCard({ event }) {
  return (
    <div className="card" role="article">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ marginTop: 0 }}>{event.title}</h3>
        <span className="badge">{event.available_seats} left</span>
      </div>
      <p className="helper" style={{ marginTop: -6 }}>{new Date(event.date_time).toLocaleString()} at {event.venue}</p>
      <p style={{ marginTop: 8 }}>
        {event.description?.length > 160 ? event.description.slice(0, 160) + '…' : event.description}
      </p>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/events/${event.id}`} className="button">View details</Link>
      </div>
    </div>
  );
}

export default function EventList() {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchEvents(controller.signal)
      .then(setEvents)
      .catch((e) => setError(e?.message || 'Failed to load events'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

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
