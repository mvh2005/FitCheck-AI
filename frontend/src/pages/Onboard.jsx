import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { onboardUser } from '../utils/api'
import { useAuth } from '../context/AuthContext'


const GENDERS = [
  { value: 'Male', emoji: '⚡' },
  { value: 'Female', emoji: '🌸' },
  { value: 'Non-binary', emoji: '✦' },
]
const BODY_TYPES = [
  { value: 'Slim', emoji: '🪶' },
  { value: 'Athletic', emoji: '💪' },
  { value: 'Average', emoji: '⭐' },
  { value: 'Plus', emoji: '🌙' },
]

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
}

export default function Onboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [userId, setUserId] = useState(user?.username || '')
  const [gender, setGender] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [selfie, setSelfie] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: ([file]) => {
      setSelfie(file)
      setPreview(URL.createObjectURL(file))
    },
  })

  const handleSubmit = async () => {
    if (!userId.trim()) return toast.error('Drop your username first 👀')
    if (!gender) return toast.error('Pick your vibe 💫')
    if (!bodyType) return toast.error('Select your body type ✨')
    if (!selfie) return toast.error('We need a selfie for skin tone matching 📸')

    const fd = new FormData()
    fd.append('user_id', userId.trim())
    fd.append('gender', gender.toLowerCase())
    fd.append('body_type', bodyType.toLowerCase())
    fd.append('selfie', selfie)

    setLoading(true)
    try {
      const { data } = await onboardUser(fd)
      localStorage.setItem('fitcheck_user_id', data.user_id)
      localStorage.setItem('fitcheck_skin_tone', data.skin_tone?.hex || '#c68642')
      localStorage.setItem('fitcheck_gender', gender.toLowerCase())
      localStorage.setItem('fitcheck_body_type', bodyType.toLowerCase())
      toast.success(`Profile set! Skin tone: ${data.skin_tone?.fitzpatrick_label} 🎉`)
      setTimeout(() => nav('/dashboard'), 1200)
    } catch {
      toast.error('Something glitched — is the backend up? 🤔')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-14"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#C084FC',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" style={{ background: '#A855F7' }} />
          AI-Powered Style Assistant
        </motion.div>

        <h1 className="font-display font-bold text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-5">
          Your drip,{' '}
          <span className="gradient-text">AI-rated</span>
          <span className="block text-bright mt-1">every day ✦</span>
        </h1>
        <p className="text-muted text-base leading-relaxed max-w-sm mx-auto">
          Upload your fits once. Get outfit combos matched to{' '}
          <span style={{ color: '#A855F7' }}>your skin tone</span> and the vibe you're going for.
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="glass-card p-6 sm:p-8 space-y-7"
      >
        {/* Username */}
        <motion.div variants={stagger.item}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
            Your handle
          </label>
          <input
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="e.g. it_girl_vibes"
            className="genz-input"
          />
        </motion.div>

        {/* Gender */}
        <motion.div variants={stagger.item}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Identity
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(g => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`chip ${gender === g.value ? 'chip-active' : ''}`}
              >
                <span>{g.emoji}</span>
                {g.value}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Body type */}
        <motion.div variants={stagger.item}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Body type
          </label>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map(b => (
              <button
                key={b.value}
                onClick={() => setBodyType(b.value)}
                className={`chip ${bodyType === b.value ? 'chip-active' : ''}`}
              >
                <span>{b.emoji}</span>
                {b.value}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Selfie drop zone */}
        <motion.div variants={stagger.item}>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            📸 Selfie — for skin tone AI
          </label>
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300
              ${isDragActive ? 'dropzone-genz scale-[1.01]' : 'border-border hover:border-neon/40 hover:bg-neon/5'}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img src={preview} alt="selfie preview"
                    className="w-28 h-28 object-cover rounded-full"
                    style={{ border: '3px solid', borderImage: 'linear-gradient(135deg, #A855F7, #06B6D4) 1', borderRadius: '50%' }} />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}>
                    ✓
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: '#C084FC' }}>{selfie.name}</p>
                <p className="text-xs text-muted">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="text-3xl mb-1">🤳</div>
                <p className="text-sm font-medium text-soft">
                  {isDragActive ? 'Drop it here!' : 'Drop your selfie or tap to browse'}
                </p>
                <p className="text-xs text-muted">PNG, JPG — used only for skin tone detection</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={stagger.item}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full text-base py-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up your profile…
              </span>
            ) : (
              <span>Let's get it ✦</span>
            )}
          </button>
          <p className="text-center text-xs text-muted mt-3">
            Already set up? Head to{' '}
            <a href="/wardrobe" className="text-neon hover:underline" style={{ color: '#A855F7' }}>My Closet</a>
          </p>
        </motion.div>
      </motion.div>

      {/* Feature pills at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-3 mt-8"
      >
        {['🎨 Skin-tone matching', '🤖 AI outfit scoring', '💫 Occasion-based fits', '🔒 Private & secure'].map(f => (
          <span key={f} className="text-xs px-3 py-1.5 rounded-full text-muted"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {f}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
