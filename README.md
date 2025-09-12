# event-booking-system-37142-37152

This workspace contains the React frontend in `react_frontend/`.

Quick start:
- cd react_frontend
- npm install
- npm start

Live updates:
- The frontend implements live seat availability updates using polling by default (every 4–5 seconds depending on page).
- If the backend adds WebSocket support in future, the polling hook can be swapped to a socket listener without structural changes.
- After creating a booking, the relevant event data is re-fetched immediately to reflect the new availability.

Docs:
- See `react_frontend/README.md` for detailed setup, environment, and live update behavior.