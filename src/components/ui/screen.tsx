import { PropsWithChildren } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Separator } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function Screen({ children, title, subtitle }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="never"
        contentContainerClassName="gap-6 px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 124,
        }}
      >
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[2.5px] text-accent">
              GYOUM
            </Text>
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-base leading-7 text-muted">{subtitle}</Text>
            ) : null}
          </View>
          <Separator className="opacity-60" />
        </View>
        {children}
      </ScrollView>
    </View>
  );
}
