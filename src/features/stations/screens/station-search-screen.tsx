import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Station = {
  name: string;
  line: string;
  lineColor: string;
};

const ALL_STATIONS: Station[] = [
  { name: '계양역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '귤현역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '박촌역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '임학역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '작전역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '갈산역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '지식정보단지역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '인천대입구역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '센트럴파크역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '국제업무지구역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '송도달빛축제공원역', line: '인천1호선', lineColor: '#3681cb' },
];

const RECENT_STATIONS = ['인천대입구역', '센트럴파크역', '계양역'];

export function StationSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = query
    ? ALL_STATIONS.filter((s) => s.name.includes(query))
    : ALL_STATIONS;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              역 검색
            </Text>
            <Text className="text-sm text-default-400">
              이름으로 역을 찾아보세요
            </Text>
          </View>

          {/* 검색 입력 */}
          <View className="flex-row items-center gap-2 rounded-xl bg-default-100 px-4 py-3">
            <Text className="text-default-400">🔍</Text>
            <TextInput
              className="flex-1 text-sm text-foreground"
              placeholder="역 이름 입력"
              placeholderTextColor={undefined}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')}>
                <Text className="text-xs text-default-400">✕</Text>
              </Pressable>
            ) : null}
          </View>

          {/* 최근 이용 */}
          {!query ? (
            <View className="gap-3">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                최근 이용
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {RECENT_STATIONS.map((name) => (
                  <Chip
                    key={name}
                    variant="soft"
                    onPress={() => router.back()}
                  >
                    {name.replace('역', '')}
                  </Chip>
                ))}
              </View>
            </View>
          ) : null}

          <Separator />

          {/* 역 목록 */}
          <View className="gap-1">
            <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
              {query ? `검색 결과 (${filtered.length})` : '전체 역'}
            </Text>
            {filtered.map((station) => (
              <Pressable
                key={station.name}
                className="flex-row items-center gap-3 rounded-xl px-2 py-3"
                onPress={() => router.back()}
              >
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: station.lineColor }}
                >
                  <Text className="text-[10px] font-bold text-white">인</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {station.name}
                  </Text>
                  <Text className="text-xs text-default-400">
                    {station.line}
                  </Text>
                </View>
              </Pressable>
            ))}
            {filtered.length === 0 ? (
              <Card className="rounded-2xl">
                <Card.Body className="items-center p-6">
                  <Text className="text-sm text-default-400">
                    '{query}'에 해당하는 역이 없습니다
                  </Text>
                </Card.Body>
              </Card>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}