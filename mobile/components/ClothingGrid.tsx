import React from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { ClothingItem } from '../lib/supabase'
import { Colors, Spacing, Radius, CATEGORY_COLORS } from '../utils/theme'

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - Spacing.lg * 2 - 12) / 3

type Props = {
  items: ClothingItem[]
  onLongPress?: (item: ClothingItem) => void
  ListEmptyComponent?: React.ReactElement
  ListHeaderComponent?: React.ReactElement
  refreshing?: boolean
  onRefresh?: () => void
}

function GridItem({
  item,
  onLongPress,
}: {
  item: ClothingItem
  onLongPress?: (item: ClothingItem) => void
}) {
  const handleLongPress = () => {
    if (!onLongPress) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    Alert.alert('Remove item?', `Remove "${item.name}" from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onLongPress(item),
      },
    ])
  }

  return (
    <TouchableOpacity
      style={styles.item}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
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
      {item.color && (
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      )}
    </TouchableOpacity>
  )
}

export default function ClothingGrid({
  items,
  onLongPress,
  ListEmptyComponent,
  ListHeaderComponent,
  refreshing,
  onRefresh,
}: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      numColumns={3}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <GridItem item={item} onLongPress={onLongPress} />
      )}
    />
  )
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    gap: 6,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.3,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.stoneLight,
    marginRight: 6,
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
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colorDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
})
