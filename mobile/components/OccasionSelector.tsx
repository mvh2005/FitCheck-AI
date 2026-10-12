import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius, Shadow, OCCASIONS, OccasionId } from '../utils/theme'

const { width } = Dimensions.get('window')

type Props = {
  selected: OccasionId | ''
  onSelect: (id: OccasionId) => void
}

function OccasionTile({
  occasion,
  selected,
  onPress,
}: {
  occasion: (typeof OCCASIONS)[number]
  selected: boolean
  onPress: () => void
}) {
  const scale = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={[
          styles.tile,
          { backgroundColor: selected ? Colors.charcoal : Colors.white },
          selected && styles.tileActive,
        ]}
      >
        <Text style={styles.tileIcon}>{occasion.icon}</Text>
        <Text style={[styles.tileLabel, selected && styles.tileLabelActive]}>
          {occasion.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function OccasionSelector({ selected, onSelect }: Props) {
  return (
    <View>
      <Text style={styles.sectionLabel}>OCCASION</Text>
      <View style={styles.grid}>
        {OCCASIONS.map((o) => (
          <OccasionTile
            key={o.id}
            occasion={o}
            selected={selected === o.id}
            onPress={() => onSelect(o.id)}
          />
        ))}
      </View>
    </View>
  )
}

const TILE_SIZE = (width - Spacing.lg * 2 - 30) / 3

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.mink,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: TILE_SIZE,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.stone,
    ...Shadow.soft,
  },
  tileActive: {
    borderColor: Colors.charcoal,
  },
  tileIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  tileLabelActive: {
    color: Colors.white,
  },
})
