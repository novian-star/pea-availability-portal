<template>
  <div class="falling-snow-container">
    <div
      v-for="flake in visibleSnowflakes"
      :key="flake.id"
      class="snowflake"
      :style="{
        left: flake.x + '%',
        animationDuration: flake.duration + 's',
        animationDelay: flake.delay + 's',
        fontSize: flake.size + 'px',
        opacity: flake.opacity,
      }"
    >
      {{ flake.character }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Snowflake {
  id: number;
  x: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  character: string;
}

const { snowIntensity } = useNewYearTheme();
const snowflakes = ref<Snowflake[]>([]);
const snowCharacters = ['❄', '❅', '❆', '⋆', '✦', '✧'];

const createSnowflake = (id: number): Snowflake => ({
  id,
  x: Math.random() * 100,
  duration: Math.random() * 4 + 4, // 4-8 seconds
  delay: Math.random() * 5, // 0-5 seconds delay
  size: Math.random() * 8 + 12, // 12-20px
  opacity: Math.random() * 0.3 + 0.2, // 0.2-0.5
  character: snowCharacters[Math.floor(Math.random() * snowCharacters.length)]!,
});

const getSnowflakeCount = (intensity: string): number => {
  switch (intensity) {
    case 'heavy':
      return 80;
    case 'moderate':
      return 50;
    case 'light':
      return 25;
    default:
      return 0;
  }
};

const visibleSnowflakes = computed(() => {
  const count = getSnowflakeCount(snowIntensity.value);
  return snowflakes.value.slice(0, count);
});

const initializeSnow = () => {
  const maxFlakes = 80; // Maximum possible snowflakes
  snowflakes.value = Array.from({ length: maxFlakes }, (_, i) =>
    createSnowflake(i),
  );
};

onMounted(() => {
  initializeSnow();
});
</script>

<style scoped>
.falling-snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  color: #fff;
  user-select: none;
  pointer-events: none;
  animation: fall linear infinite;
  text-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
  }
  100% {
    transform: translateY(calc(100vh + 20px)) rotate(360deg);
  }
}

/* Add some gentle swaying motion */
.snowflake:nth-child(odd) {
  animation-name: fall-sway-left;
}

.snowflake:nth-child(even) {
  animation-name: fall-sway-right;
}

@keyframes fall-sway-left {
  0% {
    transform: translateY(-20px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(25vh) translateX(-15px) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(0px) rotate(180deg);
  }
  75% {
    transform: translateY(75vh) translateX(-10px) rotate(270deg);
  }
  100% {
    transform: translateY(calc(100vh + 20px)) translateX(0px) rotate(360deg);
  }
}

@keyframes fall-sway-right {
  0% {
    transform: translateY(-20px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(25vh) translateX(15px) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(0px) rotate(180deg);
  }
  75% {
    transform: translateY(75vh) translateX(10px) rotate(270deg);
  }
  100% {
    transform: translateY(calc(100vh + 20px)) translateX(0px) rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .snowflake {
    font-size: 14px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .snowflake {
    animation-duration: 8s !important;
  }
}
</style>
