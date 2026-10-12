import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../../store/authStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { Colors, Spacing, Radius, Shadow } from '../../utils/theme'

const GENDER_OPTIONS = [
  { id: 'female', label: 'Female', icon: '👩' },
  { id: 'male',   label: 'Male',   icon: '👨' },
  { id: 'other',  label: 'Other',  icon: '🧑' },
]

const BODY_TYPES = [
  { id: 'slim',     label: 'Slim',     desc: 'Lean frame' },
  { id: 'athletic', label: 'Athletic', desc: 'Toned build' },
  { id: 'average',  label: 'Average',  desc: 'Balanced' },
  { id: 'plus',     label: 'Plus',     desc: 'Fuller figure' },
]

export default function ProfileScreen() {
  const { user, profile, signOut, fetchProfile } = useAuthStore()
  const { items } = useWardrobeStore()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          await signOut()
        },
      },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>ACCOUNT</Text>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.display_name ?? user?.email ?? '?')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.avatarInfo}>
          <Text style={styles.displayName}>
            {profile?.display_name ?? 'Your Name'}
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </View>

      {/* Wardrobe stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Wardrobe stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{items.length}</Text>
            <Text style={styles.statLabel}>Total items</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{new Set(items.map((i) => i.category)).size}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{items.filter((i) => i.category === 'top').length}</Text>
            <Text style={styles.statLabel}>Tops</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{items.filter((i) => i.category === 'bottom').length}</Text>
            <Text style={styles.statLabel}>Bottoms</Text>
          </View>
        </View>
      </View>

      {/* Profile details */}
      {(profile?.gender || profile?.body_type) && (
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Style profile</Text>
          {profile.gender && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>
                {GENDER_OPTIONS.find((g) => g.id === profile.gender)?.label ?? profile.gender}
              </Text>
            </View>
          )}
          {profile.body_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Body type</Text>
              <Text style={styles.detailValue}>
                {BODY_TYPES.find((b) => b.id === profile.body_type)?.label ?? profile.body_type}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Architecture note */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔒 Data security</Text>
        <Text style={styles.infoText}>
          Your wardrobe photos are stored in Supabase Storage with Row Level Security — only
          you can access your data. AI analysis is performed server-side via Edge Functions;
          your OpenAI API key never touches the app.
        </Text>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color={Colors.error} />
        ) : (
          <Text style={styles.signOutText}>Sign out</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 120 },

  header: { paddingHorizontal: Spacing.lg, paddingTop: 64, paddingBottom: Spacing.md },
  headerLabel: { fontSize: 11, letterSpacing: 3, color: Colors.mink, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.charcoal },

  avatarCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, ...Shadow.soft,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.mink,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.white },
  avatarInfo: { flex: 1 },
  displayName: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  emailText: { fontSize: 13, color: '#888', marginTop: 2 },

  statsCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, ...Shadow.soft,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.charcoal, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: Colors.mink },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2, textAlign: 'center' },

  detailCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, ...Shadow.soft,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.stoneLight,
  },
  detailLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  detailValue: { fontSize: 14, color: Colors.charcoal, fontWeight: '600' },

  infoCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.stoneLight, borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.charcoal, marginBottom: Spacing.sm },
  infoText: { fontSize: 13, color: '#666', lineHeight: 20 },

  signOutBtn: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.error,
    borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
})
