import React from 'react';

// PUBLIC_INTERFACE
export default function EventCard({ event }) {
  /** Compact card to show event summary in the list */
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 16,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        textAlign: 'left',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      className="event-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ margin: 0 }}>{event.title}</h3>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 12,
            border: '1px solid var(--border-color)',
            opacity: 0.85
          }}
        >
          {new Date(event.date).toLocaleDateString()}
        </span>
      </div>
      <p style={{ margin: '8px 0 12px', opacity: 0.85 }}>
        {event.description?.slice(0, 120) || ''}{event.description && event.description.length > 120 ? '…' : ''}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>${Number(event.price).toFixed(2)}</span>
        <span style={{ fontSize: 13, opacity: 0.8 }}>
          {event.available_seats} / {event.total_seats} seats
        </span>
      </div>
    </div>
  );
}
