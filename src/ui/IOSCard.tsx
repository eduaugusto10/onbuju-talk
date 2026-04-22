import React, { memo, ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

export interface IOSCardProps {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function IOSCardBase({ children, padding = spacing.md, style, testID }: IOSCardProps) {
  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors.systemBackground,
          borderRadius: radii.lg,
          padding,
          ...shadows.sm
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

export const IOSCard = memo(IOSCardBase);
