import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

export async function scheduleReleaseReminder(params: {
  title: string;
  body?: string;
  releaseDateISO: string; // YYYY-MM-DD or ISO string
}): Promise<string | null> {
  try {
    // Avoid attempting advanced notifications in Expo Go (push not supported).
    if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
      console.warn('[notifications] Skipping scheduling in Expo Go on Android. Use a development build.');
      // Local notifications can still be limited; inform the user unobtrusively.
      Alert.alert('Reminder not scheduled', 'Use a development build to enable release reminders.');
      return null;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const date = new Date(params.releaseDateISO);
    if (isNaN(date.getTime())) return null;

    // Schedule at 9 AM local time on release date
    date.setHours(9, 0, 0, 0);
    if (date.getTime() <= Date.now()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body ?? 'Releases today! 🎬',
        sound: Platform.select({ ios: 'default', android: true }) as any,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: date,
    });
    return id;
  } catch (e) {
    return null;
  }
}

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android channel for high priority alerts
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('releases', {
      name: 'Release Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});
  }
}


