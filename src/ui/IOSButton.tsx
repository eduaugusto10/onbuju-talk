import React, { memo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export type IOSButtonVariant = 'filled' | 'tinted' | 'plain';
export type IOSButtonSize = 'sm' | 'md' | 'lg';

export interface IOSButtonProps {
  label: string;
  onPress?: () => void;
  variant?: IOSButtonVariant;
  size?: IOSButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const sizeStyles: Record<IOSButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 32, paddingHorizontal: spacing.md, fontSize: 14 },
  md: { height: 44, paddingHorizontal: spacing.lg, fontSize: typography.headline.fontSize as number },
  lg: { height: 52, paddingHorizontal: spacing.xl, fontSize: 18 }
};

function IOSButtonBase({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  disabled = false,
  destructive = false,
  style,
  testID,
  accessibilityLabel
}: IOSButtonProps) {
  const accent = destructive ? colors.destructive : colors.systemBlue;
  const sizing = sizeStyles[size];

  const containerStyle: ViewStyle = {
    height: sizing.height,
    paddingHorizontal: sizing.paddingHorizontal,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.4 : 1,
    backgroundColor:
      variant === 'filled'
        ? accent
        : variant === 'tinted'
          ? colors.fill
          : 'transparent'
  };

  const textColor =
    variant === 'filled'
      ? '#FFFFFF'
      : accent;

  const textWeight: '400' | '500' | '600' =
    variant === 'filled' ? '600' : '500';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [containerStyle, pressed && !disabled ? { opacity: 0.6 } : null, style]}
    >
      {icon ? <View style={{ marginRight: spacing.sm }}>{icon}</View> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: textColor, fontSize: sizing.fontSize, fontWeight: textWeight }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center'
  }
});

export const IOSButton = memo(IOSButtonBase);
