import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Onboard from './pages/Onboard'
import Wardrobe from './pages/Wardrobe'
import Recommend from './pages/Recommend'
import RandomOutfit from './pages/RandomOutfit'

const NAV = [
  { to: '/dashboard',     icon: '⊞',  label: 'Dashboard',     id: 'nav-dashboard' },
  { to: '/wardrobe',      icon: '👗',  label: 'My Closet',     id: 'nav-wardrobe' },
  { to: '/recommend',     icon: '✨',  label: 'Get Fits',      id: 'nav-recommend' },
  { to: '/random-outfit', icon: '🎲',  label: 'Random Outfit', id: 'nav-random',  hot: true },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const initial = (user?.displayName || user?.username || 'U')[0].toUpperCase()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✦</div>
        <span className="sidebar-logo-text">
          FitCheck<span className="gradient-text">.ai</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            id={n.id}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <span className="sidebar-link-icon">{n.icon}</span>
            <span className="sidebar-link-label">{n.label}</span>
            {n.hot && (
              <span className="sidebar-hot-badge">NEW</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="sidebar-footer">
        <NavLink to="/onboard" id="nav-profile" className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.displayName || user?.username}</p>
            <p className="sidebar-user-sub">@{user?.username}</p>
          </div>
        </NavLink>
        <button id="nav-logout" onClick={logout} className="sidebar-logout" title="Sign out">
          ↪
        </button>
      </div>
    </aside>
  )
}

function MobileNav() {
  return (
    <nav className="mobile-nav">
      {NAV.map(n => (
        <NavLink
          key={n.to}
          to={n.to}
          id={`mobile-${n.id}`}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
        >
          <span className="mobile-nav-icon">{n.icon}</span>
          <span className="mobile-nav-label">{n.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function App() {
  const location = useLocation()
  const { user } = useAuth()
  const isAuthPage = location.pathname === '/login'

  return (
    <div className="app-root noise-bg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Ambient background orbs */}
      <div className="glow-orb w-96 h-96 top-0 left-64 opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />
      <div className="glow-orb w-80 h-80 top-1/3 right-0 opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      <div className="glow-orb w-64 h-64 bottom-0 left-1/2 opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A25',
            color: '#F9FAFB',
            border: '1px solid #2A2A3A',
            borderRadius: '16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#A855F7', secondary: '#1A1A25' } },
          error:   { iconTheme: { primary: '#F97316', secondary: '#1A1A25' } },
        }}
      />

      {!isAuthPage && user && <Sidebar />}
      {!isAuthPage && user && <MobileNav />}

      <main className={!isAuthPage && user ? 'app-main' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Auth */}
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />

            {/* Protected routes */}
            <Route path="/dashboard"     element={<ProtectedRoute><PageWrap><Dashboard /></PageWrap></ProtectedRoute>} />
            <Route path="/onboard"       element={<ProtectedRoute><PageWrap><Onboard /></PageWrap></ProtectedRoute>} />
            <Route path="/wardrobe"      element={<ProtectedRoute><PageWrap><Wardrobe /></PageWrap></ProtectedRoute>} />
            <Route path="/recommend"     element={<ProtectedRoute><PageWrap><Recommend /></PageWrap></ProtectedRoute>} />
            <Route path="/random-outfit" element={<ProtectedRoute><PageWrap><RandomOutfit /></PageWrap></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
