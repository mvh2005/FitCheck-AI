import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Onboard from './pages/Onboard'
import Wardrobe from './pages/Wardrobe'
import Recommend from './pages/Recommend'

const NAV = [
  { to: '/wardrobe', label: '👗 My Closet' },
  { to: '/recommend', label: '✨ Get Fit' },
]

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen noise-bg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Background glow orbs */}
      <div className="glow-orb w-96 h-96 top-0 left-0 opacity-20" style={{ background: 'radial-gradient(circle, #A855F7, transparent)' }} />
      <div className="glow-orb w-80 h-80 top-1/3 right-0 opacity-15" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      <div className="glow-orb w-64 h-64 bottom-0 left-1/2 opacity-10" style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

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
          success: {
            iconTheme: { primary: '#A855F7', secondary: '#1A1A25' },
          },
          error: {
            iconTheme: { primary: '#F97316', secondary: '#1A1A25' },
          },
        }}
      />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className="mx-auto max-w-6xl mt-3 mx-4 sm:mx-auto px-5 h-14 flex items-center justify-between rounded-2xl"
          style={{
            background: 'rgba(17,17,24,0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(42,42,58,0.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}>
              ✦
            </div>
            <span className="font-display font-bold text-lg text-bright tracking-tight">
              FitCheck<span className="gradient-text">.ai</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Pages */}
      <main className="pt-20 relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrap><Onboard /></PageWrap>} />
            <Route path="/wardrobe" element={<PageWrap><Wardrobe /></PageWrap>} />
            <Route path="/recommend" element={<PageWrap><Recommend /></PageWrap>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
