import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import { theme } from './theme';

function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-inner container">
        <div className="brand" onClick={() => navigate('/')}>
          <span aria-hidden>🎟️</span>
          <span>Event Booking</span>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end>Events</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  React.useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.colors.primary);
  }, []);

  return (
    <>
      <Header />
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
          </Routes>
        </div>
      </main>
    </>
  );
}
