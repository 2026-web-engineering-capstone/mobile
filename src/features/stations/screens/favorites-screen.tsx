import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FavoriteStation = {
  name: string;
  line: string;
  lineColor: string;
};

const INITIAL_FAVORITES: FavoriteStation[] = [
  { name: '인천대입구역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '센트럴파크역', line: '인천1호선', lineColor: '#3681cb' },
  { name: '계양역', line: '인천1호선', lineColor: '#3681cb' },
];

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const removeFavorite = (name: string) => {
    setFavorites((prev) => prev.filter((f) => f.name !== name));
  };

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
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              즐겨찾기 역
            </Text>
            <Text className="text-sm text-default-400">
              자주 이용하는 역을 빠르게 선택하세요
            </Text>
          </View>

          {favorites.length > 0 ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-0">
                {favorites.map((station, index) => (
                  <View key={station.name}>
                    {index > 0 ? <Separator /> : null}
                    <View className="flex-row items-center gap-4 px-5 py-4">
                      <View
                        className="h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: station.lineColor }}
                      >
                        <Text className="text-xs font-bold text-white">인</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {station.name}
                        </Text>
                        <Text className="text-xs text-default-400">
                          {station.line}
                        </Text>
                      </View>
                      <Pressable
                        className="rounded-lg bg-danger-50 px-3 py-1.5"
                        onPress={() => removeFavorite(station.name)}
                      >
                        <Text className="text-xs font-medium text-danger">
                          삭제
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </Card.Body>
            </Card>
          ) : (
            <Card className="rounded-2xl">
              <Card.Body className="items-center gap-3 p-8">
                <Text className="text-3xl">⭐</Text>
                <Text className="text-sm text-default-400">
                  즐겨찾기한 역이 없습니다
                </Text>
                <Text className="text-center text-xs leading-5 text-default-300">
                  역 검색에서 자주 이용하는 역을 추가해보세요
                </Text>
              </Card.Body>
            </Card>
          )}

          <Button variant="secondary" className="rounded-xl" onPress={() => {}}>
            역 추가하기
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}