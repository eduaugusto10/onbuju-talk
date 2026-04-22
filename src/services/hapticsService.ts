import * as Haptics from 'expo-haptics';

export type HapticIntensity =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

export function triggerHaptic(intensity: HapticIntensity = 'light'): void {
  void (async () => {
    try {
      switch (intensity) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          return;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
      }
    } catch {
      // silent — platform without haptics / unavailable module
    }
  })();
}
