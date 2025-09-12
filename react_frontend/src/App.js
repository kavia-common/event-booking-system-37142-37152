import React, { useState, useEffect } from 'react';
import './App.css';
import { Link, Route, Routes, Navigate } from 'react-router-dom';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';

// PUBLIC_INTERFACE
function App() {
  /** Root application with theme toggle and router layout */
  const [theme, setTheme] = useState('light');

  // apply theme attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark modes */
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', padding: '16px' }}>
        <nav className="navbar" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link className="App-link" to="/">Events</Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{ marginLeft: 'auto' }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </header>

      <main className="container" style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
