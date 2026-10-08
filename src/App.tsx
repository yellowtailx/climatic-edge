// src/App.tsx
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import NavBar from './pages/NavBar';
import WeatherWidget from './pages/WeatherWidget';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import { SESSION_KEY } from './security/passwordAlgorithm';

// Only logged-in users can view the app; otherwise redirect to the login gate.
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold">ClimaticEdge</Link>
          <NavBar />
        </div>
      </header>
      {children}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <HomePage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedLayout>
                <NewsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedLayout>
                <WeatherWidget />
              </ProtectedLayout>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;