<script setup lang="ts">
import { Scatter } from '@unovis/ts';
import {
  VisAxis,
  VisLine,
  VisScatter,
  VisTooltip,
  VisXYContainer,
} from '@unovis/vue';

type Data = {
  timestamp: string;
  logins: number;
};

const props = defineProps<{
  data: Data[];
}>();

const x = (d: Data) => new Date(d.timestamp).getTime();
const y = (d: Data) => d.logins;
const tickFormat = (time: number) => {
  return new Date(time)?.toLocaleDateString('th-TH', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};
const triggers = {
  [Scatter.selectors.point]: (d: Data) => {
    return `${new Date(d.timestamp).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}: ${d.logins} ครั้ง`;
  },
};
</script>

<template>
  <VisXYContainer :data="props.data">
    <VisLine :x="x" :y="y" />
    <VisScatter :x="x" :y="y" />
    <VisAxis
      type="x"
      label="วันที่"
      :tick-format="tickFormat"
      :num-ticks="Math.min(props.data.length, 12)"
    />
    <VisAxis type="y" label="จำนวนการลงชื่อเข้าใช้งาน" />
    <VisTooltip :triggers="triggers" />
  </VisXYContainer>
</template>
