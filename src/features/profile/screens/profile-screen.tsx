import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

type MenuItem = {
  icon: string;
  title: string;
  desc: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: '⭐',
    title: '즐겨찾기 역',
    desc: '자주 이용하는 역을 관리합니다',
    route: '/(app)/stations/favorites',
  },
  {
    icon: '♿',
    title: '접근성 설정',
    desc: '글씨 크기, 고대비, 테마 변경',
    route: '/(app)/settings/accessibility',
  },
  {
    icon: '🔍',
    title: '역 검색',
    desc: '전체 역 목록에서 검색합니다',
    route: '/(app)/stations/search',
  },
];

const ROLE_LABELS = {
  passenger: '교통약자',
  staff: '역무원',
  driver: '기관사',
  admin: '관리자',
} as const;

export function ProfileScreen() {
  const router = useRouter();
  const { role, signOut, switchRole } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-6 px-5">
          {/* 프로필 헤더 */}
          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="flex-row items-center gap-4 p-5">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-brand dark:bg-brand-dark">
                <Text className="text-2xl font-bold text-white">김</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-xl font-bold text-foreground">김교움</Text>
                <Text className="text-sm text-default-500">
                  {ROLE_LABELS[role]} · demo@gyoum.kr
                </Text>
              </View>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="gap-3 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                데모 역할 전환
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(['passenger', 'staff'] as const).map((item) => {
                  const selected = role === item;
                  return (
                    <Chip
                      key={item}
                      variant={selected ? 'primary' : 'soft'}
                      className={selected ? 'bg-brand dark:bg-brand-dark' : ''}
                      onPress={() => {
                        void switchRole(item);
                      }}
                    >
                      {ROLE_LABELS[item]}
                    </Chip>
                  );
                })}
              </View>
            </Card.Body>
          </Card>

          {/* 메뉴 */}
          <Card className="rounded-2xl">
            <Card.Body className="p-0">
              {MENU_ITEMS.map((item, index) => (
                <View key={item.title}>
                  {index > 0 ? <Separator /> : null}
                  <Pressable
                    className="flex-row items-center gap-4 px-5 py-4"
                    onPress={() => router.push(item.route as never)}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-default-100">
                      <Text className="text-lg">{item.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-default-400">
                        {item.desc}
                      </Text>
                    </View>
                    <Text className="text-default-300">›</Text>
                  </Pressable>
                </View>
              ))}
            </Card.Body>
          </Card>

          {/* 앱 정보 */}
          <Card className="rounded-2xl">
            <Card.Body className="gap-2 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                앱 정보
              </Text>
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-sm text-default-500">버전</Text>
                <Text className="text-sm text-default-400">0.1.0</Text>
              </View>
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-sm text-default-500">환경</Text>
                  <Text className="text-sm text-default-400">
                  데모 (API 연동)
                  </Text>
              </View>
            </Card.Body>
          </Card>

          <Button
            size="lg"
            variant="danger-soft"
            className="rounded-xl"
            onPress={() => {
              void signOut();
            }}
          >
            로그아웃
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
