import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { addWardrobeItem, getWardrobe, deleteWardrobeItem, imageUrl } from '../utils/api'

const OCCASIONS = ['casual', 'office', 'wedding', 'party', 'gym', 'beach', 'date', 'festival', 'formal']

const CATEGORY_META = {
  top: { emoji: '👕', color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
  bottom: { emoji: '👖', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
  shoes: { emoji: '👟', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
  dress: { emoji: '👗', color: '#F472B6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
  outerwear: { emoji: '🧥', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  accessory: { emoji: '💍', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
  unknown: { emoji: '✦', color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: {
    hidden: { opacity: 0, scale: 0.94, y: 12 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  },
}

export default function Wardrobe() {
  const userId = localStorage.getItem('fitcheck_user_id') || 'guest'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [label, setLabel] = useState('')
  const [pattern, setPattern] = useState('solid')
  const [selectedOccasions, setSelectedOccasions] = useState([])
  const [filterCat, setFilterCat] = useState('all')
  const [panelOpen, setPanelOpen] = useState(false)

  const loadWardrobe = useCallback(async () => {
    try {
      const { data } = await getWardrobe(userId)
      setItems(data.items || [])
    } catch {
      toast.error('Could not load wardrobe 😕')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { loadWardrobe() }, [loadWardrobe])

  useEffect(() => {
    if (userId && !loading) {
      localStorage.setItem(`fitcheck_count_${userId}`, items.length)
    }
  }, [items.length, userId, loading])


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 1,
    onDrop: ([file]) => { setImage(file); setPreview(URL.createObjectURL(file)) },
  })

  const toggleOccasion = (o) =>
    setSelectedOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])

  const handleUpload = async () => {
    if (!image) return toast.error('Drop a clothing photo first 📸')
    if (selectedOccasions.length === 0) return toast.error('Pick at least one occasion ✨')
    const fd = new FormData()
    fd.append('user_id', userId)
    fd.append('label', label)
    fd.append('occasion_tags', selectedOccasions.join(','))
    fd.append('pattern', pattern)
    fd.append('image', image)
    setUploading(true)
    try {
      await addWardrobeItem(fd)
      toast.success('Added to your closet! 🔥')
      setImage(null); setPreview(null); setLabel(''); setSelectedOccasions([])
      setPanelOpen(false)
      loadWardrobe()
    } catch {
      toast.error('Upload failed 😬')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (itemId) => {
    try {
      await deleteWardrobeItem(userId, itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      toast.success('Removed 🗑️')
    } catch {
      toast.error('Could not remove item')
    }
  }

  const categories = ['all', ...new Set(items.map(i => i.category).filter(Boolean))]
  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: '#A855F7' }}>Digital closet</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-bright">
            My <span className="gradient-text">Wardrobe</span>
          </h1>
          <p className="text-muted text-sm mt-2">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'} in your collection
          </p>
        </div>

        {/* Add button */}
        <button
          onClick={() => setPanelOpen(true)}
          className="btn-primary hidden sm:flex"
        >
          + Add piece
        </button>
      </div>

      {/* Mobile add button */}
      <button
        onClick={() => setPanelOpen(true)}
        className="btn-primary w-full mb-6 sm:hidden"
      >
        + Add new piece
      </button>

      {/* Category filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`chip ${filterCat === c ? 'chip-active' : ''}`}>
            {c === 'all' ? '✦ All' : `${CATEGORY_META[c]?.emoji || '•'} ${c}`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] shimmer-loading rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="text-6xl mb-4 animate-float">👗</div>
          <p className="font-display font-bold text-2xl text-soft mb-2">
            {filterCat === 'all' ? 'Empty closet' : `No ${filterCat} yet`}
          </p>
          <p className="text-muted text-sm mb-6">
            {filterCat === 'all' ? 'Add your first piece and build your digital wardrobe' : `Try adding some ${filterCat} items`}
          </p>
          <button onClick={() => setPanelOpen(true)} className="btn-secondary">
            + Add your first piece
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map(item => (
              <WardrobeCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Item Slide-Over Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 overflow-y-auto"
              style={{ background: '#111118', borderLeft: '1px solid #2A2A3A' }}
            >
              <div className="p-6 space-y-6">
                {/* Panel header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-xl text-bright">Add New Piece</h2>
                    <p className="text-xs text-muted mt-0.5">AI will auto-detect category & color</p>
                  </div>
                  <button onClick={() => setPanelOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-bright hover:bg-white/5 transition-all">
                    ✕
                  </button>
                </div>

                {/* Dropzone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
                    Photo
                  </label>
                  <div {...getRootProps()}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300
                      ${isDragActive ? 'dropzone-genz' : 'border-border hover:border-neon/40 hover:bg-neon/5'}`}>
                    <input {...getInputProps()} />
                    {preview ? (
                      <div className="relative">
                        <img src={preview} className="w-full h-48 object-contain rounded-xl" alt="preview" />
                        <p className="text-xs text-muted mt-2">Tap to change</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-sm font-medium text-soft">
                          {isDragActive ? 'Drop it!' : 'Drop photo or tap to browse'}
                        </p>
                        <p className="text-xs text-muted mt-1">PNG, JPG, WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
                    Label <span className="text-muted normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <input value={label} onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. white oversized tee"
                    className="genz-input" />
                </div>

                {/* Occasions */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
                    Occasions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map(o => (
                      <button key={o} onClick={() => toggleOccasion(o)}
                        className={`occ-chip ${selectedOccasions.includes(o) ? 'occ-chip-active' : ''}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
                    Pattern
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['solid', 'striped', 'checked', 'floral', 'geometric', 'printed'].map(p => (
                      <button key={p} onClick={() => setPattern(p)}
                        className={`chip ${pattern === p ? 'chip-active' : ''}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button onClick={handleUpload} disabled={uploading}
                  className="btn-primary w-full py-4">
                  {uploading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding to closet…
                    </span>
                  ) : '🔥 Add to my closet'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function WardrobeCard({ item, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const meta = CATEGORY_META[item.category] || CATEGORY_META.unknown

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(item.id)
    setDeleting(false)
  }

  return (
    <motion.div
      variants={stagger.item}
      layout
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-2xl overflow-hidden"
      style={{ background: '#1A1A25', border: '1px solid #2A2A3A' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden relative"
        style={{ background: '#111118' }}>
        {item.image_filename && !imgError ? (
          <img
            src={imageUrl(item.image_filename)}
            alt={item.description}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full opacity-60" style={{ backgroundColor: item.color_hex || '#2A2A3A' }} />
            <p className="font-mono text-xs text-muted">{item.color_hex}</p>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(17,17,24,0.8), transparent)' }} />

        {/* Delete btn */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     hover:scale-110 active:scale-95"
          style={{ background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(4px)' }}
        >
          {deleting
            ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            : <span className="text-white text-xs font-bold">✕</span>
          }
        </button>
      </div>

      {/* Info strip */}
      <div className="p-3 flex items-center justify-between gap-2">
        {/* Category badge */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
          {meta.emoji} {item.category}
        </span>

        {/* Color dot */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0"
            style={{ backgroundColor: item.color_hex }} />
        </div>
      </div>

      {/* Occasion tags */}
      {item.occasion_tags?.filter(Boolean).length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {item.occasion_tags.filter(Boolean).slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-muted"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {tag}
            </span>
          ))}
          {item.occasion_tags.filter(Boolean).length > 2 && (
            <span className="text-xs text-muted">+{item.occasion_tags.filter(Boolean).length - 2}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
