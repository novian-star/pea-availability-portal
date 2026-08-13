import type { NavigationMenuItem } from '#ui/types';

export function useNavigation() {
  const config = useRuntimeConfig();

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
        {
          label: 'Database Services',
          icon: 'lucide:database',
          to: '/databases',
        },
      ],
    ];

    // Check and set SCADA Insight AI URL
    if (config.public?.scadaInsightAiUrl) {
      try {
        const url = new URL(config.public.scadaInsightAiUrl);

        items.push([
          {
            label: 'SCADA Insight AI',
            icon: 'lucide:astroid',
            external: true,
            target: '_blank',
            to: url.toString(),
          },
        ]);
      } catch {
        // Pass
      }
    }

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
        {
          label: 'จัดการประกาศ',
          icon: 'lucide:bell',
          to: '/admin/notice',
        },
      ]);
    }

    return items;
  });

  return {
    items,
  };
}
