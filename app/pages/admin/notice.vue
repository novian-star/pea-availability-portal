<script setup lang="ts">
import ManageNoticeModal from '~/components/admin/ManageNoticeModal.vue';

definePageMeta({
  middleware: ['require-admin'],
});

const { notice } = useNotice();

const manageModal = useOverlay().create(ManageNoticeModal);

async function handleManageClick() {
  manageModal.open({
    data: notice.value
      ? {
          title: notice.value.title,
          content: notice.value.content,
          isEnabled: notice.value.isEnabled,
          showInBanner: notice.value.showInBanner,
        }
      : null,
  });
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">จัดการประกาศ</h1>
    </div>

    <div
      v-if="notice"
      class="bg-default border border-default rounded-lg p-6 space-y-4"
    >
      <div>
        <h2 class="text-lg font-semibold mb-2">{{ notice.title }}</h2>
        <p class="text-muted-foreground whitespace-pre-wrap">
          {{ notice.content }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UBadge
          color="neutral"
          :variant="notice.isEnabled ? 'solid' : 'outline'"
        >
          {{ notice.isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
        </UBadge>
        <UBadge v-if="notice.showInBanner" color="neutral">
          แสดงในแบนเนอร์
        </UBadge>
        <span class="text-sm text-muted-foreground">
          อัปเดตล่าสุด: {{ new Date(notice.updatedAt).toLocaleString('th-TH') }}
        </span>
      </div>

      <UButton icon="lucide:edit" @click="handleManageClick">
        แก้ไขประกาศ
      </UButton>
    </div>

    <div
      v-else
      class="bg-default border border-default rounded-lg p-6 text-center space-y-4"
    >
      <p class="text-muted-foreground">ยังไม่มีประกาศ</p>
      <UButton icon="lucide:plus" @click="handleManageClick">
        สร้างประกาศ
      </UButton>
    </div>
  </div>
</template>
