<script setup lang="ts">
import { updateNoticeValidation } from '#shared/validations/notice';
import type { FormSubmitEvent } from '#ui/types';

import { FetchError } from 'ofetch';
import type * as v from 'valibot';

const props = defineProps<{
  data: {
    title: string | null;
    content: string | null;
    isEnabled: boolean;
  } | null;
}>();

const emit = defineEmits<{
  close: [false];
  confirm: [false];
}>();

const schema = updateNoticeValidation;

const state = reactive<v.InferInput<typeof schema>>({
  title: props.data?.title || '',
  content: props.data?.content || '',
  isEnabled: props.data?.isEnabled || false,
});

const isSubmitting = ref(false);

function handleClose() {
  emit('close', false);
}

const form = useTemplateRef('form');

async function handleSubmit(
  event: FormSubmitEvent<v.InferOutput<typeof schema>>,
) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  const toast = useToast();
  try {
    const { data } = event;
    await $fetch('/api/notice', {
      method: 'PUT',
      body: data,
    });
    await refreshNuxtData('notice');
    toast.add({
      title: 'อัปเดตประกาศสำเร็จ',
      color: 'neutral',
    });
    emit('confirm', false);
    handleClose();
  } catch (error) {
    if (error instanceof FetchError) {
      toast.add({
        title: 'Fetch Error',
        description: error.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตประกาศ',
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
      <h3 class="text-lg font-semibold">จัดการประกาศ</h3>
    </template>

    <template #body>
      <UForm ref="form" :schema="schema" :state="state" @submit="handleSubmit">
        <div class="flex flex-col gap-4">
          <UFormField
            label="หัวข้อประกาศ"
            name="title"
            :required="state.isEnabled"
          >
            <UInput
              v-model="state.title"
              placeholder="กรอกหัวข้อประกาศ"
              :disabled="!state.isEnabled"
            />
          </UFormField>

          <UFormField
            label="เนื้อหาประกาศ"
            name="content"
            :required="state.isEnabled"
          >
            <UTextarea
              v-model="state.content"
              placeholder="กรอกเนื้อหาประกาศ"
              :rows="6"
              :disabled="!state.isEnabled"
            />
          </UFormField>

          <UFormField label="สถานะ" name="isEnabled">
            <UCheckbox
              v-model="state.isEnabled"
              color="neutral"
              label="เปิดใช้งานประกาศ"
            />
          </UFormField>
        </div>
      </UForm>
    </template>

    <template #footer>
      <div class="flex items-center w-full gap-2">
        <UButton block icon="lucide:x" variant="ghost" @click="handleClose">
          ยกเลิก
        </UButton>
        <UButton
          block
          icon="lucide:save"
          :loading="isSubmitting"
          @click="form?.submit()"
        >
          บันทึก
        </UButton>
      </div>
    </template>
  </UModal>
</template>
