<script setup lang="ts">
import NavigationSlideover from '~/components/layouts/NavigationSlideover.vue';
import NoticeModal from '~/components/NoticeModal.vue';

const navigationSlideover = useOverlay().create(NavigationSlideover);

const { notice, isEnabled } = useNotice();
const noticeModal = useOverlay().create(NoticeModal);

function handleNoticeClick() {
  if (notice.value) {
    noticeModal.open({ data: notice.value });
  }
}
</script>

<template>
  <header
    class="flex items-center justify-between h-16 px-4 bg-default border-b border-default z-50"
  >
    <div class="flex items-center gap-4">
      <UButton
        icon="lucide:menu"
        variant="ghost"
        @click="navigationSlideover.open()"
      />
      <UButton icon="lucide:house" to="/" />
    </div>
    <div class="flex items-center gap-4">
      <UButton
        v-if="isEnabled && notice"
        icon="lucide:bell"
        variant="ghost"
        @click="handleNoticeClick"
      />
      <UserSessionMenu />
    </div>
  </header>
</template>
