import React, { memo, ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';
import { IOSSectionHeader } from './IOSSectionHeader';

export interface IOSListSectionProps {
  header?: string;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function IOSListSectionBase({ header, footer, children, style, testID }: IOSListSectionProps) {
  return (
    <View testID={testID} style={[styles.wrapper, style]}>
      {header ? <IOSSectionHeader title={header} /> : null}
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.secondarySystemGroupedBackground,
    overflow: 'hidden',
    ...shadows.sm
  },
  footer: {
    ...typography.caption1,
    color: colors.secondaryLabel,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm
  }
});

export const IOSListSection = memo(IOSListSectionBase);
