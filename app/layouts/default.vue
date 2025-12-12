<script setup lang="ts">
const userSession = useUserSession();

// Define the visibility change handler as a named function
async function handleVisibilityChange() {
  if (!document.hidden) {
    try {
      // Check if the user is still logged in
      await userSession.fetch();

      if (!userSession.loggedIn.value) {
        navigateTo('/login');
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      // Consider redirecting to login or showing an error message
      navigateTo('/login');
    }
  }
}

onMounted(() => {
  // Add event listener with the named function
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// Store the function reference to be removed later
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

const runtimeConfig = useRuntimeConfig();

const bannerMessage = runtimeConfig.public.bannerMessage;
const bannerType = (() => {
  switch (runtimeConfig.public.bannerType) {
    case 'info':
    case 'warning':
    case 'error':
      return runtimeConfig.public.bannerType;
    default:
      return 'neutral';
  }
})();
</script>

<template>
  <div>
    <UBanner v-if="bannerMessage" :color="bannerType" :title="bannerMessage" />
    <ApplicationBar />
    <slot />
  </div>
</template>
