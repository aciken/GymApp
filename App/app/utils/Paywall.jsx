import RevenueCatUI from 'react-native-purchases-ui';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Paywall() {
  const router = useRouter();
  const { setIsPro, setIsNewUserOnboarding } = useGlobalContext();

  const handlePurchaseCompleted = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = customerInfo?.entitlements?.all?.pro?.isActive ?? false;
      setIsPro(isPro);
      setIsNewUserOnboarding(false);
      router.replace('/home');
    } catch (error) {
      console.error('Error handling purchase completion:', error);
    }
  };

  const handleRestoreCompleted = async (info) => {
    try {
      const isPro = info?.customerInfo?.entitlements?.all?.pro?.isActive ?? false;
      console.log(info, isPro);
      if (isPro) {
        setIsPro(true);
      }
      setIsNewUserOnboarding(false);
      router.replace('/home');
    } catch (error) {
      console.error('Error handling restore completion:', error);
    }
  };

  const triggerWheelThenGoBack = async () => {
    try {
      // Use storage because route params can be flaky with replace() depending on nav state.
      await AsyncStorage.setItem('open_reward_wheel', '1');
      await AsyncStorage.setItem('open_reward_wheel_ts', String(Date.now()));
    } catch (e) {
      console.error('Failed to set open_reward_wheel flag:', e);
    }

    // Go back to ProgramPreview; it will read the flag and open RewardWheel after 2s.
    router.replace('/onboarding/programPreview');
  };

  const handleCloseButton = () => {
    triggerWheelThenGoBack();
  }

  const handleGoBack = () => {
    triggerWheelThenGoBack();
  }

  return (
    <RevenueCatUI.Paywall 
      onPurchaseCompleted={handlePurchaseCompleted}
      onRestoreCompleted={handleRestoreCompleted}
      onDismiss={handleCloseButton}
      onGoBack={handleGoBack}
    />
  );
}