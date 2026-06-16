import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Onboard from './pages/Onboard'
import Wardrobe from './pages/Wardrobe'
import Recommend from './pages/Recommend'

const NAV = [
  { to: '/wardrobe', label: 'My Closet' },
  { to: '/recommend', label: 'Get Outfit' },
]

export default function App() {
  const { user, loading, signIn, logOut } = useAuth()
  const location = useLocation()

  // Loading spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F5F0E8' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-stone-300 border-t-charcoal rounded-full"
        />
      </div>
    )
  }

  // Not signed in → show sign-in screen
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F5F0E8' }}>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }
        }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <h1 className="font-display text-5xl leading-tight mb-4" style={{ color: '#1C1C1E' }}>
            FitCheck<span style={{ color: '#8B7355' }}>.ai</span>
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#6B7280' }}>
            Your personal AI style assistant. Upload your wardrobe, get outfit
            recommendations matched to your skin tone and occasion.
          </p>

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-charcoal
                       py-3.5 px-6 font-medium text-sm hover:border-stone-400 transition-colors cursor-pointer"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs mt-6" style={{ color: '#9CA3AF' }}>
            Secure authentication via Google &amp; Firebase
          </p>
        </motion.div>
      </div>
    )
  }

  // Signed in → show the app
  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }
      }} />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <NavLink to="/" className="font-display text-xl tracking-tight text-charcoal">
            FitCheck<span style={{ color: '#8B7355' }}>.ai</span>
          </NavLink>
          <div className="flex items-center gap-6">
            <nav className="flex gap-8">
              {NAV.map(n => (
                <NavLink key={n.to} to={n.to}
                  className={({ isActive }) =>
                    `text-sm tracking-wide transition-colors duration-150 ${
                      isActive ? 'text-mink font-medium' : 'text-slate hover:text-charcoal'
                    }`
                  }>
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-7 h-7 rounded-full border border-stone-200"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-xs text-stone-500 hidden sm:inline">
                {user.displayName?.split(' ')[0]}
              </span>
              <button
                onClick={logOut}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pages */}
      <main className="pt-14">
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
