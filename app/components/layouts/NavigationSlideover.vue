<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();

const { items } = useNavigation();

const route = useRoute();
watch(
  () => route.path,
  () => emit('close')
);
</script>

<template>
  <USlideover side="left" :ui="{ content: 'w-80 border-e' }">
    <template #content>
      <header class="flex items-center justify-between h-16 px-4">
        <UButton icon="lucide:menu" variant="ghost" />
        <UButton icon="lucide:x" variant="ghost" @click="emit('close')" />
      </header>
      <div class="p-4">
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ root: 'gap-4', list: 'space-y-2' }"
        />
      </div>
    </template>
  </USlideover>
</template>
