import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '🎨', title: 'Skin-tone AI', desc: 'Outfits matched to your palette' },
  { icon: '✨', title: 'Smart Fits', desc: 'ML-powered recommendations' },
  { icon: '🎲', title: 'Random Outfit', desc: 'Upload a pic, get surprised' },
  { icon: '🔒', title: 'Private', desc: 'Your data stays on-device' },
]

export default function Auth() {
  const { login, signup } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ displayName: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { displayName, username, password } = form
    if (!username.trim()) return toast.error('Enter a username 👀')
    if (!password.trim() || password.length < 4) return toast.error('Password needs ≥ 4 chars 🔑')
    if (mode === 'signup' && !displayName.trim()) return toast.error('What should we call you? 😊')

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(displayName.trim(), username.trim(), password)
        toast.success(`Welcome to FitCheck, ${displayName}! ✦`)
        nav('/onboard')
      } else {
        const user = await login(username.trim(), password)
        toast.success(`Back in action, ${user.displayName}! 🔥`)
        nav('/dashboard')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setForm({ displayName: '', username: '', password: '' })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0F' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden p-10"
        style={{ background: 'linear-gradient(145deg, #0D0D1A 0%, #130D24 60%, #0D1A24 100%)' }}>
        {/* Orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', filter: 'blur(60px)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}>✦</div>
            <span className="font-display font-bold text-2xl text-bright">
              FitCheck<span className="gradient-text">.ai</span>
            </span>
          </div>
          <p className="text-muted text-sm mt-3 leading-relaxed">
            Your AI-powered personal stylist. <br />
            Upload your drip, get outfit fits matched to your vibe.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-bright">{f.title}</p>
                <p className="text-xs text-muted">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-muted">© 2025 FitCheck.ai — Built for the bold ✦</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}>✦</div>
          <span className="font-display font-bold text-lg text-bright">FitCheck<span className="gradient-text">.ai</span></span>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#C084FC' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A855F7' }} />
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </div>
          </div>

          <h1 className="font-display font-bold text-4xl text-bright text-center mb-2">
            {mode === 'login' ? 'Sign in' : 'Get started'}
          </h1>
          <p className="text-muted text-center text-sm mb-8">
            {mode === 'login'
              ? 'Enter your credentials to access your wardrobe'
              : 'Join FitCheck.ai and elevate your style game'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}
            className="space-y-4 p-6 rounded-3xl"
            style={{ background: 'rgba(26,26,37,0.8)', border: '1px solid rgba(42,42,58,0.6)', backdropFilter: 'blur(20px)' }}>
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-1.5">
                    Display Name
                  </label>
                  <input
                    id="auth-display-name"
                    value={form.displayName}
                    onChange={set('displayName')}
                    placeholder="e.g. Alex"
                    className="genz-input"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-1.5">
                Username
              </label>
              <input
                id="auth-username"
                value={form.username}
                onChange={set('username')}
                placeholder={mode === 'signup' ? 'e.g. style_queen' : 'Your username'}
                className="genz-input"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min 4 characters"
                className="genz-input"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </span>
              ) : (
                mode === 'signup' ? 'Create account ✦' : 'Sign in →'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              id="auth-toggle"
              onClick={toggleMode}
              className="font-semibold transition-colors hover:underline"
              style={{ color: '#A855F7' }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
