import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#6aafe0' : '#3681cb',
        tabBarInactiveTintColor: isDark ? '#a1a1aa' : '#6b7280',
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 4,
        },
        tabBarStyle: {
          height: insets.bottom + 62,
          paddingTop: 6,
          paddingHorizontal: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: '지원 요청',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'train' : 'train-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '이용 내역',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default TabsLayout;
