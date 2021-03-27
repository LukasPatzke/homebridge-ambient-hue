import { HapticsImpactStyle, HapticsNotificationType, Plugins } from '@capacitor/core';


const useHaptics = () => {
  const { Haptics } = Plugins;
  return [ Haptics ]
}

export { useHaptics, HapticsImpactStyle };
export type { HapticsNotificationType };
