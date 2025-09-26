<script setup lang="ts">
const toast = useToast();

const regions = [
	{ value: 'C1', label: 'ภาคกลาง 1' },
	{ value: 'C2', label: 'ภาคกลาง 2' },
	{ value: 'C3', label: 'ภาคกลาง 3' },
	{ value: 'N1', label: 'ภาคเหนือ 1' },
	{ value: 'N2', label: 'ภาคเหนือ 2' },
	{ value: 'N3', label: 'ภาคเหนือ 3' },
	{ value: 'NE1', label: 'ภาคตะวันออกเฉียงเหนือ 1' },
	{ value: 'NE2', label: 'ภาคตะวันออกเฉียงเหนือ 2' },
	{ value: 'NE3', label: 'ภาคตะวันออกเฉียงเหนือ 3' },
	{ value: 'S1', label: 'ภาคใต้ 1' },
	{ value: 'S2', label: 'ภาคใต้ 2' },
	{ value: 'S3', label: 'ภาคใต้ 3' },
];

const types = [
	{ value: 'frtu', label: 'FRTU', description: 'ข้อมูลอุปกรณ์ FRTU' },
	{ value: 'substation', label: 'Substation', description: 'ข้อมูลสถานีไฟฟ้า' },
];

const form = ref({
	region: '',
	type: '',
});

const isDownloading = ref(false);

async function handleDownload() {
	if (!form.value.region || !form.value.type) {
		toast.add({
			title: 'กรุณาเลือกข้อมูล',
			description: 'กรุณาเลือกภูมิภาคและประเภทข้อมูลที่ต้องการดาวน์โหลด',
			color: 'error',
		});
		return;
	}

	isDownloading.value = true;

	try {
		const url = `/api/services/download?region=${form.value.region}&type=${form.value.type}`;

		// Create a temporary link element to trigger download
		const link = document.createElement('a');
		link.href = url;
		link.download = ''; // Let the server decide the filename
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.add({
			title: 'เริ่มดาวน์โหลด',
			description: 'กำลังดาวน์โหลดไฟล์ข้อมูลของคุณ',
		});
	} catch (error) {
		console.error('Download error:', error);
		toast.add({
			title: 'เกิดข้อผิดพลาด',
			description: 'ไม่สามารถดาวน์โหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
			color: 'error',
		});
	} finally {
		isDownloading.value = false;
	}
}

function clearForm() {
	form.value.region = '';
	form.value.type = '';
}

const selectedRegionLabel = computed(() => {
	const region = regions.find((r) => r.value === form.value.region);
	return region ? region.label : '';
});

const selectedTypeLabel = computed(() => {
	const type = types.find((t) => t.value === form.value.type);
	return type ? type.label : '';
});
</script>

<template>
	<div class="max-w-2xl mx-auto">
		<header class="flex items-center justify-between h-16 px-4 border-b">
			<div class="flex items-center gap-2">
				<UIcon class="w-5 h-5" name="lucide:download" />
				<h1 class="font-semibold">ดาวน์โหลดข้อมูล</h1>
			</div>
		</header>

		<div class="p-4 space-y-6">
			<!-- Description -->
			<div
				class="p-4 bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 rounded-lg"
			>
				<div class="flex items-start gap-3">
					<UIcon class="w-5 h-5 text-primary-500 mt-0.5" name="lucide:info" />
					<div>
						<h3 class="font-medium text-primary-900 dark:text-primary-100 mb-1">
							เกี่ยวกับการดาวน์โหลด
						</h3>
						<p class="text-sm text-primary-700 dark:text-primary-300">
							ดาวน์โหลดข้อมูลสถานะอุปกรณ์ในรูปแบบ Excel (.xlsx)
							สามารถเลือกภูมิภาคและประเภทข้อมูลที่ต้องการได้
						</p>
					</div>
				</div>
			</div>

			<!-- Download Form -->
			<UCard>
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon class="w-4 h-4" name="lucide:settings" />
						<h2 class="font-medium">เลือกข้อมูลที่ต้องการดาวน์โหลด</h2>
					</div>
				</template>

				<form class="space-y-6" @submit.prevent="handleDownload">
					<div class="flex items-center gap-2 *:flex-1">
						<!-- Region Selection -->
						<UFormField label="ภูมิภาค" required>
							<USelect
								v-model="form.region"
								class="w-full"
								:items="regions"
								placeholder="เลือกภูมิภาค"
								value-key="value"
								:disabled="isDownloading"
							/>
						</UFormField>

						<!-- Type Selection -->
						<UFormField label="ประเภทข้อมูล" required>
							<USelect
								v-model="form.type"
								class="w-full"
								:items="types"
								placeholder="เลือกประเภทข้อมูล"
								value-key="value"
								:disabled="isDownloading"
							/>
						</UFormField>
					</div>

					<!-- Preview Selection -->
					<div
						v-if="form.region && form.type"
						class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
					>
						<h3 class="text-sm font-medium mb-2 flex items-center gap-2">
							<UIcon class="w-4 h-4" name="lucide:eye" />
							ตัวอย่างข้อมูลที่จะดาวน์โหลด
						</h3>
						<div class="text-sm text-gray-600 dark:text-gray-400">
							<div>
								ภูมิภาค:
								<span class="font-medium">{{ selectedRegionLabel }}</span>
							</div>
							<div>
								ประเภท: <span class="font-medium">{{ selectedTypeLabel }}</span>
							</div>
							<div>
								รูปแบบไฟล์: <span class="font-medium">Excel (.xlsx)</span>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex flex-row-reverse gap-2">
						<UButton
							type="submit"
							:loading="isDownloading"
							:disabled="!form.region || !form.type"
							icon="lucide:download"
							size="lg"
							class="flex-1 sm:flex-none"
						>
							{{ isDownloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด' }}
						</UButton>

						<UButton
							type="button"
							variant="outline"
							:disabled="isDownloading"
							icon="lucide:x"
							size="lg"
							@click="clearForm"
						>
							ล้าง
						</UButton>
					</div>
				</form>
			</UCard>

			<!-- Additional Information -->
			<UCard>
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon class="w-4 h-4" name="lucide:help-circle" />
						<h2 class="font-medium">ข้อมูลเพิ่มเติม</h2>
					</div>
				</template>

				<div class="space-y-4 text-sm">
					<div>
						<h3 class="font-medium mb-2">ข้อมูลที่รวมอยู่ในไฟล์:</h3>
						<ul class="space-y-1 text-gray-600 dark:text-gray-400">
							<li class="flex items-center gap-2">
								<UIcon class="w-3 h-3" name="lucide:check" />
								Site ID - รหัสสถานที่
							</li>
							<li class="flex items-center gap-2">
								<UIcon class="w-3 h-3" name="lucide:check" />
								รหัสสั่งการ / สถานีไฟฟ้า
							</li>
							<li class="flex items-center gap-2">
								<UIcon class="w-3 h-3" name="lucide:check" />
								State SCADA - สถานะระบบ
							</li>
							<li class="flex items-center gap-2">
								<UIcon class="w-3 h-3" name="lucide:check" />
								ระยะเวลา Down ครั้งล่าสุด
							</li>
							<li class="flex items-center gap-2">
								<UIcon class="w-3 h-3" name="lucide:check" />
								ข้อมูล ณ วันที่-เวลา
							</li>
						</ul>
					</div>

					<div>
						<h3 class="font-medium mb-2">หมายเหตุ:</h3>
						<ul class="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
							<li>• ไฟล์จะถูกสร้างขึ้นใหม่ทุกครั้งที่ดาวน์โหลด</li>
							<li>• ข้อมูลมาจาก Google Sheets โดยตรง</li>
							<li>• รองรับการเปิดใน Microsoft Excel และโปรแกรมอื่นๆ</li>
						</ul>
					</div>
				</div>
			</UCard>
		</div>
	</div>
</template>
