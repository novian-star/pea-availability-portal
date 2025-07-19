<script setup lang="ts">
import { FetchError } from 'ofetch';

const props = defineProps<{
  data: { id: string; deletedAt: string | null };
}>();

const emit = defineEmits<{
  close: [false];
  confirm: [false];
}>();

function handleClose() {
  emit('close', false);
}

const isSubmitting = ref(false);

async function handleConfirm() {
  if (isSubmitting.value) return;

  const toast = useToast();
  isSubmitting.value = true;
  try {
    await $fetch(`/api/services/${props.data.id}`, {
      method: 'DELETE',
    });

    emit('confirm', false);
    handleClose();

    await refreshNuxtData();
    toast.add({
      title: 'ลบบริการสำเร็จ',
    });
  } catch (error) {
    if (error instanceof FetchError) {
      toast.add({
        title: 'Fetch Error',
        description: error.data.message || 'เกิดข้อผิดพลาดในการลบบริการ',
        color: 'error',
      });
      console.error('Fetch Error:', error);
    } else {
      toast.add({
        title: 'Error',
        description: 'An unexpected error occurred.',
        color: 'error',
      });
      console.error('Unexpected Error:', error);
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <UModal>
    <template #header>
      <h3>ลบบริการ {{ props.data.deletedAt ? '(ถาวร)' : '' }}</h3>
    </template>
    <template #footer>
      <div class="flex items-center w-full gap-2">
        <UButton block icon="lucide:x" variant="ghost" @click="handleClose">
          ยกเลิก
        </UButton>
        <UButton block color="error" icon="lucide:trash" @click="handleConfirm">
          ยืนยันลบ
        </UButton>
      </div>
    </template>
  </UModal>
</template>
