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
</script>

<template>
  <div>
    <ApplicationBar />
    <slot />
  </div>
</template>
