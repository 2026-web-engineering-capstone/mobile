import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
      <Text className="text-2xl font-semibold text-foreground">
        페이지를 찾을 수 없습니다.
      </Text>
      <Link href="/(app)/(tabs)">
        <Text className="text-base text-accent">홈으로 돌아가기</Text>
      </Link>
    </View>
  );
}
