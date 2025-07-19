<script setup lang="ts">
import { updateServiceValidation } from '#shared/validations/service';
import type { FormSubmitEvent, SelectMenuItem } from '#ui/types';

import { FetchError } from 'ofetch';
import * as v from 'valibot';

const props = defineProps<{
  data: {
    id: string;
    name: string;
    description: string | null;
    url: string;
    urlType: string;
  };
}>();

const emit = defineEmits<{
  close: [false];
  confirm: [false];
}>();

const schema = v.object({
  name: updateServiceValidation.entries.name,
  description: updateServiceValidation.entries.description,
  url: updateServiceValidation.entries.url,
  urlType: updateServiceValidation.entries.urlType,
});

const state = reactive<v.InferInput<typeof schema>>({
  name: props.data.name,
  description: props.data.description || '',
  url: props.data.url,
  urlType: (props.data.urlType as UrlType) || 'external',
});

type UrlType = v.InferInput<typeof schema>['urlType'];

const urlTypeItems: SelectMenuItem[] = [
  { label: 'ภายนอก', value: 'external' satisfies UrlType },
  { label: 'ฝั่ง', value: 'embedded' satisfies UrlType },
];

const isSubmitting = ref(false);

function handleClose() {
  emit('close', false);
}

const form = useTemplateRef('form');

async function handleSubmit(
  event: FormSubmitEvent<v.InferOutput<typeof schema>>
) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  const toast = useToast();
  try {
    const { data } = event;
    await $fetch(`/api/services/${props.data.id}`, {
      method: 'PUT',
      body: data,
    });
    emit('confirm', false);
    handleClose();
    await refreshNuxtData('services');
    toast.add({
      title: 'อัปเดตบริการสำเร็จ',
    });
  } catch (error) {
    if (error instanceof FetchError) {
      toast.add({
        title: 'Fetch Error',
        description: error.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตบริการ',
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
      <h3>แก้ไขบริการ</h3>
    </template>
    <template #body>
      <div class="flex flex-col gap-4">
        <UForm
          ref="form"
          class="flex flex-col gap-4"
          :schema="schema"
          :state="state"
          @submit="handleSubmit"
        >
          <UFormField label="ชื่อบริการ" name="name" required>
            <UInput v-model="state.name" placeholder="กรุณากรอกชื่อบริการ" />
          </UFormField>
          <UFormField label="คำอธิบาย" name="description">
            <UTextarea
              v-model="state.description"
              placeholder="รายละเอียดบริการ"
            />
          </UFormField>
          <UFormField label="URL" name="url" required>
            <UInput v-model="state.url" placeholder="https://example.com" />
          </UFormField>
          <UFormField label="ประเภท URL" name="urlType" required>
            <USelect
              v-model="state.urlType"
              :items="urlTypeItems"
              value-key="value"
            />
            <template #help>
              <ul class="list-disc list-inside">
                <li>หากต้องการลิงค์ไปยังภายนอกให้เลือก "ภายนอก"</li>
                <li>หากต้องการฝังลิงค์ (แสดงในเว็บไซต์) ให้เลือก "ฝั่ง"</li>
              </ul>
            </template>
          </UFormField>
          <button type="submit" class="hidden" />
        </UForm>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center w-full gap-4">
        <UButton block icon="lucide:x" variant="ghost" @click="handleClose">
          ยกเลิก
        </UButton>
        <UButton
          block
          icon="lucide:save"
          :loading="isSubmitting"
          @click="form?.submit()"
        >
          บันทึกการเปลี่ยนแปลง
        </UButton>
      </div>
    </template>
  </UModal>
</template>
