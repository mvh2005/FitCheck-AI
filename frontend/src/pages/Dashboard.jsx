import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    id: 'dash-wardrobe',
    icon: '👗',
    emoji_bg: 'linear-gradient(135deg, #818CF8, #A855F7)',
    title: 'My Wardrobe',
    desc: 'Upload and manage your clothing collection. AI detects category, color & pattern automatically.',
    cta: 'Open Closet →',
    href: '/wardrobe',
    tag: 'Digital Closet',
    tagColor: '#818CF8',
    tagBg: 'rgba(129,140,248,0.12)',
  },
  {
    id: 'dash-recommend',
    icon: '✨',
    emoji_bg: 'linear-gradient(135deg, #06B6D4, #34D399)',
    title: 'Get Fits',
    desc: 'Tell us the vibe. AI picks the best outfit combos from your closet, matched to your skin tone.',
    cta: 'Generate Fits →',
    href: '/recommend',
    tag: 'AI Stylist',
    tagColor: '#06B6D4',
    tagBg: 'rgba(6,182,212,0.12)',
  },
  {
    id: 'dash-random',
    icon: '🎲',
    emoji_bg: 'linear-gradient(135deg, #F97316, #EC4899)',
    title: 'Random Outfit',
    desc: 'Upload any photo and let our AI surprise you with a completely unique outfit suggestion.',
    cta: 'Surprise Me →',
    href: '/random-outfit',
    tag: 'Gemini Vision',
    tagColor: '#F97316',
    tagBg: 'rgba(249,115,22,0.12)',
    hot: true,
  },
  {
    id: 'dash-profile',
    icon: '👤',
    emoji_bg: 'linear-gradient(135deg, #EC4899, #F97316)',
    title: 'My Profile',
    desc: 'Set up your style profile — skin tone, body type & preferences power all AI recommendations.',
    cta: 'Edit Profile →',
    href: '/onboard',
    tag: 'Style DNA',
    tagColor: '#EC4899',
    tagBg: 'rgba(236,72,153,0.12)',
  },
]

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const wardrobeCount = (() => {
    try {
      const uid = localStorage.getItem('fitcheck_user_id')
      return uid ? (parseInt(localStorage.getItem(`fitcheck_count_${uid}`) || '0')) : 0
    } catch { return 0 }
  })()
  const skinTone = localStorage.getItem('fitcheck_skin_tone') || null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero welcome */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#A855F7' }}>
          {greeting} ✦
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-bright leading-tight">
          Welcome back,{' '}
          <span className="gradient-text">{user?.displayName || user?.username || 'Stylist'}</span>
        </h1>
        <p className="text-muted text-sm mt-3 max-w-lg">
          Your AI-powered style assistant is ready. What are we creating today?
        </p>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-3 gap-3 mb-10"
      >
        {[
          { label: 'Wardrobe Pieces', value: wardrobeCount || '—', icon: '👗' },
          { label: 'Skin Tone', value: skinTone ? '✓ Matched' : 'Not set', icon: '🎨', dot: skinTone },
          { label: 'AI Engine', value: 'Active', icon: '🤖', green: true },
        ].map(stat => (
          <div key={stat.label}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted truncate">{stat.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {stat.dot && (
                  <div className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                    style={{ backgroundColor: stat.dot }} />
                )}
                <p className={`text-sm font-bold truncate ${stat.green ? 'text-emerald-400' : 'text-bright'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xs font-semibold uppercase tracking-widest text-muted mb-5"
      >
        ✦ Features
      </motion.p>

      {/* Feature columns grid */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {FEATURES.map(f => (
          <motion.div
            key={f.id}
            variants={stagger.item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => nav(f.href)}
            className="group glass-card cursor-pointer flex flex-col p-5 hover:border-neon/30 transition-all duration-300 relative overflow-hidden"
            style={{ minHeight: 220 }}
          >
            {/* Hot badge */}
            {f.hot && (
              <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', color: '#fff' }}>
                NEW ✦
              </div>
            )}

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.06), transparent 70%)' }} />

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 flex-shrink-0"
              style={{ background: f.emoji_bg }}>
              {f.icon}
            </div>

            {/* Tag */}
            <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mb-2 w-fit"
              style={{ background: f.tagBg, color: f.tagColor, border: `1px solid ${f.tagColor}30` }}>
              {f.tag}
            </span>

            {/* Content */}
            <h3 className="font-display font-bold text-lg text-bright mb-1.5">{f.title}</h3>
            <p className="text-xs text-muted leading-relaxed flex-1">{f.desc}</p>

            {/* CTA */}
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold transition-all duration-200"
              style={{ color: f.tagColor }}>
              {f.cta}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick tip */}
      {!skinTone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
          onClick={() => nav('/onboard')}
        >
          <div className="text-2xl">💡</div>
          <div>
            <p className="text-sm font-semibold text-bright">Complete your profile</p>
            <p className="text-xs text-muted mt-0.5">Upload a selfie so AI can match outfits to your skin tone</p>
          </div>
          <div className="ml-auto text-sm font-semibold" style={{ color: '#A855F7' }}>Set up →</div>
        </motion.div>
      )}
    </div>
  )
}
