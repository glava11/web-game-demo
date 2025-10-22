<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { playCountdownBeep, playCountdownGo } from '../utils/sounds'

const emit = defineEmits<{
  complete: []
}>()

const currentNumber = ref<number | string>(3)
const show = ref(true)
const timeouts: number[] = []

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  // Clear any pending timeouts
  timeouts.forEach((to) => clearTimeout(to))
  timeouts.length = 0
})

function startCountdown() {
  // 3
  currentNumber.value = 3
  playCountdownBeep()

  timeouts.push(window.setTimeout(() => {
    // 2
    currentNumber.value = 2
    playCountdownBeep()

    timeouts.push(window.setTimeout(() => {
      // 1
      currentNumber.value = 1
      playCountdownBeep()

      timeouts.push(window.setTimeout(() => {
        // GO!
        currentNumber.value = 'GO!'
        playCountdownGo()

        timeouts.push(window.setTimeout(() => {
          show.value = false
          emit('complete')
        }, 350))
      }, 700))
    }, 700))
  }, 700))
}
</script>

<template>
  <div v-if="show"
       class="countdown-overlay">
    <div class="countdown-number press-start-2p"
         :class="currentNumber === 'GO!' ? 'go-burst' : ''"
         :key="currentNumber">
      {{ currentNumber }}
    </div>
  </div>
</template>

<style scoped>
.countdown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.countdown-number {
  font-size: 10rem;
  font-weight: 900;
  color: var(--color-gold);
  text-shadow: 0 0 40px var(--color-bronze),
    0 0 80px var(--color-bronze);
  animation: countdownZoom 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.go-burst {
  animation: burstExpand 0.35s ease-out;
}

@keyframes burstExpand {
  from {
    transform: scale(0);
    opacity: 1;
  }

  to {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes countdownZoom {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(2.5);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .countdown-number {
    font-size: 6rem;
  }
}
</style>
