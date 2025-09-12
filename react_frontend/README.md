# React Frontend - Event Booking System

This is the React frontend for the Event Booking System.

Features:
- Event list and event detail pages
- Booking form with validation and confirm modal
- Responsive, modern light theme with primary/accent colors
- Live updates to seat availability after booking
- API client pointing to FastAPI backend (default http://localhost:3001)

Prerequisites:
- Node.js 18+ and npm

Setup:
1. Install dependencies
   npm install

2. Configure environment
   Copy .env.example to .env and adjust if needed (optional). The default backend URL is http://localhost:3001.
   REACT_APP_API_BASE_URL=http://localhost:3001

3. Start development server
   npm start
   The app runs at http://localhost:3000

Backend:
Ensure the FastAPI backend is running with CORS allowing http://localhost:3000 and exposes:
- GET /events
- GET /events/{id}
- POST /bookings

Notes:
- The booking form enforces: email format, seats_booked > 0, and not exceeding available seats.
- After a successful booking, the detail page refreshes the event to reflect updated availability.
