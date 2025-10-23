<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const memoryUsage = ref(0);
const show = ref(false);
let interval: number | null = null;

// Only show in development
onMounted(() => {
  if (import.meta.env.DEV) {
    show.value = true;
    startMonitoring();
  }
});

onUnmounted(() => {
  stopMonitoring();
});

function startMonitoring() {
  updateMemory();
  interval = window.setInterval(updateMemory, 1000);
}

function stopMonitoring() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function updateMemory() {
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }
}

function forceGC() {
  if ("gc" in window) {
    (window as any).gc();
    console.log("🗑️ Garbage collection forced");
  } else {
    console.warn("GC not available (run Chrome with --expose-gc flag)");
  }
}
</script>

<template>
  <div v-if="show" class="memory-monitor">
    <div class="memory-display">💾 {{ memoryUsage }} MB</div>
    <button class="gc-button" title="Force Garbage Collection" @click="forceGC">
      🗑️
    </button>
  </div>
</template>

<style scoped>
.memory-monitor {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  z-index: 9998;
}

.memory-display {
  background: rgba(0, 0, 0, 0.8);
  color: #10b981;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.gc-button {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.gc-button:hover {
  background: rgba(239, 68, 68, 0.4);
  transform: scale(1.1);
}
</style>
