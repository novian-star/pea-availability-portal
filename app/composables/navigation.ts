import type { NavigationMenuItem } from '#ui/types';

export function useNavigation() {
	const userSession = useUserSession();

	const items = computed<NavigationMenuItem[][]>(() => {
		const items: NavigationMenuItem[][] = [
			[
				{
					label: 'หน้าหลัก',
					icon: 'lucide:house',
					to: '/',
				},
				{
					label: 'บริการ',
					icon: 'lucide:server',
					to: '/services',
				},
				{
					label: 'AI Assistant (Demo)',
					icon: 'lucide:bot-message-square',
					to: '/ai',
				},
			],
		];

		if (userSession.user.value?.isAdmin) {
			items.push([
				{
					label: 'ผู้ใช้งาน',
					icon: 'lucide:users',
					to: '/users',
				},
				{
					label: 'บันทึกการใช้งาน',
					icon: 'lucide:logs',
					to: '/logs',
				},
			]);
		}

		return items;
	});

	return {
		items,
	};
}
