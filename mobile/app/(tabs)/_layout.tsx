import { Tabs } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Radius, Shadow } from '../../utils/theme'

const TABS = [
  { name: 'index',       icon: '✨', label: 'Outfits'  },
  { name: 'collections', icon: '👗', label: 'Closet'   },
  { name: 'profile',     icon: '👤', label: 'Profile'  },
]

function CustomTabBar({ state, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find((t) => t.name === route.name) ?? TABS[0]
        const focused = state.index === index
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              navigation.navigate(route.name)
            }}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"       options={{ title: 'Outfits'  }} />
      <Tabs.Screen name="collections" options={{ title: 'Closet'   }} />
      <Tabs.Screen name="profile"     options={{ title: 'Profile'  }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingBottom: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    ...Shadow.medium,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: {
    width: 44, height: 32, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: Colors.stoneLight },
  icon: { fontSize: 20 },
  label: { fontSize: 11, color: '#bbb', fontWeight: '500' },
  labelActive: { color: Colors.mink, fontWeight: '600' },
})
