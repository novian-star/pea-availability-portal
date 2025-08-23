<script setup lang="ts">
import { GroupedBar } from '@unovis/ts';
import {
  VisGroupedBar,
  VisXYContainer,
  VisAxis,
  VisTooltip,
} from '@unovis/vue';

type Statistic = NonNullable<typeof statistics.value>[number];

const colorMode = useColorMode();

const { data: statistics } = await useAsyncData(async () => {
  const requestFetch = useRequestFetch();

  const statistics = await requestFetch('/api/statistics');

  const orders = ['N', 'NE', 'C', 'S'];
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
const color = computed(() => {
  return colorMode.value === 'dark' ? 'white' : 'black';
});
const triggers = {
  [GroupedBar.selectors.bar]: (d: Statistic) => `
    <span>${d.region}: ${d.percentage}%</span>
  `,
};
</script>

<template>
  <h2 class="font-semibold">AVA Ranking Realtime: FRTU</h2>
  <template v-if="statistics">
    <VisXYContainer class="max-w-3xl">
      <VisGroupedBar
        :color="color"
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
</template>
