<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import VueMarkdown from 'vue-markdown-render';

useHead({
	title: 'AI Agent',
});

/* ========================================================================== */
/*                                  Constants                                 */
/* ========================================================================== */

interface ChatHistory {
	ask: string;
	answer: string;
	region: string;
	type: string;
	timestamp: Date;
}

interface ChatState {
	prompt: string;
	region: string;
	type: string;
}

/* ========================================================================== */
/*                                  Constants                                 */
/* ========================================================================== */

const MAX_HISTORY_LENGTH = 10;
const STORAGE_KEY = 'ai-history';

const REGIONS = [
	[
		{ label: 'กฟก.1', value: 'C1' },
		{ label: 'กฟก.2', value: 'C2' },
		{ label: 'กฟก.3', value: 'C3' },
	],
	[
		{ label: 'กฟน.1', value: 'N1' },
		{ label: 'กฟน.2', value: 'N2' },
		{ label: 'กฟน.3', value: 'N3' },
	],
	[
		{ label: 'กฟฉ.1', value: 'NE1' },
		{ label: 'กฟฉ.2', value: 'NE2' },
		{ label: 'กฟฉ.3', value: 'NE3' },
	],
	[
		{ label: 'กฟต.1', value: 'S1' },
		{ label: 'กฟต.2', value: 'S2' },
		{ label: 'กฟต.3', value: 'S3' },
	],
] satisfies SelectMenuItem[][];

const DATA_TYPES: SelectMenuItem[] = [
	{ label: 'FRTU', value: 'frtu' },
	{ label: 'Substation', value: 'substation' },
];

/* ========================================================================== */
/*                                 Composables                                */
/* ========================================================================== */

const toast = useToast();

const history = ref<ChatHistory[]>([]);
const historyContainer = useTemplateRef('history-container');
const isLoading = ref(false);

const state = reactive<ChatState>({
	prompt: '',
	region: '',
	type: '',
});

/* ========================================================================== */
/*                                  Computed                                  */
/* ========================================================================== */

const isDisabled = computed(() => {
	return (
		!state.prompt.trim() || !state.region || !state.type || isLoading.value
	);
});

const hasHistory = computed(() => history.value.length > 0);

/* ========================================================================== */
/*                                   Methods                                  */
/* ========================================================================== */

function addToHistory(item: Omit<ChatHistory, 'timestamp'>) {
	const newItem: ChatHistory = {
		...item,
		timestamp: new Date(),
	};

	history.value.push(newItem);

	// Keep only the last N items
	if (history.value.length > MAX_HISTORY_LENGTH) {
		history.value.splice(0, history.value.length - MAX_HISTORY_LENGTH);
	}

	// Save to localStorage
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
}

function clearHistory() {
	history.value = [];
	localStorage.removeItem(STORAGE_KEY);
}

function resetForm() {
	state.prompt = '';
}

async function handleSubmit() {
	if (isDisabled.value) return;

	const { prompt, region, type } = state;

	try {
		isLoading.value = true;

		const response = await $fetch('/api/ai', {
			method: 'POST',
			body: { prompt: prompt.trim(), region, type },
		});

		addToHistory({
			ask: prompt.trim(),
			answer: response.data!,
			region,
			type,
		});

		resetForm();

		// Scroll to bottom
		await nextTick();

		if (historyContainer.value) {
			historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
		}
	} catch (error) {
		console.error('Failed to get AI response:', error);

		toast.add({
			title: 'ไม่สามารถติดต่อข้อมูลกับ AI ได้',
			color: 'error',
		});
	} finally {
		isLoading.value = false;
	}
}

function getRegionLabel(value: string) {
	return (
		REGIONS.flat().find((region) => region?.value === value)?.label || value
	);
}

onMounted(() => {
	// Load history from localStorage
	const savedHistory = localStorage.getItem(STORAGE_KEY);
	if (savedHistory) {
		try {
			const json = JSON.parse(savedHistory);
			if (Array.isArray(json)) {
				history.value = json;
			}
		} catch (error) {
			console.error('Failed to parse saved history:', error);
		}
	}
});
</script>

<template>
	<div class="flex flex-col h-[calc(100vh-64px)]">
		<!-- Header -->
		<header class="p-4 border-b">
			<div class="flex items-center justify-between w-full max-w-3xl mx-auto">
				<div class="flex items-center gap-2">
					<UIcon class="w-5 h-5" name="lucide:bot-message-square" />
					<h1 class="font-semibold">AI Agent (Demo)</h1>
				</div>

				<UButton
					v-if="hasHistory"
					icon="lucide:trash-2"
					variant="ghost"
					@click="clearHistory"
				>
					ล้างประวัติ
				</UButton>
			</div>
		</header>

		<main class="flex flex-1 flex-col overflow-hidden">
			<!-- Chat history -->
			<div
				ref="history-container"
				class="flex-1 overflow-y-auto border-b scroll-smooth"
			>
				<div class="max-w-3xl h-auto mx-auto p-4 space-y-4">
					<template v-if="!hasHistory">
						<div class="flex items-center justify-center h-full text-muted">
							<div class="text-center">
								<UIcon
									class="w-12 h-12 mx-auto mb-2"
									name="lucide:message-circle"
								/>
								<p>เริ่มการสนทนากับ AI Agent</p>
							</div>
						</div>
					</template>

					<template v-for="(item, index) in history" :key="index">
						<!-- User message -->
						<div class="flex justify-end">
							<div
								class="max-w-[80%] p-4 bg-elevated rounded-xl rounded-tr-none"
							>
								<p class="whitespace-pre-wrap">{{ item.ask }}</p>
								<div class="flex items-center gap-2 mt-2 text-xs text-muted">
									<span>เขต: {{ getRegionLabel(item.region) }}</span>
									<span>•</span>
									<span>ชุดข้อมูล: {{ item.type.toUpperCase() }}</span>
								</div>
							</div>
						</div>

						<!-- AI response -->
						<div class="flex justify-start">
							<div
								class="max-w-[80%] p-4 bg-elevated rounded-xl rounded-tl-none"
							>
								<VueMarkdown :source="item.answer" />
							</div>
						</div>
					</template>
				</div>
			</div>

			<!-- Chat input -->
			<div class="p-4">
				<UForm
					class="flex flex-col w-full max-w-3xl mx-auto gap-4"
					:state
					@submit="handleSubmit"
				>
					<!-- Input controls -->
					<div class="flex flex-col gap-4">
						<!-- Region and Type selectors -->
						<div class="flex gap-4">
							<USelect
								v-model="state.region"
								class="flex-1"
								:items="REGIONS"
								placeholder="เลือกเขตการไฟฟ้า"
								size="lg"
								variant="soft"
								value-key="value"
							/>
							<USelect
								v-model="state.type"
								class="flex-1"
								:items="DATA_TYPES"
								placeholder="เลือกประเภทข้อมูล"
								size="lg"
								variant="soft"
								value-key="value"
							/>
						</div>

						<!-- Chat input -->
						<UButtonGroup size="lg">
							<UTextarea
								v-model="state.prompt"
								class="flex-1"
								placeholder="ถาม AI Agent..."
								variant="soft"
								:rows="1"
								autoresize
								size="lg"
								:maxrows="4"
								:ui="{
									base: 'rounded-e-none',
								}"
							/>
							<UButton
								:disabled="isDisabled"
								icon="lucide:send"
								:loading="isLoading"
								variant="soft"
								type="submit"
							/>
						</UButtonGroup>
					</div>
				</UForm>
			</div>
		</main>
	</div>
</template>
