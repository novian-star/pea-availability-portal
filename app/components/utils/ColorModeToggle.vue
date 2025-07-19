<script setup lang="ts">
const colorMode = useColorMode();

const preferences = [
  {
    value: 'light',
    icon: 'lucide:sun',
  },
  {
    value: 'dark',
    icon: 'lucide:moon',
  },
  {
    value: 'system',
    icon: 'lucide:monitor',
  },
];

const currentPreference = computed(
  () =>
    preferences.find(
      (preference) => preference.value === colorMode.preference
    ) ?? preferences[0]!
);

function toggleColorMode() {
  const currentIndex = preferences.findIndex(
    (preference) => preference.value === colorMode.preference
  );

  const nextIndex = (currentIndex + 1) % preferences.length;

  colorMode.preference = preferences[nextIndex]?.value ?? preferences[0]!.value;
}
</script>

<template>
  <slot
    :preferences="preferences"
    :current-preference="currentPreference"
    :toggle-color-mode="toggleColorMode"
  >
    <UButton
      :icon="currentPreference.icon"
      variant="ghost"
      @click="toggleColorMode"
    />
  </slot>
</template>
