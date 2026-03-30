import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { Card, Separator } from 'heroui-native';

type SectionCardProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
}>;

export function SectionCard({
  children,
  description,
  eyebrow,
  title,
}: SectionCardProps) {
  return (
    <Card variant="default" className="rounded-3xl px-5 py-5">
      <Card.Body className="gap-4">
        <View className="gap-1">
          {eyebrow ? (
            <Text className="text-xs font-semibold uppercase tracking-widest text-accent">
              {eyebrow}
            </Text>
          ) : null}
          <Card.Title className="text-3xl leading-9 text-surface-foreground">
            {title}
          </Card.Title>
          {description ? (
            <Card.Description className="text-sm leading-6 text-muted">
              {description}
            </Card.Description>
          ) : null}
        </View>
        <Separator className="opacity-50" />
        {children}
      </Card.Body>
    </Card>
  );
}
