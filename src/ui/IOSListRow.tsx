import React, { memo, ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export interface IOSListRowProps {
  label: string;
  accessory?: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function IOSListRowBase({
  label,
  accessory,
  icon,
  onPress,
  isFirst = false,
  isLast = false,
  destructive = false,
  disabled = false,
  style,
  testID
}: IOSListRowProps) {
  const radiusStyle: ViewStyle = {
    borderTopLeftRadius: isFirst ? radii.lg : 0,
    borderTopRightRadius: isFirst ? radii.lg : 0,
    borderBottomLeftRadius: isLast ? radii.lg : 0,
    borderBottomRightRadius: isLast ? radii.lg : 0
  };

  const rowStyle: ViewStyle = {
    ...styles.row,
    ...radiusStyle,
    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
    opacity: disabled ? 0.5 : 1
  };

  const content = (
    <>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          destructive ? { color: colors.destructive } : null
        ]}
      >
        {label}
      </Text>
      <View style={styles.accessory}>{accessory}</View>
    </>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          rowStyle,
          pressed ? { backgroundColor: colors.tertiaryFill } : null,
          style
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[rowStyle, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondarySystemGroupedBackground,
    borderBottomColor: colors.separator
  },
  icon: {
    marginRight: spacing.md
  },
  label: {
    flex: 1,
    ...typography.body,
    color: colors.label
  },
  accessory: {
    marginLeft: spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export const IOSListRow = memo(IOSListRowBase);
