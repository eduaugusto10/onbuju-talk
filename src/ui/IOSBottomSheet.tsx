import { BlurView } from 'expo-blur';
import React, { memo, ReactNode } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export interface IOSBottomSheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  bold?: boolean;
  disabled?: boolean;
}

export interface IOSBottomSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  leftAction?: IOSBottomSheetAction;
  rightAction?: IOSBottomSheetAction;
  children: ReactNode;
  maxHeightPct?: number;
  closeOnBackdropPress?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function IOSBottomSheetBase({
  visible,
  onRequestClose,
  title,
  leftAction,
  rightAction,
  children,
  maxHeightPct = 0.85,
  closeOnBackdropPress = true,
  style,
  testID
}: IOSBottomSheetProps) {
  const hasHeader = Boolean(title || leftAction || rightAction);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <BlurView intensity={70} tint="default" style={styles.backdrop} />
      <Pressable
        testID={testID ? `${testID}-backdrop` : undefined}
        onPress={closeOnBackdropPress ? onRequestClose : undefined}
        style={styles.backdropTap}
      />
      <View pointerEvents="box-none" style={styles.container}>
        <SafeAreaView
          style={[
            styles.sheet,
            { maxHeight: `${Math.round(maxHeightPct * 100)}%` },
            style
          ]}
        >
          <View style={styles.grabberWrap}>
            <View style={styles.grabber} />
          </View>
          {hasHeader ? (
            <View style={styles.header}>
              <View style={styles.headerSide}>
                {leftAction ? (
                  <ActionButton action={leftAction} align="left" />
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.title}>
                {title ?? ''}
              </Text>
              <View style={styles.headerSide}>
                {rightAction ? (
                  <ActionButton action={rightAction} align="right" />
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={styles.content}>{children}</View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ActionButton({
  action,
  align
}: {
  action: IOSBottomSheetAction;
  align: 'left' | 'right';
}) {
  const color = action.destructive ? colors.destructive : colors.systemBlue;
  return (
    <Pressable
      onPress={action.disabled ? undefined : action.onPress}
      disabled={action.disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
        align === 'left' ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' },
        pressed ? { opacity: 0.5 } : null
      ]}
    >
      <Text
        style={{
          color,
          opacity: action.disabled ? 0.4 : 1,
          fontSize: 17,
          fontWeight: action.bold ? '600' : '400'
        }}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)'
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.systemBackground,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden'
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.systemGray3
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator
  },
  headerSide: {
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...typography.headline,
    color: colors.label
  },
  content: {
    flexGrow: 1,
    flexShrink: 1
  }
});

export const IOSBottomSheet = memo(IOSBottomSheetBase);
