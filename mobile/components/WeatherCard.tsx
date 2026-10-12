import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, Radius, Shadow, WEATHER_OPTIONS, WeatherId } from '../utils/theme'

type Props = {
  selected: WeatherId | ''
  onSelect: (id: WeatherId) => void
  selectedTemp?: number | null
}

export default function WeatherCard({ selected, onSelect, selectedTemp }: Props) {
  const selectedOption = WEATHER_OPTIONS.find((w) => w.id === selected)

  return (
    <View>
      <Text style={styles.sectionLabel}>WEATHER</Text>

      {/* Current selection display */}
      {selectedOption && (
        <View style={styles.activeCard}>
          <Text style={styles.activeIcon}>{selectedOption.icon}</Text>
          <View>
            <Text style={styles.activeLabel}>{selectedOption.label}</Text>
            <Text style={styles.activeTemp}>
              ~{selectedTemp ?? selectedOption.temp}°C
            </Text>
          </View>
        </View>
      )}

      {/* Weather picker chips */}
      <View style={styles.row}>
        {WEATHER_OPTIONS.map((w) => (
          <TouchableOpacity
            key={w.id}
            style={[styles.chip, selected === w.id && styles.chipActive]}
            onPress={() => {
              Haptics.selectionAsync()
              onSelect(w.id)
            }}
          >
            <Text style={styles.chipIcon}>{w.icon}</Text>
            <Text style={[styles.chipLabel, selected === w.id && styles.chipLabelActive]}>
              {w.label}
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
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.soft,
  },
  activeIcon: {
    fontSize: 28,
  },
  activeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  activeTemp: {
    fontSize: 13,
    color: Colors.mink,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.stone,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.charcoal,
    borderColor: Colors.charcoal,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  chipLabelActive: {
    color: Colors.white,
  },
})
