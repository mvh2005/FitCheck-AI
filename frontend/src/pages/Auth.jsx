import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../utils/api'

const FEATURES = [
  { icon: '🎨', title: 'Skin-tone AI', desc: 'Outfits matched to your palette' },
  { icon: '✨', title: 'Smart Fits', desc: 'ML-powered recommendations' },
  { icon: '🎲', title: 'Random Outfit', desc: 'Upload a pic, get surprised' },
  { icon: '🔒', title: 'Private', desc: 'Your data stays on-device' },
]

export default function Auth() {
  const { loginWithGoogle } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const u = await loginWithGoogle()
      toast.success(`Welcome to FitCheck, ${u.displayName}! ✦`)
      
      // Query backend to check if profile exists
      try {
        const { data } = await getProfile(u.uid.toLowerCase())
        if (data && data.skin_tone) {
          // User is already onboarded! Cache profiles details
          localStorage.setItem('fitcheck_skin_tone', data.skin_tone?.hex || '#c68642')
          localStorage.setItem('fitcheck_gender', data.gender || '')
          localStorage.setItem('fitcheck_body_type', data.body_type || '')
          nav('/dashboard')
        } else {
          nav('/onboard')
        }
      } catch (err) {
        // Profile not found (404), go to onboard
        nav('/onboard')
      }
    } catch (err) {
      toast.error(err.message || 'Google Sign-in failed 😬')
    } finally {
      setLoading(false)
    }
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#C084FC' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A855F7' }} />
              Secure Authentication
            </div>
          </div>

          <h1 className="font-display font-bold text-4xl text-bright text-center mb-2">
            Sign in
          </h1>
          <p className="text-muted text-center text-sm mb-8">
            Elevate your style game with FitCheck.ai
          </p>

          {/* Google Sign-in Card */}
          <div className="space-y-4 p-8 rounded-3xl text-center"
            style={{ background: 'rgba(26,26,37,0.8)', border: '1px solid rgba(42,42,58,0.6)', backdropFilter: 'blur(20px)' }}>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              Sign in securely via Google to manage your wardrobe, analyze your skin tone, and receive tailored style recommendations.
            </p>

            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98] border cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#F9FAFB',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(168,85,247,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting…
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
