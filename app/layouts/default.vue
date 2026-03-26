<script setup lang="ts">
import NoticeModal from '~/components/NoticeModal.vue';

const userSession = useUserSession();

const {
  notice,
  shouldShowPopup,
  shouldShowInBanner,
  truncateContent,
  markAsSeen,
} = useNotice();
const noticeModal = useOverlay().create(NoticeModal);

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

function openNoticeModal() {
  if (notice.value) {
    noticeModal.open({ data: notice.value });
  }
}

onMounted(() => {
  // Add event listener with the named function
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Show notice popup if applicable
  if (shouldShowPopup.value && notice.value) {
    noticeModal.open({ data: notice.value });
    markAsSeen();
  }
});

// Store the function reference to be removed later
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

const runtimeConfig = useRuntimeConfig();

// DEPRECATED: Environment-based banner (fallback for backward compatibility)
// Use the notice system instead via admin panel
const legacyBannerMessage = runtimeConfig.public.bannerMessage;
const legacyBannerType = (() => {
  switch (runtimeConfig.public.bannerType) {
    case 'info':
    case 'warning':
    case 'error':
      return runtimeConfig.public.bannerType;
    default:
      return 'neutral';
  }
})();

// Notice-based banner takes precedence over legacy env-based banner
const showLegacyBanner = computed(
  () => !shouldShowInBanner.value && !!legacyBannerMessage,
);

const bannerContent = computed(() => {
  if (!notice.value) return '';
  const truncated = truncateContent(notice.value.content, 120);
  return `${notice.value.title}: ${truncated}`;
});
</script>

<template>
  <div>
    <!-- Notice-based banner (new system) -->
    <UBanner v-if="shouldShowInBanner && notice" color="neutral">
      <template #title>
        <div class="flex items-center gap-2">
          <span>{{ bannerContent }}</span>
          <UButton size="xs" variant="outline" @click="openNoticeModal">
            ดูเพิ่มเติม
          </UButton>
        </div>
      </template>
    </UBanner>

    <!-- Legacy env-based banner (deprecated, fallback only) -->
    <UBanner
      v-else-if="showLegacyBanner"
      :color="legacyBannerType"
      :title="legacyBannerMessage"
    />

    <ApplicationBar />
    <slot />
  </div>
</template>
