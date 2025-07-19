<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <UPopover v-if="user" :ui="{ content: 'w-40' }">
    <UButton icon="lucide:circle-user" variant="ghost" />

    <template #content>
      <div class="divide-y text-xs *:p-2">
        <!-- User details -->
        <div>
          <div class="text-muted">รหัสพนักงาน</div>
          <div>{{ user.employeeId }}</div>
        </div>
        <div>
          <div class="text-muted">ชื่อ-นามสกุล</div>
          <div>{{ user.name }}</div>
        </div>
        <!-- Actions -->
        <div class="flex items-center justify-between">
          <ColorModeToggle />
          <UButton
            color="error"
            icon="lucide:log-out"
            variant="ghost"
            external
            to="/auth/logout"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
