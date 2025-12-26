export const useNewYearTheme = () => {
  const isNewYearPeriod = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = now.getDate();

    // Check if we're in the New Year period (Dec 25 - Jan 7)
    if (currentMonth === 12 && currentDay >= 25) {
      return true; // December 25-31
    }
    if (currentMonth === 1 && currentDay <= 7) {
      return true; // January 1-7
    }
    return false;
  });

  const newYearYear = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    // If we're in December, show next year
    if (currentMonth === 12) {
      return now.getFullYear() + 1;
    }
    // If we're in January, show current year
    return now.getFullYear();
  });

  // Snow intensity based on the date
  const snowIntensity = computed(() => {
    if (!isNewYearPeriod.value) return 'none';
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Peak snow on New Year's Eve and New Year's Day
    if ((currentMonth === 12 && currentDay === 31) || (currentMonth === 1 && currentDay === 1)) {
      return 'heavy';
    }
    // Moderate snow during the holiday period
    if ((currentMonth === 12 && currentDay >= 25) || (currentMonth === 1 && currentDay <= 3)) {
      return 'moderate';
    }
    // Light snow for the rest of the period
    return 'light';
  });

  return {
    isNewYearPeriod: readonly(isNewYearPeriod),
    newYearYear: readonly(newYearYear),
    snowIntensity: readonly(snowIntensity),
  };
};
