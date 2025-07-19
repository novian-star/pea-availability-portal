<script setup lang="ts"></script>

<template>
  <div class="flex flex-col items-center h-[calc(100dvh-8rem)] p-4 gap-8">
    <img
      class="max-w-3xl w-full h-auto rounded shadow aspect-auto"
      src="/images/landing.png"
      alt="Landing Image"
    />

    <div>
      <UButton icon="lucide:server" to="/services"> ไปหน้าบริการ </UButton>
    </div>
  </div>
</template>
