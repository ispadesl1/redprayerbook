import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

/** Accessibility reduce-motion flag (Reanimated + system setting). */
export function useReducedMotion(): boolean {
  return useReanimatedReducedMotion();
}
