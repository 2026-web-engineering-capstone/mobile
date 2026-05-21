import '../global.css';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { AppProvider } from '@/providers/app-provider';
import { BRAND_TOKENS } from '@/lib/design-tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('../../assets/font/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/font/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/font/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/font/Pretendard-Bold.otf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: BRAND_TOKENS.bg }} />;
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AppProvider>
  );
}
