<script setup lang="ts">
definePageMeta({
  layout: 'service',
});

const { id } = useRoute().params as { id: string };

const { data: service } = await useAsyncData('service', async () => {
  const result = await useRequestFetch()(`/api/services/${id}`);

  return result.data;
});

if (!service.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'ไม่พบบริการ',
  });
}

useHead({
  title: service.value.name,
  meta: [
    {
      name: 'description',
      content:
        service.value.description || 'บริการที่ให้ข้อมูลเกี่ยวกับบริการต่างๆ',
    },
  ],
});
</script>

<template>
  <div class="fixed left-0 w-screen h-dvh">
    <iframe class="w-full !h-full" :src="service?.url" />
  </div>
</template>
