<script setup lang="ts">
const emit = defineEmits<{
	close: [];
}>();

const { items } = useNavigation();

const route = useRoute();
watch(
	() => route.path,
	() => emit('close')
);
</script>

<template>
	<USlideover side="left" :ui="{ content: 'flex flex-col w-80 border-e' }">
		<template #content>
			<header class="flex items-center justify-between h-16 px-4">
				<UButton icon="lucide:menu" variant="ghost" />
				<UButton icon="lucide:x" variant="ghost" @click="emit('close')" />
			</header>
			<div class="flex-1 p-4">
				<UNavigationMenu
					:items="items"
					orientation="vertical"
					:ui="{ root: 'gap-4', list: 'space-y-2' }"
				/>
			</div>
			<footer
				class="flex items-center justify-between h-16 px-4 text-sm text-muted"
			>
				<p>พัฒนาโดย ผจศ.กปบ.(น3)</p>
				<p>Version 5.1.0</p>
			</footer>
		</template>
	</USlideover>
</template>
