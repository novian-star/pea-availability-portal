<script setup lang="ts">
definePageMeta({
	layout: false,

	middleware: () => {
		const userSession = useUserSession();
		if (userSession.loggedIn.value) {
			return navigateTo('/');
		}
	},
});
</script>

<template>
	<div class="flex flex-col items-center h-dvh px-4 py-8 gap-8">
		<img
			class="max-w-xl w-full h-auto rounded shadow aspect-auto"
			src="/images/landing.png"
			alt="Landing Image"
		/>

		<div>
			<UButton icon="lucide:key" size="lg" external to="/auth/login">
				ลงชื่อเข้าใช้
			</UButton>
		</div>
	</div>
</template>
