<script setup lang="ts">
import { LazyDeleteServiceModel, LazyUpdateServiceModal } from '#components';
import type { DropdownMenuItem } from '@nuxt/ui';
import {
  moveArrayElement,
  useSortable,
} from '@vueuse/integrations/useSortable';

const toast = useToast();

const userSession = useUserSession();

const { data } = await useAsyncData('services', async () => {
  const result = await useRequestFetch()('/api/services');

  const equipmentStatistics = await useRequestFetch()(
    '/api/statistics/equipments'
  );

  const data = result.data.map((service) => {
    if (equipmentStatistics) {
      const equipmentData = equipmentStatistics.find((item) =>
        service.name.startsWith(item.region)
      );
      return {
        ...service,
        equipment: equipmentData || null,
      };
    }
    return service;
  });

  return data;
});

const services = ref(data.value ?? []);

const overlay = useOverlay();
const updateModel = overlay.create(LazyUpdateServiceModal);
const deleteModal = overlay.create(LazyDeleteServiceModel);

/**
 * This considered that user is an admin.
 */
function createDropdownItems(
  service: (typeof services.value)[number]
): DropdownMenuItem[][] {
  const items: DropdownMenuItem[][] = [];

  const constructiveSection: DropdownMenuItem[] = [];
  // Update logic
  if (!service.deletedAt) {
    constructiveSection.push({
      label: 'แก้ไข',
      icon: 'lucide:pencil',
      onSelect: async () => {
        updateModel.open({
          data: service,
        });
      },
    });
  }
  if (constructiveSection.length > 0) {
    items.push(constructiveSection);
  }

  const destructiveSection: DropdownMenuItem[] = [];
  // Hard delete logic
  if (service.deletedAt) {
    destructiveSection.push({
      label: 'ลบถาวร',
      icon: 'lucide:trash-2',
      color: 'error',
      onSelect: () => {
        deleteModal.open({
          data: service,
        });
      },
    });
  }
  // Soft delete logic
  else {
    destructiveSection.push({
      label: 'ลบ',
      icon: 'lucide:trash',
      color: 'error',
      onSelect: () => {
        deleteModal.open({
          data: service,
        });
      },
    });
  }
  // Restore logic
  if (service.deletedAt) {
    items.push([
      {
        label: 'กู้คืน',
        icon: 'lucide:rotate-ccw',
        onSelect: async () => {
          await $fetch(`/api/services/${service.id}/restore`, {
            method: 'POST',
          });
          await refreshNuxtData('services');
          toast.add({
            title: 'บริการถูกกู้คืน',
            color: 'success',
          });
        },
      },
    ]);
  }
  if (destructiveSection.length > 0) {
    items.push(destructiveSection);
  }

  return items;
}

const list = ref<HTMLElement | null>(null);

useSortable(list, services, {
  handle: '.grip',
  animation: 200,
  onUpdate: (event: unknown) => {
    const { oldIndex, newIndex } = event as {
      oldIndex: number;
      newIndex: number;
    };
    moveArrayElement(services, oldIndex, newIndex, event);

    nextTick(handleReorder);
  },
});

const isReordering = ref(false);
const isReorderVisible = computed(() => {
  return userSession.user.value?.isAdmin;
});
const allowedReorder = computed(() => {
  return isReorderVisible.value && !isReordering.value;
});

function handleReorder() {
  if (isReordering.value) return;
  isReordering.value = true;

  const body = {
    ids: services.value?.map((service) => service.id),
  };

  // setTimeout(() => {
  // 	isReordering.value = false;
  // }, 1000);

  $fetch('/api/services/reorder', {
    method: 'PUT',
    body,
  })
    .then(async () => {
      isReordering.value = false;
      await refreshNuxtData('services');
      services.value = data.value ?? [];
    })
    .catch(() => {
      isReordering.value = false;
    });
}

const equipmentColor = (n: number) => {
  if (n >= 80) {
    return 'text-emerald-500 dark:text-emerald-400';
  } else if (n >= 50) {
    return 'text-orange-500 dark:text-orange-400';
  } else {
    return 'text-red-500 dark:text-red-400';
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto divide-y">
    <header class="flex items-center justify-between h-16 px-4">
      <div class="flex items-center gap-2">
        <UIcon class="w-5 h-5" name="lucide:server" />
        <h1 class="font-semibold">บริการ</h1>
      </div>
      <UButton
        v-if="userSession.user.value?.isAdmin"
        class="px-1.5 sm:px-2.5"
        icon="lucide:plus"
        to="/services/create"
      >
        <span class="hidden sm:inline"> เพิ่มบริการ </span>
      </UButton>
    </header>
    <div class="p-4">
      <template v-if="services">
        <template v-if="services.length > 0">
          <ul ref="list" class="space-y-4">
            <template v-for="service in services" :key="service.id">
              <li>
                <div
                  class="flex sm:items-center min-h-12 px-2.5 py-1.5 gap-4 bg-default border border-default rounded text-sm"
                >
                  <div
                    v-if="isReorderVisible"
                    class="flex items-center me-2 border-e"
                  >
                    <UIcon
                      :class="[
                        'grip me-2',
                        allowedReorder ? 'cursor-move' : 'cursor-not-allowed',
                      ]"
                      name="lucide:grip-vertical"
                    />
                  </div>

                  <div class="flex flex-1 flex-col sm:flex-row sm:items-center">
                    <NuxtLink
                      class="flex items-center min-h-9"
                      :to="
                        service.urlType === 'external'
                          ? `${service.url}`
                          : `/services/embed/${service.id}`
                      "
                      target="_blank"
                      :external="service.urlType === 'external'"
                    >
                      <UIcon class="me-2" name="lucide:server" />
                      <h2
                        :class="[
                          'font-medium',
                          service.deletedAt ? 'line-through text-muted' : '',
                        ]"
                      >
                        {{ service.name }}
                      </h2>
                      <UIcon
                        v-if="service.urlType === 'external'"
                        class="ms-1"
                        name="lucide:external-link"
                      />
                    </NuxtLink>

                    <!-- @vue-ignore -->
                    <div
                      v-if="service.equipment"
                      class="flex flex-col sm:flex-row sm:items-center sm:ms-auto gap-2 sm:gap-4 font-medium text-xs tracking-tighter"
                    >
                      <!-- @vue-ignore -->
                      <div
                        :class="[
                          'w-20',
                          equipmentColor(service.equipment.frtu.percentage),
                        ]"
                      >
                        FRTU:
                        <!-- @vue-ignore -->
                        {{
                          Number(service.equipment.frtu.percentage).toFixed(2)
                        }}%
                      </div>
                      <!-- @vue-ignore -->
                      <div
                        :class="[
                          'w-20',
                          equipmentColor(service.equipment.sub.percentage),
                        ]"
                      >
                        SUB:
                        <!-- @vue-ignore -->
                        {{
                          Number(service.equipment.sub.percentage).toFixed(2)
                        }}%
                      </div>
                      <!-- @vue-ignore -->
                      <div
                        :class="[
                          'w-20',
                          equipmentColor(service.equipment.vsp.percentage),
                        ]"
                      >
                        VSP:
                        <!-- @vue-ignore -->
                        {{
                          Number(service.equipment.vsp.percentage).toFixed(2)
                        }}%
                      </div>
                    </div>
                  </div>

                  <UDropdownMenu
                    v-if="userSession.user.value?.isAdmin"
                    :items="createDropdownItems(service)"
                    size="sm"
                  >
                    <UButton
                      class="ms-auto"
                      icon="lucide:ellipsis-vertical"
                      size="sm"
                      variant="ghost"
                    />
                  </UDropdownMenu>
                </div>
              </li>
            </template>
          </ul>
        </template>
        <template v-else>
          <p class="text-muted">ไม่มีบริการ</p>
        </template>
      </template>
      <template v-else>
        <ul class="space-y-4">
          <template v-for="index in 5" :key="index">
            <li><USkeleton class="w-full h-12" /></li>
          </template>
        </ul>
      </template>
    </div>
  </div>
</template>
