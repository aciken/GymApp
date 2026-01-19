import RevenueCatUI from 'react-native-purchases-ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
import Purchases from 'react-native-purchases';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function PaywallDiscount() {
  const router = useRouter();
  const { discount } = useLocalSearchParams();
  const { setIsPro, setIsNewUserOnboarding } = useGlobalContext();

  // RevenueCat offering identifiers (RevenueCat dashboard)
  // rewardWheel passes `discount=50`, which maps to the "50% Off" offering identifier.
  const OFFERING_ID = discount === '50' ? '50% Off' : 'Default';

  const [offering, setOffering] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [availableOfferingIds, setAvailableOfferingIds] = useState([]);

  // 🔹 Load offering
  useEffect(() => {
    async function loadOffering() {
      try {
        const offerings = await Purchases.getOfferings();

        const ids = Object.keys(offerings.all ?? {});
        setAvailableOfferingIds(ids);

        // 1) Exact match
        let selectedOffering = offerings.all?.[OFFERING_ID];

        // 2) Case-insensitive fallback (defensive)
        if (!selectedOffering) {
          const matchingKey = ids.find(
            (key) => key.trim().toLowerCase() === OFFERING_ID.trim().toLowerCase()
          );
          if (matchingKey) selectedOffering = offerings.all?.[matchingKey];
        }

        if (!selectedOffering) {
          setLoadError(
            `Offering '${OFFERING_ID}' not found. Available: ${ids.length ? ids.join(', ') : '(none)'}`
          );
          return;
        }

        setLoadError(null);
        setOffering(selectedOffering);
      } catch (e) {
        setLoadError(`Failed to load offerings: ${String(e?.message ?? e)}`);
      }
    }

    loadOffering();
  }, [OFFERING_ID]);

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

      if (isPro) setIsPro(true);

      setIsNewUserOnboarding(false);
      router.replace('/home');
    } catch (error) {
      console.error('Error handling restore completion:', error);
    }
  };

  const handleCloseButton = () => {
    setIsNewUserOnboarding(false);
    router.replace('/onboarding/programPreview');
  };

  // ⛔ Prevent rendering before offering is loaded
  if (!offering) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ActivityIndicator color="#FF9500" />
        {!!loadError && (
          <Text style={{ color: 'white', marginTop: 16, textAlign: 'center' }}>
            {loadError}
          </Text>
        )}
        {!loadError && (
          <Text style={{ color: 'white', marginTop: 16, textAlign: 'center' }}>
            Loading specialized offer...
          </Text>
        )}
      </View>
    );
  }

  // IMPORTANT:
  // RevenueCatUI.Paywall does NOT accept an `offering` prop directly.
  // It must be provided via `options={{ offering }}`.
  return (
    <RevenueCatUI.Paywall
      options={{ offering }}
      onPurchaseCompleted={handlePurchaseCompleted}
      onRestoreCompleted={handleRestoreCompleted}
      onDismiss={handleCloseButton}
    />
  );
}
