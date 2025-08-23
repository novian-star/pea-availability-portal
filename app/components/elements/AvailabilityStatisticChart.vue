<script setup lang="ts">
import { GroupedBar } from '@unovis/ts';
import {
  VisGroupedBar,
  VisXYContainer,
  VisAxis,
  VisTooltip,
} from '@unovis/vue';

type Statistic = NonNullable<typeof statistics.value>[number];

const { data: statistics } = await useAsyncData(async () => {
  const requestFetch = useRequestFetch();

  const statistics = await requestFetch('/api/statistics');

  const orders = ['C', 'N', 'NE', 'S'];
  return statistics.sort((a, b) => {
    const getOrderIndex = (region: string) => {
      const match = region.match(/^([A-Z]+)(\d*)$/);
      if (!match) return Number.MAX_SAFE_INTEGER;
      const [_, prefix, num] = match;
      const orderIdx = orders.indexOf(prefix!);
      const numIdx = num ? parseInt(num, 10) : 0;
      return orderIdx * 1000 + numIdx;
    };
    return getOrderIndex(a.region) - getOrderIndex(b.region);
  });
});

const x = (d: Statistic, index: number) => index;
const y = (d: Statistic) => d.percentage;
const tickFormat = (tick: number, index: number) =>
  statistics.value?.[index]?.region || '';
const color = (d: Statistic) => {
  const colorMode = useColorMode();

  if (d.percentage >= 80) {
    return {
      css: 'text-emerald-500 dark:text-emerald-400',
      hue: colorMode.value === 'dark' ? '#10b981' : '#34d399',
    }; // Emerald
  } else if (d.percentage >= 50) {
    return {
      css: 'text-orange-500 dark:text-orange-400',
      hue: colorMode.value === 'dark' ? '#f97316' : '#fb923c',
    }; // Orange
  } else {
    return {
      css: 'text-red-500 dark:text-red-400',
      hue: colorMode.value === 'dark' ? '#ef4444' : '#f87171',
    }; // Red
  }
};
const triggers = {
  [GroupedBar.selectors.bar]: (d: Statistic) => `
    <span>${d.region}: ${d.percentage}%</span>
  `,
};
</script>

<template>
  <div class="flex flex-col items-center w-full gap-4">
    <h2 class="font-semibold">AVA Ranking Realtime: FRTU</h2>
    <div class="grid grid-cols-6 gap-4 text-sm">
      <div
        v-for="statistic in statistics"
        :key="statistic.region"
        :class="[color(statistic).css, 'font-mono']"
      >
        {{ statistic.region }}: {{ Number(statistic.percentage).toFixed(2) }}%
      </div>
    </div>
    <template v-if="statistics">
      <VisXYContainer class="w-full">
        <VisGroupedBar
          :color="(d: Statistic) => color(d).hue"
          :data="statistics"
          :x="x"
          :y="y"
          :group-padding="0.25"
        />
        <VisAxis
          type="x"
          label="Region"
          :tick-format="tickFormat"
          :num-ticks="statistics?.length"
        />
        <VisAxis type="y" label="Availability (%)" />
        <VisTooltip :triggers="triggers" />
      </VisXYContainer>
    </template>
    <div class="self-stretch text-sm">
      <ul class="flex justify-between w-full">
        <li>
          <div class="inline-flex items-center gap-1 text-muted">
            <div
              class="inline-block w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full"
            />
            <span>สีเขียว : เปอร์เซนต์ 80% ขึ้นไป</span>
          </div>
        </li>
        <li>
          <div class="inline-flex items-center gap-1 text-muted">
            <div
              class="inline-block w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full"
            />
            <span>สีส้ม : เปอร์เซนต์ 50% - 80%</span>
          </div>
        </li>
        <li>
          <div class="inline-flex items-center gap-1 text-muted">
            <div
              class="inline-block w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"
            />
            <span>สีแดง : เปอร์เซนต์ ต่ำกว่า 50%</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
