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
  midday: boolean;
  middayHour: number;
  middayMinute: number;
  evening: boolean;
  eveningHour: number;
  eveningMinute: number;
};

export const DEFAULT_SETTINGS: NotifSettings = {
  morning: false,
  morningHour: 7,
  morningMinute: 0,
  midday: false,
  middayHour: 12,
  middayMinute: 0,
  evening: false,
  eveningHour: 21,
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

function fmt12(hour: number, minute: number): string {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

async function applySchedule(s: NotifSettings): Promise<void> {
  try {
    const N = await import('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();

    if (s.morning) {
      await N.scheduleNotificationAsync({
        content: {
          title: '☀ Morning Prayers',
          body: 'Begin your day with the Trisagion and morning prayers.',
          sound: true,
          data: { slug: 'morning-trisagion', screen: 'prayer' },
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: s.morningHour,
          minute: s.morningMinute,
        },
      });
    }

    if (s.midday) {
      await N.scheduleNotificationAsync({
        content: {
          title: '◎ Midday Prayer',
          body: `${fmt12(s.middayHour, s.middayMinute)} · Pause for a moment of prayer.`,
          sound: true,
          data: { slug: 'midday-prayer', screen: 'prayer' },
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: s.middayHour,
          minute: s.middayMinute,
        },
      });
    }

    if (s.evening) {
      await N.scheduleNotificationAsync({
        content: {
          title: '☽ Evening Prayers',
          body: 'Close your day with Evening Prayers and thanksgiving.',
          sound: true,
          data: { slug: 'evening-trisagion', screen: 'prayer' },
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
