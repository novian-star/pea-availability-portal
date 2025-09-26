<script setup lang="ts">
import type { TableColumn } from '#ui/types';

definePageMeta({
	middleware: ['require-admin'],
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(100);

const { data: logsResponse, pending } = await useAsyncData(
	'logs',
	async () => {
		const result = await useRequestFetch()('/api/logs', {
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

const logs = computed(() => logsResponse.value?.data || []);
const pagination = computed(() => logsResponse.value?.pagination);

const columns: TableColumn<NonNullable<typeof logs.value>[number]>[] = [
	{
		accessorKey: 'user',
		accessorFn: (row) => `${row.user?.name} (${row.user?.employeeId})`,
		header: 'ผู้ใช้',
	},
	{
		accessorKey: 'department',
		accessorFn: (row) => `${row.user?.department}`,
		header: 'สังกัด',
	},
	{
		accessorKey: 'position',
		accessorFn: (row) => `${row.user?.position}`,
		header: 'ตำแหน่ง',
	},
	{
		accessorKey: 'action',
		header: 'กระบวนการ',
	},
	{
		accessorKey: 'createdAt',
		accessorFn: (row) => new Date(row.timestamp).toLocaleString('th-TH'),
		header: 'วันที่',
	},
];

async function handleDownload() {
	const data = await $fetch('/api/logs/export', {
		responseType: 'blob',
	});
	const eleLink = document.createElement('a');
	eleLink.download = 'logs.csv';
	eleLink.style.display = 'none';
	const blob = data as Blob;
	eleLink.href = URL.createObjectURL(blob);
	document.body.appendChild(eleLink);
	eleLink.click();
	URL.revokeObjectURL(eleLink.href);
	document.body.removeChild(eleLink);
}
</script>

<template>
	<div class="divide-y">
		<header class="flex items-center h-16 px-4 gap-2">
			<UIcon class="w-5 h-5" name="lucide:logs" />
			<h1>บันทึกการใช้งาน</h1>
			<UTooltip text="ดาวน์โหลดบันทึกการใช้งาน">
				<UButton
					class="ms-auto"
					icon="lucide:download"
					variant="ghost"
					@click="handleDownload"
				/>
			</UTooltip>
		</header>
		<main>
			<div>
				<!-- Page size selector and stats -->
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
						:data="logs"
						:ui="{ th: 'truncate' }"
						:loading="pending"
					>
						<template #empty>
							<div class="text-center text-muted-foreground">
								ไม่พบบันทึกการใช้งาน
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
