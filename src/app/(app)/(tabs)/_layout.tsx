import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { BRAND_TOKENS, pretendard } from '@/lib/design-tokens';

function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const isPassenger = role === 'passenger';
  const isStaff = role === 'staff';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_TOKENS.brand,
        tabBarInactiveTintColor: BRAND_TOKENS.textMuted,
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: pretendard('600'),
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
          backgroundColor: BRAND_TOKENS.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: BRAND_TOKENS.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isStaff ? '요청 큐' : '홈',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={
                isStaff
                  ? focused
                    ? 'list'
                    : 'list-outline'
                  : focused
                    ? 'home'
                    : 'home-outline'
              }
              size={focused ? size + 1 : size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          href: isPassenger ? undefined : null,
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
          href: isPassenger ? undefined : null,
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
