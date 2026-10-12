import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Share,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Outfit } from '../../lib/supabase'
import { getOutfitById, isFavorited, toggleFavorite } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { Colors, Spacing, Radius, Shadow, CATEGORY_COLORS } from '../../utils/theme'

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()

  const [outfit, setOutfit]   = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getOutfitById(id),
      user ? isFavorited(user.id, id) : Promise.resolve(false),
    ]).then(([outfitData, fav]) => {
      setOutfit(outfitData)
      setFavorited(fav)
      setLoading(false)
    })
  }, [id])

  const handleToggleFavorite = async () => {
    if (!user || !id) return
    const next = !favorited
    setFavorited(next)
    Haptics.notificationAsync(
      next
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    )
    await toggleFavorite(user.id, id, favorited)
  }

  const handleShare = async () => {
    if (!outfit) return
    await Share.share({
      message: `Check out this outfit: "${outfit.title ?? 'My FitCheck Outfit'}"\n\n${outfit.explanation ?? ''}`,
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.mink} />
        <Text style={styles.loadingText}>Loading outfit…</Text>
      </View>
    )
  }

  if (!outfit) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>Outfit not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const outfitItems = outfit.outfit_items ?? []

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{outfit.title ?? 'Outfit'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.headerAction}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Text style={styles.headerAction}>{favorited ? '❤️' : '♡'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Item images grid */}
        <View style={styles.imagesGrid}>
          {outfitItems.map(({ role, clothing_items: item }) => {
            if (!item) return null
            return (
              <View key={role} style={styles.itemCard}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.unknown },
                  ]}
                >
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemRole}>{role.toUpperCase()}</Text>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  {item.color && (
                    <View style={styles.colorRow}>
                      <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
                      <Text style={styles.colorText}>{item.color}</Text>
                    </View>
                  )}
                  {item.style && (
                    <Text style={styles.itemMeta}>Style: {item.style}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {/* AI Explanation */}
        {outfit.explanation && (
          <View style={styles.reasonCard}>
            <Text style={styles.reasonLabel}>WHY THIS WORKS</Text>
            <Text style={styles.reasonText}>{outfit.explanation}</Text>
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, favorited && styles.saveBtnSaved]}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.saveBtnText}>
            {favorited ? '❤️ Saved to favorites' : '♡ Save this outfit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },
  loadingText: { fontSize: 14, color: Colors.mink, marginTop: Spacing.md },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  errorText: { fontSize: 16, color: Colors.charcoal, marginBottom: Spacing.md },
  backLink: { fontSize: 14, color: Colors.mink, fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.cream,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm, ...Shadow.soft,
  },
  backBtnText: { fontSize: 18, color: Colors.charcoal },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  headerActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  headerAction: { fontSize: 16, color: Colors.mink, fontWeight: '600' },

  content: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },

  imagesGrid: { gap: Spacing.md, marginBottom: Spacing.lg },
  itemCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    overflow: 'hidden', ...Shadow.soft,
  },
  itemImage: { width: '100%', height: 260 },
  categoryBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: Colors.charcoal, textTransform: 'uppercase' },
  itemInfo: { padding: Spacing.md },
  itemRole: { fontSize: 10, letterSpacing: 2, color: Colors.mink, fontWeight: '600', marginBottom: 4 },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.charcoal, marginBottom: Spacing.sm },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  colorSwatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: Colors.stone },
  colorText: { fontSize: 13, color: '#888' },
  itemMeta: { fontSize: 12, color: '#aaa', textTransform: 'capitalize' },

  reasonCard: {
    backgroundColor: Colors.stoneLight, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  reasonLabel: {
    fontSize: 10, letterSpacing: 2, color: Colors.mink,
    fontWeight: '600', marginBottom: Spacing.sm,
  },
  reasonText: { fontSize: 15, color: Colors.charcoal, lineHeight: 23 },

  saveBtn: {
    backgroundColor: Colors.charcoal, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', ...Shadow.soft,
  },
  saveBtnSaved: { backgroundColor: '#D94F5A' },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
})
