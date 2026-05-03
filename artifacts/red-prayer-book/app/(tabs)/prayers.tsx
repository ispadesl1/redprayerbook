import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookView } from '@/components/book/BookView';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function Prayers() {
  const [riffleTarget, setRiffleTarget] = useState<number | null>(null);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.surfaceDeep }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          borderBottomColor: colors.hairline,
          borderBottomWidth: 1,
        }}
      >
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 22,
            color: colors.sacredGold,
            letterSpacing: 1,
          }}
        >
          ✟ Prayer Book ✟
        </Text>
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <BookView
          riffleTarget={riffleTarget}
          onRiffleComplete={() => setRiffleTarget(null)}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
