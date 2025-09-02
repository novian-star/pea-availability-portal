<template>
	<div
		class="flex flex-col items-center min-h-[calc(100dvh-8rem)] p-4 pb-8 gap-8"
	>
		<img
			class="max-w-3xl w-full h-auto rounded shadow aspect-auto"
			src="/images/landing.png"
			alt="Landing Image"
		/>
		<div class="flex flex-col items-center gap-y-4">
			<UButton icon="lucide:server" to="/services"> ไปหน้าบริการ </UButton>
			<p class="max-w-xl text-center text-sm text-error">
				!!ปัจจุบันมี Workshop แก้ไข Database Naming Standard ตามมาตรฐานของ ศปฟ.
				<br />ทำให้ข้อมูลที่แสดงผลอาจไม่สมบูรณ์ ปัจจุบันอยู่ระหว่างปรับปรุง
				<br />ขออภัยในความไม่สะดวกครับ
			</p>
		</div>

		<ClientOnly>
			<div class="max-w-3xl w-full">
				<AvailabilityStatisticChart />
			</div>
			<template #fallback>
				<UIcon
					class="w-10 h-10 text-dimmed animate-spin"
					name="lucide:loader-circle"
				/>
			</template>
		</ClientOnly>
	</div>
</template>
