<script setup lang="ts">
	const model = defineModel<{
		name: string;
		url: string;
	}>({
		default: () => ({
			name: '',
			url: '',
		}),
	});
</script>

<template>
	<div class="space-y-2">
		<UFormField label="ชื่อบริการ" name="name">
			<UInput v-model="model.name" placeholder="Service 1" />
		</UFormField>
		<UFormField label="URL" name="url">
			<UInput v-model="model.url" placeholder="https://example.com" />
		</UFormField>
	</div>
</template>
