# React Frontend

## Introduction

This React application provides the user interface for the Event Booking System. Users can browse events, view event details, book seats, and see live seat availability updates via Server-Sent Events (SSE). It communicates with the FastAPI backend over HTTP.

## Prerequisites

- Node.js 18+ and npm
- Running FastAPI backend (default http://localhost:3001)
- Running MySQL database behind the backend (default localhost:5001 via mysql_database)

## Install and Run

1. Install dependencies:
   - npm install

2. Configure environment:
   - Create a .env file in this directory with:
     - REACT_APP_API_BASE=http://localhost:3001

3. Start the app:
   - npm start
   - The app will open at http://localhost:3000

4. Build for production:
   - npm run build

## Ports

- Frontend: 3000 (development)
- Backend API: 3001 (see backend README)
- Database: 5001 (see mysql_database README)

## Environment Variables

- REACT_APP_API_BASE
  - Base URL for the backend API
  - Default fallback in code: http://localhost:3001
  - Example .env:
    - REACT_APP_API_BASE=http://localhost:3001

Important: CRA only exposes variables prefixed with REACT_APP_ at build time. Restart the dev server after changing .env.

## API Usage

The frontend uses a small client in src/api/client.js:
- getApiBaseUrl(): reads REACT_APP_API_BASE or falls back to http://localhost:3001
- apiGet/apiPost: thin wrappers over fetch with JSON handling and timeouts
- Domain helpers:
  - fetchEvents(): GET /events
  - fetchEventById(id): GET /events/{id}
  - fetchBookings(): GET /bookings
  - createBooking(payload): POST /bookings
  - getSseUrlForEvent(id): constructs /events/{id}/stream for live updates

## Booking Flow

1. Users browse events on the home page (src/pages/EventsList.jsx) via GET /events.
2. Clicking an event navigates to details (src/pages/EventDetail.jsx) via GET /events/{id}.
3. EventDetail subscribes to SSE at /events/{id}/stream for live available_seats updates.
4. Users complete the BookingForm (src/components/BookingForm.jsx) which validates input.
5. Submitting posts to POST /bookings. On success:
   - A success message is shown
   - Available seats are optimistically updated locally and via SSE

## Step-by-Step Setup

1. Start the MySQL database (port 5001) using mysql_database/startup.sh.
2. Start the FastAPI backend on http://localhost:3001 with proper DB env.
3. Create .env with REACT_APP_API_BASE=http://localhost:3001.
4. Run npm install and npm start.
5. Visit http://localhost:3000 and test creating a booking.

## .env Usage

Create a .env file in this directory:
- REACT_APP_API_BASE=http://localhost:3001

Restart the dev server when .env changes.

## Troubleshooting

- API calls fail with Network error:
  - Ensure backend is running and REACT_APP_API_BASE is correct.
  - Check CORS configuration on backend (development default allows all).
- SSE stream does not deliver updates:
  - Confirm bookings are created successfully; backend broadcasts only after a successful POST /bookings.
  - Browser auto-reconnects on transient failures.
- 404 or empty events list:
  - Confirm backend DB has events. If using the MySQL schema/seed, ensure seed.sql ran.
- Port conflicts:
  - Change CRA dev server port with: PORT=3005 npm start
  - Or stop the conflicting service.
- After changing .env:
  - Restart the dev server to load new env variables.

## Project Structure

- src/pages/EventsList.jsx — Event listing
- src/pages/EventDetail.jsx — Event details + SSE + booking form
- src/components/BookingForm.jsx — Validated booking form
- src/api/client.js — API helpers and domain functions
- src/App.js — Routing and theme toggle

## Notes

- The API base URL is resolved at build-time/runtime from REACT_APP_API_BASE.
- For production builds, ensure the environment is set before running npm run build.
