/**
 * api.js — FitCheck.ai API client
 * All calls use relative URLs — works on any host/port.
 * In Vite dev mode: Vite proxy forwards /api/* to http://localhost:8000
 */

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s for AI endpoints
})

// ── User ──────────────────────────────────────────────────────────────────────
export const onboardUser        = (fd)       => api.post('/onboard', fd)
export const getProfile         = (uid)      => api.get(`/profile/${uid}`)

// ── Wardrobe ──────────────────────────────────────────────────────────────────
export const addWardrobeItem    = (fd)       => api.post('/wardrobe/add', fd)
export const getWardrobe        = (uid)      => api.get(`/wardrobe/${uid}`)
export const deleteWardrobeItem = (uid, id)  => api.delete(`/wardrobe/${uid}/${id}`)

// ── Recommendations ───────────────────────────────────────────────────────────
export const getRecommendations = (fd)       => api.post('/recommend', fd)

// ── AI: Random Outfit ─────────────────────────────────────────────────────────
export const generateRandomOutfit = (fd)     => api.post('/ai/random-outfit', fd)

// ── Helpers ───────────────────────────────────────────────────────────────────
export const imageUrl = (filename) => filename ? `/uploads/${filename}` : null
