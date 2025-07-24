<script setup lang="ts">
import type { TableColumn } from '#ui/types';

definePageMeta({
	middleware: ['require-admin'],
});

const { data: logs } = await useAsyncData('logs', async () => {
	const result = await useRequestFetch()('/api/logs');

	return result.data;
});

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
				<UTable :columns="columns" :data="logs" :ui="{ th: 'truncate' }">
					<template #empty>
						<div class="text-center text-muted-foreground">
							ไม่พบบันทึกการใช้งาน
						</div>
					</template>
				</UTable>
			</div>
		</main>
	</div>
</template>
