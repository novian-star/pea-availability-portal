<script setup lang="ts">
import type { SelectItem, TableColumn } from '#ui/types';
import { CalendarDate } from '@internationalized/date';

definePageMeta({
  middleware: ['require-admin'],
});

const toast = useToast();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(100);

// Filter state
const filter = ref('all');

const { data: logsResponse, pending } = await useAsyncData(
  'logs',
  async () => {
    const result = await useRequestFetch()('/api/logs', {
      query: {
        page: currentPage.value,
        limit: pageSize.value,
        filter: filter.value || undefined,
      },
    });
    return result;
  },
  {
    watch: [currentPage, pageSize, filter],
  },
);

const logs = computed(() => logsResponse.value?.data || []);
const pagination = computed(() => logsResponse.value?.pagination);

const filterItems = [
  {
    label: 'ทั้งหมด',
    value: 'all',
  },
  {
    label: 'ลงชื่อเข้าใช้',
    value: 'login',
  },
  {
    label: 'เข้าถึงระบบ',
    value: 'access-service',
  },
  {
    label: 'ดาวน์โหลดข้อมูล',
    value: 'download',
  },
  {
    label: 'อื่น ๆ',
    value: 'other',
  },
] satisfies SelectItem[];

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

const isDownloading = ref(false);

async function handleDownload() {
  isDownloading.value = true;

  try {
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

const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const today = new Date();

const loginStartDate = useTemplateRef('loginStartDate');
const loginEndDate = useTemplateRef('loginEndDate');
const loginStartDateValue = shallowRef(
  new CalendarDate(
    sevenDaysAgo.getFullYear(),
    sevenDaysAgo.getMonth() + 1,
    sevenDaysAgo.getDate(),
  ),
);
const loginEndDateValue = shallowRef(
  new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
);

const { data: loginStats, pending: loginLoading } = useLazyAsyncData(
  'login-stats',
  async () => {
    const result = await useRequestFetch()('/api/logs/login', {
      query: {
        startDate: loginStartDateValue.value.toString(),
        endDate: loginEndDateValue.value.toString(),
      },
    });

    return result.data;
  },
  {
    watch: [loginStartDateValue, loginEndDateValue],
  },
);

function getMaxLoginStartDate() {
  return loginEndDateValue.value.subtract({
    days: 1,
  });
}

function getMinLoginEndDate() {
  return loginStartDateValue.value.add({
    days: 1,
  });
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
          :loading="isDownloading"
          @click="handleDownload"
        />
      </UTooltip>
    </header>
    <main>
      <div>
        <!-- Filter -->
        <div class="flex p-4 gap-4 border-b">
          <UFormField label="ประเภทบันทึก">
            <USelect
              v-model="filter"
              class="w-48"
              :items="filterItems"
              label="กรองบันทึก"
              :disabled="pending"
              :loading="pending"
            />
          </UFormField>
        </div>

        <template v-if="filter === 'login'">
          <div class="grid sm:grid-cols-2 p-4 border-b gap-4">
            <UFormField label="วันเริ่มต้น">
              <UInputDate
                ref="loginStartDate"
                v-model="loginStartDateValue"
                :loading="loginLoading"
                :max-value="getMaxLoginStartDate()"
              >
                <template #trailing>
                  <UPopover :reference="loginStartDate?.inputsRef[3]?.$el">
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-calendar"
                      aria-label="Select a date"
                      class="px-0"
                    />

                    <template #content>
                      <UCalendar
                        v-model="loginStartDateValue"
                        class="p-2"
                        :disabled="loginLoading"
                        :max-value="getMaxLoginStartDate()"
                        prevent-deselect
                      />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>
            <UFormField label="วันสิ้นสุด">
              <UInputDate
                ref="loginEndDate"
                v-model="loginEndDateValue"
                :loading="loginLoading"
                :min-value="getMinLoginEndDate()"
              >
                <template #trailing>
                  <UPopover :reference="loginEndDate?.inputsRef[3]?.$el">
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-calendar"
                      aria-label="Select a date"
                      class="px-0"
                    />

                    <template #content>
                      <UCalendar
                        v-model="loginEndDateValue"
                        class="p-2"
                        :disabled="loginLoading"
                        :min-value="getMinLoginEndDate()"
                        prevent-deselect
                      />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>

            <div class="border p-4 sm:col-span-2">
              <LazyLoginLineChart :data="loginStats || []" />
            </div>
          </div>
        </template>

        <!-- Page size selector and stats -->
        <div
          class="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b"
        >
          <div
            v-if="pagination"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            แสดง {{ (pagination.page - 1) * pagination.limit + 1 }}-{{
              Math.min(pagination.page * pagination.limit, pagination.total)
            }}
            จาก {{ pagination.total }} รายการ
          </div>

          <div v-if="pagination && pagination.totalPages > 1">
            <UPagination
              v-model:page="currentPage"
              color="neutral"
              active-color="neutral"
              :total="pagination.total"
              :items-per-page="pagination.limit"
            />
          </div>
        </div>

        <!-- Table with loading state -->
        <div class="relative">
          <UTable
            :columns="columns"
            :data="logs"
            :ui="{ th: 'truncate' }"
            :loading="pending"
          >
            <template #empty>
              <div class="text-center text-muted-foreground">
                ไม่พบบันทึกการใช้งาน
              </div>
            </template>
          </UTable>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination && pagination.totalPages > 1"
          class="flex items-center justify-center sm:justify-end p-4 border-t"
        >
          <UPagination
            v-model:page="currentPage"
            color="neutral"
            active-color="neutral"
            :total="pagination.total"
            :items-per-page="pagination.limit"
          />
        </div>
      </div>
    </main>
  </div>
</template>
