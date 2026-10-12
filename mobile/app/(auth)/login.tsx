import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Animated,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { supabase } from '../../lib/supabase'
import { Colors, Spacing, Radius, Shadow } from '../../utils/theme'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      Alert.alert('Sign in failed', error.message)
      setLoading(false)
    }
    // On success: root layout auth listener navigates to /(tabs)
  }

  return (
    <LinearGradient colors={Colors.gradientWarm} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
            {/* Brand */}
            <View style={styles.brand}>
              <View style={styles.logoRing}>
                <Text style={styles.logoEmoji}>✨</Text>
              </View>
              <Text style={styles.brandName}>FitCheck.ai</Text>
              <Text style={styles.brandTagline}>Your AI wardrobe stylist</Text>
            </View>

            {/* Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome back</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.btnText}>Sign in</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Create one →</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  inner: { alignItems: 'center' },

  brand: { alignItems: 'center', marginBottom: Spacing.xl },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.mink,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.medium,
  },
  logoEmoji: { fontSize: 36 },
  brandName: { fontSize: 32, fontWeight: '700', color: Colors.charcoal, letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: Colors.mink, marginTop: 4 },

  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.medium,
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.charcoal, marginBottom: Spacing.lg },

  field: { marginBottom: Spacing.md },
  fieldLabel: {
    fontSize: 10, letterSpacing: 2, color: Colors.mink,
    fontWeight: '600', marginBottom: 6,
  },
  input: {
    borderWidth: 1.5, borderColor: Colors.stone, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 15,
    color: Colors.charcoal, backgroundColor: Colors.stoneLight,
  },

  btn: {
    backgroundColor: Colors.charcoal, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm,
    ...Shadow.soft,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#888' },
  footerLink: { fontSize: 14, color: Colors.mink, fontWeight: '600' },
})
