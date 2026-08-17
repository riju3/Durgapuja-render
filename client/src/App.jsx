import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ── Lazy Loaded Page Routes (Loaded on-demand & cached in memory) ──
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Team = lazy(() => import('./pages/Team'));
const Contact = lazy(() => import('./pages/Contact'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Login = lazy(() => import('./pages/Login'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminDownloads = lazy(() => import('./pages/admin/AdminDownloads'));
const AdminSponsors = lazy(() => import('./pages/admin/AdminSponsors'));

// ── Ultra-Fast Minimal Spinner Fallback ──
const PageLoader = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', color: '#C0392B', fontFamily: 'Hind Siliguri, sans-serif'
  }}>
    <div style={{
      width: '36px', height: '36px', border: '3px solid #FDF6EC',
      borderTop: '3px solid #C0392B', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', marginBottom: '12px'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#7a5c4f' }}>লোডিং হচ্ছে...</p>
  </div>
);

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
};

const PublicLayout = ({ children }) => (
  <><Navbar />{children}<Footer /></>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <Suspense fallback={<PublicLayout><PageLoader /></PublicLayout>}>
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
            <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/downloads" element={<PublicLayout><Downloads /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
              <Route index element={<AdminDashboard />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="downloads" element={<AdminDownloads />} />
              <Route path="sponsors" element={<AdminSponsors />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
