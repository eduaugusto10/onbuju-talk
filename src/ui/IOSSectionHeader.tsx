import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

export interface IOSSectionHeaderProps {
  title: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

function IOSSectionHeaderBase({ title, style, testID }: IOSSectionHeaderProps) {
  return (
    <Text testID={testID} style={[styles.header, style]}>
      {title.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: {
    ...typography.footnote,
    color: colors.secondaryLabel,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    letterSpacing: 0.5
  }
});

export const IOSSectionHeader = memo(IOSSectionHeaderBase);
