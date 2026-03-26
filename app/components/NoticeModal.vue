<script setup lang="ts">
const props = defineProps<{
  data: {
    title: string | null;
    content: string | null;
    updatedAt: string;
  };
}>();

const emit = defineEmits<{
  close: [false];
}>();

function handleClose() {
  emit('close', false);
}
</script>

<template>
  <UModal>
    <template #header>
      <h3 class="text-lg font-semibold">{{ props.data.title }}</h3>
    </template>

    <template #body>
      <div
        class="prose prose-sm dark:prose-invert max-w-none text-muted text-sm"
      >
        <p class="whitespace-pre-wrap">{{ props.data.content }}</p>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end w-full">
        <UButton icon="lucide:x" @click="handleClose"> ปิด </UButton>
      </div>
    </template>
  </UModal>
</template>
