import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents, isApiSuccess, getApiErrorMessage } from '../api/client';
import EventCard from '../components/EventCard';

// PUBLIC_INTERFACE
export default function EventsList() {
  /** Lists all events with available seats and links to details */
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await fetchEvents();
        if (isApiSuccess(res)) {
          if (isMounted) setEvents(Array.isArray(res.data) ? res.data : []);
        } else {
          if (isMounted) setErr(getApiErrorMessage(res, 'Failed to load events'));
        }
      } catch (e) {
        if (isMounted) setErr(getApiErrorMessage(e, 'Network error while loading events'));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <p>Loading events…</p>;
  if (err) return <p style={{ color: 'crimson' }}>{err}</p>;
  if (!events.length) return <p>No events found.</p>;

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {events.map(ev => (
        <Link key={ev.id} to={`/events/${encodeURIComponent(ev.id)}`} style={{ textDecoration: 'none' }}>
          <EventCard event={ev} />
        </Link>
      ))}
    </div>
  );
}
