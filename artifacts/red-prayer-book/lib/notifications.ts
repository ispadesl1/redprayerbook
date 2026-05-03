import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const N = await import('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    const s = await getNotifSettings();
    await applySchedule(s);
  } catch {}
}

const NOTIF_KEY = 'rpb:notifications';

export type NotifSettings = {
  morning: boolean;
  morningHour: number;
  morningMinute: number;
  evening: boolean;
  eveningHour: number;
  eveningMinute: number;
};

export const DEFAULT_SETTINGS: NotifSettings = {
  morning: false,
  morningHour: 7,
  morningMinute: 0,
  evening: false,
  eveningHour: 19,
  eveningMinute: 0,
};

export async function getNotifSettings(): Promise<NotifSettings> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveNotifSettings(settings: NotifSettings): Promise<void> {
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
  if (Platform.OS !== 'web') {
    await applySchedule(settings);
  }
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const N = await import('expo-notifications');
    const { status: existing } = await N.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

async function applySchedule(s: NotifSettings): Promise<void> {
  try {
    const N = await import('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();

    if (s.morning) {
      await N.scheduleNotificationAsync({
        content: {
          title: '✟ Morning Prayer',
          body: 'Begin your day in peace. Lord, grant me to greet the coming day with prayer.',
          sound: true,
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: s.morningHour,
          minute: s.morningMinute,
        },
      });
    }

    if (s.evening) {
      await N.scheduleNotificationAsync({
        content: {
          title: '☾ Evening Prayer',
          body: 'End your day with prayer. Grant us refreshment of body and soul.',
          sound: true,
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: s.eveningHour,
          minute: s.eveningMinute,
        },
      });
    }
  } catch (e) {
    console.warn('Notification schedule failed:', e);
  }
}
