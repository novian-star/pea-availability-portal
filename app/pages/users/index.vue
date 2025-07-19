<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '#ui/types';

definePageMeta({
  middleware: ['require-admin'],
});

const toast = useToast();

const userSession = useUserSession();

const { data: users } = await useAsyncData('users', async () => {
  const result = await useRequestFetch()('/api/users');

  return result.data;
});

const columns: TableColumn<NonNullable<typeof users.value>[number]>[] = [
  {
    accessorKey: 'employeeId',
    header: 'รหัสพนักงาน',
  },
  {
    accessorKey: 'name',
    header: 'ชื่อ-นามสกุล',
  },
  {
    accessorKey: 'email',
    header: 'อีเมล',
  },
  {
    accessorKey: 'department',
    header: 'แผนก',
  },
  {
    accessorKey: 'position',
    header: 'ตำแหน่ง',
  },
  {
    accessorKey: 'createdAt',
    accessorFn: (row) => new Date(row.createdAt).toLocaleString('th-TH'),
    header: 'ลงทะเบียนเมื่อ',
  },
  {
    accessorKey: 'updatedAt',
    accessorFn: (row) => new Date(row.updatedAt).toLocaleString('th-TH'),
    header: 'แก้ไขล่าสุดเมื่อ',
  },
  {
    accessorKey: 'actions',
    header: '',
  },
];

function createDropdownMenuItems(
  user: NonNullable<typeof users.value>[number]
): DropdownMenuItem[] {
  const items: DropdownMenuItem[] = [];

  const isSuperAdmin = userSession.user.value?.isSuperAdmin;
  const isAdmin = userSession.user.value?.isAdmin;
  const isCurrentUser = userSession.user.value?.id === user.id;

  const disabled = (() => {
    if (isCurrentUser) return true;
    else if (isSuperAdmin) {
      if (user.isSuperAdmin) return true;
      return false;
    } else if (isAdmin && !isSuperAdmin) {
      if (user.isSuperAdmin) return true;
      if (user.isAdmin) return true;
      return false;
    } else {
      return false;
    }
  })();

  if (userSession.user.value?.isAdmin) {
    items.push({
      label: `${user.isAdmin ? 'ปิด' : 'เปิด'}สิทธิ์ผู้ดูแลระบบ`,
      icon: user.isAdmin ? 'lucide:shield' : 'lucide:shield-off',
      disabled: disabled,
      onSelect: () => handleDropdownAction(user, 'toggle-admin'),
    });
  }

  return items;
}

async function handleDropdownAction(
  user: NonNullable<typeof users.value>[number],
  action: string
) {
  if (action === 'toggle-admin') {
    const newStatus = !user.isAdmin;
    try {
      await $fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        body: { isAdmin: newStatus },
      });

      toast.add({
        title: 'สำเร็จ',
        description: `สิทธิ์ผู้ดูแลระบบของ ${user.name} ถูก ${
          newStatus ? 'เปิด' : 'ปิด'
        } แล้ว`,
      });

      await refreshNuxtData('users');
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.add({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเปลี่ยนสิทธิ์ผู้ดูแลระบบได้',
        color: 'error',
      });
    }
  }
}
</script>

<template>
  <div class="divide-y">
    <header class="flex items-center h-16 px-4 gap-2">
      <UIcon class="w-5 h-5" name="lucide:users" />
      <h1>ผู้ใช้งาน</h1>
    </header>
    <main>
      <div>
        <UTable :columns="columns" :data="users" :ui="{ th: 'truncate' }">
          <template #employeeId-cell="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.original.employeeId }}</span>
              <UTooltip v-if="row.original.isAdmin" text="ผู้ดูแลระบบ">
                <UBadge
                  :icon="
                    row.original.isSuperAdmin
                      ? 'lucide:shield-user'
                      : 'lucide:shield'
                  "
                  variant="outline"
                />
              </UTooltip>
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="createDropdownMenuItems(row.original)">
              <UButton icon="lucide:ellipsis-vertical" variant="ghost" />
            </UDropdownMenu>
          </template>

          <template #empty>
            <div class="text-center text-muted-foreground">ไม่พบผู้ใช้งาน</div>
          </template>
        </UTable>
      </div>
    </main>
  </div>
</template>
