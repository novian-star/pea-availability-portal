<script setup lang="ts">
import { createServiceValidation } from '#shared/validations/service';
import type { FormSubmitEvent, SelectMenuItem } from '#ui/types';
import { FetchError } from 'ofetch';
import * as v from 'valibot';

definePageMeta({
  middleware: ['require-admin'],
});

const schema = v.object({
  name: v.message(createServiceValidation.entries.name, 'กรุณากรอกชื่อบริการ'),
  description: createServiceValidation.entries.description,
  url: v.message(
    createServiceValidation.entries.url,
    'กรุณากรอก URL ของบริการที่ถูกต้อง'
  ),
  urlType: v.message(
    createServiceValidation.entries.urlType,
    'กรุณาเลือกประเภท URL'
  ),
});

const state = reactive<v.InferInput<typeof schema>>({
  name: '',
  description: '',
  url: '',
  urlType: 'external',
});

type UrlType = v.InferInput<typeof schema>['urlType'];

const urlTypeItems: SelectMenuItem[] = [
  {
    label: 'ภายนอก',
    value: 'external' satisfies UrlType,
  },
  {
    label: 'ฝั่ง',
    value: 'embedded' satisfies UrlType,
  },
];

const isSubmitting = ref(false);

async function handleSubmit(
  event: FormSubmitEvent<v.InferOutput<typeof schema>>
) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  const toast = useToast();

  try {
    const { data } = event;

    await $fetch('/api/services', {
      method: 'POST',
      body: data,
    });

    toast.add({
      title: 'บริการถูกเพิ่มเรียบร้อยแล้ว',
    });

    navigateTo('/services');
  } catch (error) {
    if (error instanceof FetchError) {
      toast.add({
        title: 'Fetch Error',
        description: error.message,
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
  <div class="flex flex-col max-w-sm px-4 mx-auto">
    <header class="flex items-center py-4 border-b border-default">
      <h1 class="font-medium">เพิ่มบริการ</h1>
      <UButton class="ms-auto" icon="lucide:x" variant="ghost" to="/services" />
    </header>
    <div>
      <UForm
        class="flex flex-col py-4 gap-4"
        :schema="schema"
        :state="state"
        @submit="handleSubmit"
      >
        <!-- Fields -->
        <div class="flex flex-col gap-2">
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
        </div>
        <div class="flex">
          <UButton
            class="ms-auto"
            icon="lucide:save"
            :loading="isSubmitting"
            type="submit"
          >
            บันทึก
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>
