import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getRecommendations, imageUrl } from '../utils/api'

const OCCASIONS = [
  { label: 'casual', emoji: '😎' },
  { label: 'office', emoji: '💼' },
  { label: 'wedding', emoji: '💍' },
  { label: 'party', emoji: '🎉' },
  { label: 'gym', emoji: '💪' },
  { label: 'beach', emoji: '🏖️' },
  { label: 'date', emoji: '💖' },
  { label: 'festival', emoji: '🎪' },
  { label: 'formal', emoji: '🎩' },
]

function ScoreBar({ label, value, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted font-medium">{label}</span>
        <span className="font-bold" style={{ color: color || '#A855F7' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="score-bar-track">
        <motion.div
          className="score-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={color ? { background: color } : {}}
        />
      </div>
    </div>
  )
}

const SCORE_COLORS = {
  vector_similarity: 'linear-gradient(90deg, #A855F7, #818CF8)',
  skin_compatibility: 'linear-gradient(90deg, #F472B6, #FB923C)',
  color_harmony: 'linear-gradient(90deg, #06B6D4, #34D399)',
  occasion_match: 'linear-gradient(90deg, #FBBF24, #84CC16)',
}

function OutfitCard({ outfit, rank }) {
  const [expanded, setExpanded] = useState(false)
  const items = [
    { label: 'Top', emoji: '👕', data: outfit.top },
    { label: 'Bottom', emoji: '👖', data: outfit.bottom },
    { label: 'Shoes', emoji: '👟', data: outfit.shoes },
  ].filter(i => i.data)

  const score = outfit.scores?.overall ?? 0
  const scorePercent = Math.round(score * 100)

  const scoreColor = scorePercent >= 80 ? '#A855F7' : scorePercent >= 60 ? '#06B6D4' : '#F97316'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(42,42,58,0.6)' }}>
        <div className="flex items-center gap-3">
          {/* Rank badge */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)', color: '#fff' }}>
            {rank + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-bright">Outfit #{rank + 1}</p>
            <p className="text-xs text-muted">AI-generated combination</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score badge */}
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold font-display" style={{ color: scoreColor }}>
              {scorePercent}%
            </span>
            <span className="text-xs text-muted">match</span>
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="btn-ghost text-xs px-3 py-1.5 rounded-xl">
            {expanded ? '↑ less' : 'details ↓'}
          </button>
        </div>
      </div>

      {/* Score progress bar at top */}
      <div className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, #A855F7, #06B6D4)', width: `${scorePercent}%` }} />

      {/* Outfit items grid */}
      <div className={`grid gap-0`}
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(({ label, emoji, data }, idx) => (
          <div key={label}
            className="relative"
            style={{ borderRight: idx < items.length - 1 ? '1px solid rgba(42,42,58,0.4)' : 'none' }}>
            {/* Image */}
            <div className="aspect-square" style={{ background: '#0A0A0F' }}>
              <img
                src={imageUrl(data?.image_filename)}
                alt={label}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.parentElement.style.background = data?.color_hex || '#1A1A25'
                  e.target.style.display = 'none'
                }}
              />
            </div>
            {/* Label overlay */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {emoji} {label}
                </p>
                <p className="text-xs text-soft truncate mt-0.5">
                  {data?.color_name || data?.color_hex}
                </p>
              </div>
              {data?.color_hex && (
                <div className="w-4 h-4 rounded-full flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: data.color_hex }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded score breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(42,42,58,0.6)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
                ✦ Score breakdown
              </p>
              <ScoreBar
                label="Vector similarity"
                value={outfit.scores?.vector_similarity ?? 0}
                color={SCORE_COLORS.vector_similarity}
              />
              <ScoreBar
                label="Skin compatibility"
                value={outfit.scores?.skin_compatibility ?? 0}
                color={SCORE_COLORS.skin_compatibility}
              />
              <ScoreBar
                label="Color harmony"
                value={outfit.scores?.color_harmony ?? 0}
                color={SCORE_COLORS.color_harmony}
              />
              <ScoreBar
                label="Occasion match"
                value={outfit.scores?.occasion_match ?? 0}
                color={SCORE_COLORS.occasion_match}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LoadingPulse() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl shimmer-loading" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-32 rounded shimmer-loading" />
              <div className="h-2 w-24 rounded shimmer-loading" />
            </div>
          </div>
          <div className="grid grid-cols-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="aspect-square shimmer-loading" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Recommend() {
  const userId = localStorage.getItem('fitcheck_user_id') || 'guest'
  const skinTone = localStorage.getItem('fitcheck_skin_tone') || '#c68642'
  const [occasion, setOccasion] = useState('')
  const [styleNote, setStyleNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [outfits, setOutfits] = useState(null)
  const [usedOccasion, setUsedOccasion] = useState('')

  const handleRecommend = async () => {
    if (!occasion) return toast.error('Pick an occasion first 👀')
    const fd = new FormData()
    fd.append('user_id', userId)
    fd.append('occasion', occasion)
    fd.append('style_preference', styleNote)
    setLoading(true)
    setOutfits(null)
    try {
      const { data } = await getRecommendations(fd)
      setOutfits(data.outfits || [])
      setUsedOccasion(occasion)
      if (data.outfits?.length === 0) toast.error('No fits found — add more pieces to your closet 👗')
    } catch {
      toast.error('AI is thinking... is the backend running? 🤔')
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
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: '#A855F7' }}>AI outfit engine</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-bright">
          What's the <span className="gradient-text-fire">vibe?</span>
        </h1>
        <p className="text-muted text-sm mt-3 max-w-md">
          Tell us the occasion and your skin tone is already factored in.
          AI picks the best combos from your closet.
        </p>
      </motion.div>

      {/* Controls card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="glass-card p-6 mb-8 space-y-6"
      >
        {/* Skin tone display */}
        <div className="flex items-center gap-3 pb-4"
          style={{ borderBottom: '1px solid rgba(42,42,58,0.4)' }}>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 flex-shrink-0"
              style={{ backgroundColor: skinTone, borderColor: 'rgba(255,255,255,0.15)' }} />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }}>
              ✓
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Your skin tone</p>
            <p className="text-sm font-mono text-soft mt-0.5">{skinTone}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.25)' }}>
              AI-matched
            </span>
          </div>
        </div>

        {/* Occasions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Pick the occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(o => (
              <button key={o.label} onClick={() => setOccasion(o.label)}
                className={`occ-chip flex items-center gap-1.5 ${occasion === o.label ? 'occ-chip-active' : ''}`}>
                <span>{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
            Style note <span className="normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <input
            value={styleNote}
            onChange={e => setStyleNote(e.target.value)}
            placeholder="e.g. minimalist, y2k, coquette, streetwear…"
            className="genz-input"
          />
        </div>

        {/* CTA */}
        <button onClick={handleRecommend} disabled={loading || !occasion}
          className="btn-primary w-full py-4 text-base disabled:opacity-40">
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI is cooking…
            </span>
          ) : '✨ Generate my fits'}
        </button>
      </motion.div>

      {/* Loading */}
      {loading && <LoadingPulse />}

      {/* Results */}
      {outfits && outfits.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="font-display font-bold text-2xl text-bright">
              Fits for{' '}
              <span className="gradient-text">{usedOccasion}</span>
            </h2>
            <span className="text-sm text-muted px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {outfits.length} suggestions
            </span>
          </div>
          <div className="space-y-4">
            {outfits.map((outfit, i) => (
              <OutfitCard key={i} outfit={outfit} rank={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty */}
      {outfits && outfits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4 animate-float">🤷</div>
          <p className="font-display font-bold text-2xl text-soft mb-2">No fits found</p>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Add tops, bottoms & shoes to your closet so AI has pieces to mix & match
          </p>
          <a href="/wardrobe" className="btn-secondary inline-flex mt-6">
            👗 Go to My Closet
          </a>
        </motion.div>
      )}
    </div>
  )
}
