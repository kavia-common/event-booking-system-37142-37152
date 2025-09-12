# React Frontend - Event Booking System

This is the React frontend for the Event Booking System.

Features:
- Event list and event detail pages
- Booking form with validation and confirm modal
- Responsive, modern light theme with primary/accent colors
- Live availability updates (polling)
- API client pointing to FastAPI backend (default http://localhost:3001)

Prerequisites:
- Node.js 18+ and npm

Environment:
- Create a `.env` file (optional). Defaults are sensible.
- Variables:
  - REACT_APP_API_BASE_URL: Base URL of FastAPI backend (default http://localhost:3001)

Example `.env`:
REACT_APP_API_BASE_URL=http://localhost:3001

Setup:
1) Install dependencies
   npm install

2) Start development server
   npm start
   The app runs at http://localhost:3000

Backend requirements:
Ensure the FastAPI backend is running, with CORS allowing http://localhost:3000, and exposes:
- GET /events
- GET /events/{id}
- POST /bookings
- (optional) GET /bookings

Live updates:
- The Event List polls the backend every 5s for fresh availability.
- The Event Detail page polls every 4s for the specific event.
- After a booking is created, the Event Detail is refreshed immediately to reflect updated availability.
- Polling pauses when the browser tab is hidden to save bandwidth and resumes when focused.
- Future WebSocket support: The app uses a generic `usePolling` hook that can be replaced with a WebSocket subscription where supported without changing page/component structure.

UI/UX and accessibility:
- Accessible modals with aria-modal and labelled title.
- Error and success messages announced using aria-live.
- Form validation ensures name/email format, seats > 0, and not exceeding available seats.
- If an event is sold out, booking inputs are disabled and a clear message is shown.
- Responsive grid layout: 3/2/1 columns based on viewport width.

Project structure:
- src/
  - api/client.js: Axios client and API helpers
  - pages/EventList.jsx: Event list with live polling
  - pages/EventDetail.jsx: Event detail with live polling
  - components/BookingForm.jsx: Booking UI with validation, modal confirmation, and success/error states
  - components/ConfirmModal.jsx: Accessible confirmation modal
  - hooks/usePolling.js: Generic polling hook
  - hooks/useEventRefresh.js: Helper to refresh a specific event
  - theme.js, index.css: Theme and styles
  - App.jsx, index.jsx: App bootstrapping and routing

Common workflows:
- View events: Navigate to home; data refreshes automatically.
- Book seats: On event detail, fill the form; confirm in modal; success banner appears and availability updates.
- Handle errors: API errors are shown inline; background polling errors do not disrupt the UI.

Notes:
- The booking form enforces: email format, seats_booked > 0, and not exceeding available seats.
- After a successful booking, the detail page refreshes the event to reflect updated availability.
