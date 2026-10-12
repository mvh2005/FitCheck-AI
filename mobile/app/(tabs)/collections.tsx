import React, { useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import ClothingGrid from '../../components/ClothingGrid'
import { ClothingItem } from '../../lib/supabase'
import { Colors, Spacing, Radius, Shadow } from '../../utils/theme'

const CATEGORY_TABS = ['all', 'top', 'bottom', 'shoes', 'dress', 'outerwear', 'accessory']

export default function CollectionsScreen() {
  const { user } = useAuthStore()
  const {
    items, loading, refreshing,
    activeCategory, filteredItems,
    fetchWardrobe, refresh,
    removeItem, setCategory,
  } = useWardrobeStore()

  useEffect(() => {
    if (user?.id) fetchWardrobe(user.id)
  }, [user?.id])

  const filtered = filteredItems()
  const categoryTabs = CATEGORY_TABS.filter(
    (c) => c === 'all' || items.some((i) => i.category === c)
  )

  const handleDelete = (item: ClothingItem) => {
    removeItem(item.id)
  }

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.mink} />
        <Text style={styles.loadingText}>Loading your closet…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>MY WARDROBE</Text>
          <Text style={styles.headerTitle}>Digital Closet</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            router.push('/add-item')
          }}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{items.length}</Text>
          <Text style={styles.statLabel}>ITEMS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{new Set(items.map((i) => i.category)).size}</Text>
          <Text style={styles.statLabel}>CATEGORIES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {new Set(items.flatMap((i) => i.season ?? [])).size}
          </Text>
          <Text style={styles.statLabel}>SEASONS</Text>
        </View>
      </View>

      {/* Category filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {categoryTabs.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, activeCategory === c && styles.filterChipActive]}
            onPress={() => { setCategory(c); Haptics.selectionAsync() }}
          >
            <Text style={[styles.filterText, activeCategory === c && styles.filterTextActive]}>
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ClothingGrid
        items={filtered}
        onLongPress={handleDelete}
        refreshing={refreshing}
        onRefresh={() => user?.id && refresh(user.id)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👗</Text>
            <Text style={styles.emptyTitle}>Empty closet</Text>
            <Text style={styles.emptyText}>Tap + to add your first item</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/add-item')}
            >
              <Text style={styles.emptyBtnText}>Add clothes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },
  loadingText: { fontSize: 14, color: Colors.mink, marginTop: Spacing.md },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg, paddingTop: 64, paddingBottom: Spacing.md,
  },
  headerLabel: { fontSize: 11, letterSpacing: 3, color: Colors.mink, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.charcoal },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.charcoal,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.soft,
  },
  addBtnText: { color: Colors.white, fontSize: 24, fontWeight: '300', lineHeight: 28 },

  statsBar: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md,
    ...Shadow.soft,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: Colors.charcoal },
  statLabel: { fontSize: 9, color: '#999', letterSpacing: 1.5, marginTop: 2, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: Colors.stone, marginVertical: 4 },

  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.stone, backgroundColor: Colors.white,
  },
  filterChipActive: { backgroundColor: Colors.charcoal, borderColor: Colors.charcoal },
  filterText: { fontSize: 13, color: '#888', fontWeight: '500' },
  filterTextActive: { color: Colors.white },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.charcoal, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#999', marginBottom: Spacing.xl },
  emptyBtn: {
    backgroundColor: Colors.charcoal, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
  },
  emptyBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
})
