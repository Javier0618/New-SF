import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { Animes } from './pages/Animes';
import { LiveTv } from './pages/LiveTv';
import { Favorites } from './pages/Favorites';
import { ContinueWatching } from './pages/ContinueWatching';
import { ContentDetails } from './pages/ContentDetails';
import { SearchPage } from './pages/SearchPage';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-brand-dark text-slate-100 selection:bg-brand-red selection:text-white font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/series" element={<Series />} />
              <Route path="/animes" element={<Animes />} />
              <Route path="/live-tv" element={<LiveTv />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/continue-watching" element={<ContinueWatching />} />
              <Route path="/details/:type/:id" element={<ContentDetails />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
