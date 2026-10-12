import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import OccasionSelector from '../../components/OccasionSelector'
import WeatherCard from '../../components/WeatherCard'
import RecommendationCount from '../../components/RecommendationCount'
import OutfitCard from '../../components/OutfitCard'
import { generateOutfits } from '../../lib/api'
import { Outfit } from '../../lib/supabase'
import { toggleFavorite } from '../../lib/api'
import {
  Colors, Spacing, Radius, Shadow,
  STYLE_OPTIONS, OccasionId, WeatherId, StyleId, WEATHER_OPTIONS,
} from '../../utils/theme'

export default function HomeScreen() {
  const { user, profile } = useAuthStore()

  const [occasion, setOccasion]   = useState<OccasionId | ''>('')
  const [weather, setWeather]     = useState<WeatherId | ''>('')
  const [style, setStyle]         = useState<StyleId | ''>('')
  const [count, setCount]         = useState(3)
  const [outfits, setOutfits]     = useState<Outfit[] | null>(null)
  const [loading, setLoading]     = useState(false)
  // Track which outfits are favorited within this session
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const weatherTemp = weather
    ? WEATHER_OPTIONS.find((w) => w.id === weather)?.temp ?? null
    : null

  const canGenerate = !!occasion && !!weather

  const handleGenerate = async () => {
    if (!canGenerate) return
    setLoading(true)
    setOutfits(null)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const results = await generateOutfits({
        occasion,
        weather,
        weatherTemp,
        style: style || 'casual',
        count,
      })
      setOutfits(results)
      setFavoritedIds(new Set())
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e: any) {
      Alert.alert(
        'Could not generate outfits',
        e?.message ?? 'Make sure your wardrobe has items added.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (outfitId: string) => {
    if (!user) return
    const currentlyFavorited = favoritedIds.has(outfitId)
    // Optimistic update
    setFavoritedIds((prev) => {
      const next = new Set(prev)
      if (currentlyFavorited) next.delete(outfitId)
      else next.add(outfitId)
      return next
    })
    await toggleFavorite(user.id, outfitId, currentlyFavorited).catch(() => {
      // Revert on failure
      setFavoritedIds((prev) => {
        const next = new Set(prev)
        if (currentlyFavorited) next.add(outfitId)
        else next.delete(outfitId)
        return next
      })
    })
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>AI STYLIST</Text>
        <Text style={styles.headerTitle}>
          {greeting},{'\n'}
          <Text style={styles.headerName}>{displayName} 👋</Text>
        </Text>
        <Text style={styles.headerSub}>What are we wearing today?</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Occasion */}
        <View style={styles.section}>
          <OccasionSelector
            selected={occasion}
            onSelect={(id) => setOccasion(id)}
          />
        </View>

        {/* Weather */}
        <View style={styles.section}>
          <WeatherCard
            selected={weather}
            onSelect={(id) => setWeather(id)}
            selectedTemp={weatherTemp}
          />
        </View>

        {/* Style */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STYLE PREFERENCE</Text>
          <View style={styles.styleRow}>
            {STYLE_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.styleChip, style === s.id && styles.styleChipActive]}
                onPress={() => {
                  Haptics.selectionAsync()
                  setStyle(style === s.id ? '' : s.id)
                }}
              >
                <Text style={[styles.styleChipText, style === s.id && styles.styleChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Count */}
        <View style={styles.section}>
          <RecommendationCount value={count} onChange={setCount} />
        </View>

        {/* Generate CTA */}
        <TouchableOpacity
          style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate || loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={styles.generateBtnText}>  Styling your outfits…</Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>
              {canGenerate ? `Generate ${count} outfit${count > 1 ? 's' : ''} →` : 'Pick occasion & weather first'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {outfits !== null && (
        <View style={styles.results}>
          {outfits.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👗</Text>
              <Text style={styles.emptyTitle}>No outfits found</Text>
              <Text style={styles.emptyText}>
                Add tops, bottoms, and shoes to your closet first.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {outfits.length} outfits for{' '}
                  <Text style={{ color: Colors.mink }}>{occasion}</Text>
                </Text>
                <Text style={styles.resultsHint}>Swipe right to save</Text>
              </View>
              {outfits.map((outfit, i) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  index={i}
                  onSave={handleSave}
                />
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 120 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 64,
    paddingBottom: Spacing.lg,
  },
  headerLabel: {
    fontSize: 11, letterSpacing: 3, color: Colors.mink,
    fontWeight: '600', marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30, fontWeight: '700', color: Colors.charcoal, lineHeight: 38,
  },
  headerName: { color: Colors.mink },
  headerSub: { fontSize: 15, color: '#888', marginTop: 4 },

  controls: { paddingHorizontal: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: 11, letterSpacing: 3, color: Colors.mink,
    fontWeight: '600', marginBottom: Spacing.sm,
  },

  styleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.stone, backgroundColor: Colors.white,
  },
  styleChipActive: { backgroundColor: Colors.mink, borderColor: Colors.mink },
  styleChipText: { fontSize: 13, fontWeight: '500', color: Colors.charcoal },
  styleChipTextActive: { color: Colors.white },

  generateBtn: {
    backgroundColor: Colors.charcoal, borderRadius: Radius.md,
    paddingVertical: 18, alignItems: 'center',
    marginBottom: Spacing.xl, ...Shadow.medium,
  },
  generateBtnDisabled: { opacity: 0.45 },
  generateBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },

  results: { paddingHorizontal: Spacing.lg },
  resultsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  resultsTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  resultsHint: { fontSize: 12, color: '#aaa' },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.charcoal, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: Spacing.xl },
})
