import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL?.trim() || 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// PUBLIC_INTERFACE
export async function fetchEvents(signal) {
  /** Fetch all events. */
  const res = await api.get('/events', { signal });
  return res.data;
}

// PUBLIC_INTERFACE
export async function fetchEventById(id, signal) {
  /** Fetch event details by ID. */
  const res = await api.get(`/events/${id}`, { signal });
  return res.data;
}

// PUBLIC_INTERFACE
export async function createBooking(payload) {
  /** Create a booking for an event. 
   Expected payload: { event_id, user_name, user_email, seats_booked }
  */
  const res = await api.post('/bookings', payload);
  return res.data;
}

// PUBLIC_INTERFACE
export async function fetchBookings(signal) {
  /** Fetch bookings (optional helper for future enhancements). */
  const res = await api.get('/bookings', { signal });
  return res.data;
}
