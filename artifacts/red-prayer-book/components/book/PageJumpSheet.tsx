import { forwardRef, useState, useImperativeHandle, useRef } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

type Props = {
  totalPages: number;
  currentIndex: number;
  onJump: (index: number) => void;
  visible: boolean;
  onClose: () => void;
};

export function PageJumpSheet({
  totalPages,
  currentIndex,
  onJump,
  visible,
  onClose,
}: Props) {
  const [value, setValue] = useState(String(currentIndex + 1));

  const submit = () => {
    const n = Math.max(1, Math.min(totalPages, Number(value) || 1));
    onJump(n - 1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderTopWidth: 1,
            borderColor: colors.hairline,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.l,
            paddingBottom: spacing.xxl,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.sacredGold,
              alignSelf: 'center',
              marginBottom: spacing.m,
            }}
          />

          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.sacredGold,
              textAlign: 'center',
              fontFamily: 'serif',
              marginBottom: spacing.l,
            }}
          >
            Jump to Page
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <Pressable
              onPress={() => {
                const n = Math.max(1, (Number(value) || 1) - 1);
                setValue(String(n));
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: colors.sacredGold,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: colors.sacredGold, fontSize: 24 }}>‹</Text>
            </Pressable>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                marginHorizontal: spacing.l,
              }}
            >
              <TextInput
                value={value}
                onChangeText={setValue}
                onSubmitEditing={submit}
                keyboardType="number-pad"
                returnKeyType="go"
                style={{
                  fontFamily: 'serif',
                  fontWeight: '700',
                  fontSize: 36,
                  color: colors.sacredGold,
                  borderBottomWidth: 1,
                  borderColor: colors.sacredGold,
                  minWidth: 80,
                  textAlign: 'center',
                  paddingVertical: 4,
                }}
              />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: 'serif',
                  marginLeft: 8,
                }}
              >
                of {totalPages}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                const n = Math.min(totalPages, (Number(value) || 1) + 1);
                setValue(String(n));
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: colors.sacredGold,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: colors.sacredGold, fontSize: 24 }}>›</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={submit}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.surface : colors.byzantineCrimson,
              paddingVertical: spacing.m,
              borderRadius: radii.pill,
              alignItems: 'center',
            })}
          >
            <Text
              style={{
                color: colors.ivoryVellum,
                fontWeight: '700',
                fontFamily: 'serif',
                fontSize: 16,
              }}
            >
              Go
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
