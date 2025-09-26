<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '#ui/types';

definePageMeta({
	middleware: ['require-admin'],
});

const toast = useToast();

const userSession = useUserSession();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(100);

const { data: usersResponse, pending } = await useAsyncData(
	'users',
	async () => {
		const result = await useRequestFetch()('/api/users', {
			query: {
				page: currentPage.value,
				limit: pageSize.value,
			},
		});
		return result;
	},
	{
		watch: [currentPage, pageSize],
	}
);

const users = computed(() => usersResponse.value?.data || []);
const pagination = computed(() => usersResponse.value?.pagination);

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
				<!-- Page -->
				<div
					class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b"
				>
					<div
						v-if="pagination"
						class="text-sm text-gray-600 dark:text-gray-400"
					>
						แสดง {{ (pagination.page - 1) * pagination.limit + 1 }}-{{
							Math.min(pagination.page * pagination.limit, pagination.total)
						}}
						จาก {{ pagination.total }} รายการ
					</div>

					<!-- Pagination -->
					<div v-if="pagination && pagination.totalPages > 1">
						<UPagination
							v-model:page="currentPage"
							color="neutral"
							active-color="neutral"
							:total="pagination.total"
							:items-per-page="pagination.limit"
						/>
					</div>
				</div>

				<!-- Table with loading state -->
				<div class="relative">
					<UTable
						:columns="columns"
						:data="users"
						:ui="{ th: 'truncate' }"
						:loading="pending"
					>
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
							<div class="text-center text-muted-foreground">
								ไม่พบผู้ใช้งาน
							</div>
						</template>
					</UTable>
				</div>

				<!-- Pagination -->
				<div
					v-if="pagination && pagination.totalPages > 1"
					class="flex items-center justify-center sm:justify-end p-4 border-t"
				>
					<UPagination
						v-model:page="currentPage"
						color="neutral"
						active-color="neutral"
						:total="pagination.total"
						:items-per-page="pagination.limit"
					/>
				</div>
			</div>
		</main>
	</div>
</template>
