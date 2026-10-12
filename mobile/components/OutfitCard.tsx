import React, { useState, useRef } from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, PanResponder, Dimensions,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { Outfit } from '../lib/supabase'
import { Colors, Spacing, Radius, Shadow, CATEGORY_COLORS } from '../utils/theme'

const { width } = Dimensions.get('window')

type Props = {
  outfit: Outfit
  index: number
  onSave?: (outfitId: string) => void
}

export default function OutfitCard({ outfit, index, onSave }: Props) {
  const [saved, setSaved] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current
  const rotate = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-6deg', '0deg', '6deg'],
  })

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => translateX.setValue(g.dx),
    onPanResponderRelease: (_, g) => {
      if (g.dx > 100) {
        setSaved(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onSave?.(outfit.id)
      }
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start()
    },
  })

  const outfitItems = outfit.outfit_items ?? []

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.card, { transform: [{ translateX }, { rotate }] }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>Outfit {index + 1}</Text>
        </View>
        {saved && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>❤️ Saved</Text>
          </View>
        )}
      </View>

      {/* Outfit title */}
      {outfit.title && (
        <Text style={styles.title}>{outfit.title}</Text>
      )}

      {/* Clothing items */}
      <View style={styles.itemsRow}>
        {outfitItems.map(({ role, clothing_items: item }) => {
          if (!item) return null
          return (
            <View key={role} style={styles.itemCol}>
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
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
              </View>
              <Text style={styles.roleLabel}>{role}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            </View>
          )
        })}
      </View>

      {/* AI Explanation */}
      {outfit.explanation && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>WHY IT WORKS</Text>
          <Text style={styles.reasonText}>{outfit.explanation}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => router.push(`/outfit/${outfit.id}` as any)}
        >
          <Text style={styles.detailBtnText}>View detail →</Text>
        </TouchableOpacity>
        {!saved && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              setSaved(true)
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              onSave?.(outfit.id)
            }}
          >
            <Text style={styles.saveBtnText}>♡ Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.swipeHint}>← Swipe right to save</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  indexBadge: {
    backgroundColor: Colors.stoneLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mink,
    letterSpacing: 0.5,
  },
  savedBadge: {
    backgroundColor: '#FFE4E8',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  savedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D85A30',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  itemsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  itemCol: {
    flex: 1,
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.stoneLight,
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.charcoal,
    textTransform: 'uppercase',
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.charcoal,
    textAlign: 'center',
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: Colors.stoneLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reasonLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.mink,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.charcoal,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.stone,
    alignItems: 'center',
  },
  detailBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  swipeHint: {
    fontSize: 11,
    color: '#ccc',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
})
