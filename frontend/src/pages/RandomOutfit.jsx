import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { generateRandomOutfit } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const STYLE_HINTS = [
  { label: 'Minimal', emoji: '🤍' },
  { label: 'Streetwear', emoji: '🧢' },
  { label: 'Y2K', emoji: '⭐' },
  { label: 'Coquette', emoji: '🎀' },
  { label: 'Business', emoji: '💼' },
  { label: 'Cottagecore', emoji: '🌿' },
  { label: 'Dark Academia', emoji: '📚' },
  { label: 'Grunge', emoji: '🖤' },
]

function ColorSwatch({ hex }) {
  return (
    <div
      title={hex}
      className="w-8 h-8 rounded-full border-2 flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
      style={{ backgroundColor: hex, borderColor: 'rgba(255,255,255,0.15)' }}
    />
  )
}

function OccasionChip({ label }) {
  return (
    <span className="text-xs px-3 py-1 rounded-full font-medium"
      style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#C084FC' }}>
      {label}
    </span>
  )
}

function ResultCard({ result }) {
  const items = result.items || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card overflow-hidden"
    >
      {/* Card header with concept name */}
      <div className="px-6 py-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(6,182,212,0.08))' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent)', filter: 'blur(30px)', transform: 'translate(30%, -30%)' }} />
        {result.mock && (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mb-3 font-semibold"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#FB923C' }}>
            ⚡ Demo mode — add GEMINI_API_KEY for live AI
          </span>
        )}
        <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#A855F7' }}>
          AI Outfit Concept
        </p>
        <h2 className="font-display font-bold text-2xl text-bright relative z-10">
          {result.concept || 'Your Signature Look'}
        </h2>
        {result.vibe && (
          <p className="text-sm text-muted mt-2 relative z-10">{result.vibe}</p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Color palette */}
        {result.colors?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">🎨 Color Palette</p>
            <div className="flex items-center gap-2 flex-wrap">
              {result.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ColorSwatch hex={c} />
                  <span className="text-xs font-mono text-muted">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outfit items */}
        {Object.keys(items).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">👗 The Outfit</p>
            <div className="space-y-2.5">
              {Object.entries(items).map(([key, value]) => {
                const ICONS = { top: '👕', bottom: '👖', shoes: '👟', accessory: '💍', outerwear: '🧥', dress: '👗' }
                return (
                  <div key={key}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-lg flex-shrink-0">{ICONS[key] || '✦'}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{key}</p>
                      <p className="text-sm text-bright mt-0.5">{value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Occasions */}
        {result.occasions?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">📅 Best For</p>
            <div className="flex flex-wrap gap-2">
              {result.occasions.map(o => <OccasionChip key={o} label={o} />)}
            </div>
          </div>
        )}

        {/* Styling tip */}
        {result.tip && (
          <div className="p-4 rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#06B6D4' }}>
              💡 Styling Tip
            </p>
            <p className="text-sm text-soft">{result.tip}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function RandomOutfit() {
  const { user } = useAuth()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [styleHint, setStyleHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback(([file]) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop,
  })

  const handleGenerate = async () => {
    if (!image) return toast.error('Upload a photo first 📸')
    const fd = new FormData()
    fd.append('image', image)
    fd.append('style_hint', styleHint)
    fd.append('gender', localStorage.getItem('fitcheck_gender') || '')
    fd.append('body_type', localStorage.getItem('fitcheck_body_type') || '')

    setLoading(true)
    setResult(null)
    try {
      const { data } = await generateRandomOutfit(fd)
      setResult(data)
      toast.success('AI has spoken ✨')
    } catch {
      toast.error('Could not reach the AI — is the backend running? 🤔')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F97316' }}>
          Gemini Vision AI
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-bright">
          Surprise me with{' '}
          <span className="gradient-text-fire">an outfit</span> 🎲
        </h1>
        <p className="text-muted text-sm mt-3 max-w-md">
          Upload any photo — yourself, your room, a mood board. Our AI will craft a complete outfit suggestion just for you.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Upload + controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-5"
        >
          {/* Drop zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
              📸 Your Photo
            </label>
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden
                ${isDragActive ? 'dropzone-genz scale-[1.01]' : 'border-border hover:border-neon/40 hover:bg-neon/5'}`}
              style={{ minHeight: 240 }}
            >
              <input {...getInputProps()} id="random-outfit-upload" />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="uploaded"
                    className="w-full object-cover"
                    style={{ maxHeight: 320 }} />
                  <div className="absolute inset-0 flex items-end p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                    <p className="text-xs text-white/70">Tap to change photo</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="text-5xl"
                  >
                    🤳
                  </motion.div>
                  <p className="text-sm font-medium text-soft">
                    {isDragActive ? 'Drop it here!' : 'Drop a photo or tap to browse'}
                  </p>
                  <p className="text-xs text-muted">Any image — yourself, moodboard, context</p>
                </div>
              )}
            </div>
          </div>

          {/* Style hint */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
              Style Vibe <span className="text-muted normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {STYLE_HINTS.map(h => (
                <button key={h.label}
                  id={`style-hint-${h.label.toLowerCase()}`}
                  onClick={() => setStyleHint(p => p === h.label ? '' : h.label)}
                  className={`chip ${styleHint === h.label ? 'chip-active' : ''}`}>
                  <span>{h.emoji}</span> {h.label}
                </button>
              ))}
            </div>
            <input
              id="random-style-custom"
              value={styleHint}
              onChange={e => setStyleHint(e.target.value)}
              placeholder="Or type your own vibe…"
              className="genz-input"
            />
          </div>

          {/* Generate button */}
          <button
            id="random-outfit-generate"
            onClick={handleGenerate}
            disabled={loading || !image}
            className="btn-primary w-full py-4 text-base disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is crafting your look…
              </span>
            ) : '🎲 Generate My Outfit'}
          </button>
        </motion.div>

        {/* Right: Result */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 h-full flex flex-col items-center justify-center gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-border border-t-orange-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🎨</div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-bright">AI is thinking…</p>
                  <p className="text-xs text-muted mt-1">Analyzing your photo and crafting a unique look</p>
                </div>
                {/* Shimmer cards */}
                <div className="w-full space-y-2 mt-2">
                  {[80, 60, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded-full shimmer-loading" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ResultCard result={result} />
              </motion.div>
            )}
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 h-full flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="text-5xl animate-float">🪄</div>
                <p className="font-display font-bold text-xl text-soft">Ready to surprise you</p>
                <p className="text-xs text-muted max-w-xs">
                  Upload a photo on the left and hit Generate — our AI will craft a complete styled look just for you.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
