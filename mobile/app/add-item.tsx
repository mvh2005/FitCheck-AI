import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '../store/authStore'
import { useWardrobeStore } from '../store/wardrobeStore'
import { uploadClothingImage, analyzeClothing, ClothingAnalysis } from '../lib/api'
import { Colors, Spacing, Radius, Shadow, OCCASIONS } from '../utils/theme'

type Mode = 'photo' | 'url'

export default function AddItemScreen() {
  const { user } = useAuthStore()
  const { addItem } = useWardrobeStore()

  const [mode, setMode]       = useState<Mode>('photo')
  const [image, setImage]     = useState<string | null>(null)
  const [urlInput, setUrl]    = useState('')
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null)
  const [editedName, setEditedName] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [analyzing, setAnalyzing]   = useState(false)

  const pickImage = async (fromCamera = false) => {
    const fn = fromCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync
    const result = await fn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [3, 4], quality: 0.85,
    })
    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setAnalysis(null)
    }
  }

  const handleAnalyze = async () => {
    if (!user) return
    const source = mode === 'photo' ? image : urlInput.trim()
    if (!source) return

    setAnalyzing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      let publicUrl = source

      if (mode === 'photo' && image) {
        // Upload to Supabase Storage first, then analyze
        publicUrl = await uploadClothingImage(user.id, image)
        setImage(publicUrl) // Show the stored URL
      }

      const result = await analyzeClothing(publicUrl)
      setAnalysis(result)
      setEditedName(result.name)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e: any) {
      Alert.alert('Analysis failed', e?.message ?? 'Could not analyze the image.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!user || !analysis || !image) return
    setUploading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      await addItem({
        user_id: user.id,
        name: editedName || analysis.name,
        category: analysis.category,
        subcategory: analysis.subcategory || null,
        color: analysis.color || null,
        secondary_colors: analysis.secondary_colors || null,
        pattern: analysis.pattern || null,
        style: analysis.style || null,
        formality: analysis.formality ?? 3,
        season: analysis.season || null,
        image_url: image,
        source_url: mode === 'url' ? urlInput.trim() : null,
        source_type: mode,
      })

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.back()
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Could not save to your wardrobe.')
    } finally {
      setUploading(false)
    }
  }

  const canAnalyze = mode === 'photo' ? !!image : !!urlInput.trim()

  return (
    <View style={styles.container}>
      {/* Handle + title */}
      <View style={styles.handle} />
      <View style={styles.titleRow}>
        <Text style={styles.title}>Add to wardrobe</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'photo' && styles.modeTabActive]}
            onPress={() => { setMode('photo'); setAnalysis(null) }}
          >
            <Text style={[styles.modeTabText, mode === 'photo' && styles.modeTabTextActive]}>
              📷  Upload Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'url' && styles.modeTabActive]}
            onPress={() => { setMode('url'); setAnalysis(null) }}
          >
            <Text style={[styles.modeTabText, mode === 'url' && styles.modeTabTextActive]}>
              🔗  Add URL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo mode */}
        {mode === 'photo' && (
          <>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(false)}>
              {image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>📸</Text>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(true)}>
                <Text style={styles.imageActionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(false)}>
                <Text style={styles.imageActionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* URL mode */}
        {mode === 'url' && (
          <View style={styles.urlSection}>
            <Text style={styles.fieldLabel}>PRODUCT / IMAGE URL</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://..."
              placeholderTextColor="#aaa"
              value={urlInput}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
            />
            <Text style={styles.urlHint}>
              Paste a direct image URL or a product page link. AI will identify the clothing item.
            </Text>
          </View>
        )}

        {/* Analyze button */}
        {!analysis && (
          <TouchableOpacity
            style={[styles.analyzeBtn, (!canAnalyze || analyzing) && styles.btnDisabled]}
            onPress={handleAnalyze}
            disabled={!canAnalyze || analyzing}
          >
            {analyzing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={[styles.analyzeBtnText, { marginLeft: 8 }]}>
                  Analyzing with AI…
                </Text>
              </View>
            ) : (
              <Text style={styles.analyzeBtnText}>✨ Analyze with AI</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Analysis result */}
        {analysis && (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>AI identified this as:</Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>NAME (editable)</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Item name"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.metaGrid}>
              {[
                ['Category',  analysis.category],
                ['Color',     analysis.color],
                ['Pattern',   analysis.pattern],
                ['Style',     analysis.style],
                ['Formality', `${analysis.formality}/5`],
                ['Season',    (analysis.season ?? []).join(', ')],
              ].map(([k, v]) => (
                <View key={k} style={styles.metaItem}>
                  <Text style={styles.metaKey}>{k}</Text>
                  <Text style={styles.metaVal}>{v || '—'}</Text>
                </View>
              ))}
            </View>

            <View style={styles.analysisActions}>
              <TouchableOpacity
                style={styles.reanalyzeBtn}
                onPress={() => setAnalysis(null)}
              >
                <Text style={styles.reanalyzeBtnText}>Re-analyze</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, uploading && styles.btnDisabled]}
                onPress={handleSave}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save to wardrobe →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.stone, alignSelf: 'center', marginTop: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.charcoal },
  closeBtn: { fontSize: 18, color: '#999', padding: 4 },

  content: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },

  modeTabs: {
    flexDirection: 'row', gap: 10, marginBottom: Spacing.lg,
    backgroundColor: Colors.stoneLight, borderRadius: Radius.lg, padding: 4,
  },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  modeTabActive: { backgroundColor: Colors.white, ...Shadow.soft },
  modeTabText: { fontSize: 13, fontWeight: '500', color: '#888' },
  modeTabTextActive: { color: Colors.charcoal, fontWeight: '600' },

  imagePicker: {
    width: '100%', height: 220, borderRadius: Radius.lg,
    overflow: 'hidden', marginBottom: Spacing.sm,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, backgroundColor: Colors.stoneLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.stone, borderStyle: 'dashed', borderRadius: Radius.lg,
  },
  imagePlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { fontSize: 14, color: '#999' },

  imageActions: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  imageActionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.stoneLight, alignItems: 'center',
  },
  imageActionText: { fontSize: 14, fontWeight: '500', color: Colors.charcoal },

  urlSection: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: 10, letterSpacing: 2, color: Colors.mink,
    fontWeight: '600', marginBottom: 6,
  },
  urlInput: {
    borderWidth: 1.5, borderColor: Colors.stone, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: 14,
    color: Colors.charcoal, backgroundColor: Colors.white, marginBottom: 6,
  },
  urlHint: { fontSize: 12, color: '#aaa', lineHeight: 17 },

  analyzeBtn: {
    backgroundColor: Colors.mink, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.lg,
    ...Shadow.soft,
  },
  analyzeBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  btnDisabled: { opacity: 0.45 },

  analysisCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.lg, ...Shadow.medium,
  },
  analysisTitle: { fontSize: 14, color: Colors.mink, fontWeight: '600', marginBottom: Spacing.md },
  fieldBlock: { marginBottom: Spacing.md },
  input: {
    borderWidth: 1.5, borderColor: Colors.stone, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15,
    color: Colors.charcoal, backgroundColor: Colors.stoneLight,
  },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  metaItem: {
    backgroundColor: Colors.stoneLight, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8, minWidth: '45%',
  },
  metaKey: { fontSize: 10, letterSpacing: 1.5, color: Colors.mink, fontWeight: '600', marginBottom: 2 },
  metaVal: { fontSize: 13, color: Colors.charcoal, fontWeight: '500', textTransform: 'capitalize' },

  analysisActions: { flexDirection: 'row', gap: 10 },
  reanalyzeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.stone, alignItems: 'center',
  },
  reanalyzeBtnText: { fontSize: 14, fontWeight: '500', color: Colors.charcoal },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: Radius.md,
    backgroundColor: Colors.charcoal, alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
})
