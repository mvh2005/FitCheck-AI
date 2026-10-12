import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius, Shadow } from '../utils/theme'

type Props = {
  value: number
  onChange: (n: number) => void
}

export default function RecommendationCount({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.sectionLabel}>OUTFITS TO GENERATE</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.bubble, value === n && styles.bubbleActive]}
            onPress={() => {
              Haptics.selectionAsync()
              onChange(n)
            }}
          >
            <Text style={[styles.bubbleText, value === n && styles.bubbleTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.mink,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.stone,
    ...Shadow.soft,
  },
  bubbleActive: {
    backgroundColor: Colors.charcoal,
    borderColor: Colors.charcoal,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  bubbleTextActive: {
    color: Colors.white,
  },
})
