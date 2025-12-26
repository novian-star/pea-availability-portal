<script setup lang="ts">
const { isNewYearPeriod, newYearYear } = useNewYearTheme();
</script>

<template>
  <div
    class="flex flex-col items-center min-h-[calc(100dvh-8rem)] p-4 pb-8 gap-8 relative z-10"
  >
    <ClientOnly v-if="isNewYearPeriod">
      <div>
        <h2 class="text-2xl font-bold text-center flex items-center gap-2">
          <span class="animate-pulse">🎉</span>
          สวัสดีปีใหม่ {{ newYearYear }}!
          <span class="animate-pulse">🎊</span>
        </h2>
      </div>
    </ClientOnly>
    <img
      class="max-w-3xl w-full h-auto rounded shadow aspect-auto"
      src="/images/landing.png"
      alt="Landing Image"
    />
    <div class="flex flex-col items-center gap-y-4">
      <UButton icon="lucide:server" to="/services"> ไปหน้าบริการ </UButton>
    </div>

    <ClientOnly>
      <div class="max-w-3xl w-full">
        <AvailabilityStatisticChart />
      </div>
      <template #fallback>
        <UIcon
          class="w-10 h-10 text-dimmed animate-spin"
          name="lucide:loader-circle"
        />
      </template>
    </ClientOnly>

    <!-- Falling snow effect - only during New Year period -->
    <ClientOnly v-if="isNewYearPeriod">
      <FallingSnow />
    </ClientOnly>
  </div>
</template>
