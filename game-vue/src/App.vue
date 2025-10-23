<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Leaderboard from "./components/LeaderBoard.vue";
import MemoryMonitor from "./components/MemoryMonitor.vue";
import NicknameInput from "./components/NicknameInput.vue";
import SliderGame from "./components/SliderGame.vue";
import { useGameStore } from "./stores/gameStore";
import { useLeaderboardStore } from "./stores/leaderboardStore";
import { useWebSocket } from "./composables/useWebSocket";
import type { Player } from "./types/game.types";

const leaderboardStore = useLeaderboardStore();
const { connected, connect, submitScore, onMessage, isReconnecting } =
  useWebSocket();

const pendingScore = ref<number | null>(null);
const showNicknamePrompt = ref(false);
const gameStore = useGameStore();

// Check if score qualifies for leaderboard (top 20)
const scoreQualifies = computed(() => {
  if (pendingScore.value === null) return false;
  if (pendingScore.value && pendingScore.value < gameStore.bestScore)
    return false;

  const players = leaderboardStore.players;

  if (players.length < 20) return true;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const lowestScore = sortedPlayers[19]?.score ?? 0;

  return pendingScore.value > lowestScore;
});

onMounted(() => {
  connect();
  onMessage("LEADERBOARD_UPDATE", (payload: unknown) => {
    const typedPayload = payload as { players: Player[] };
    leaderboardStore.updateLeaderboard(typedPayload.players);
  });
});

function handleScoreAchieved(score: number): void {
  pendingScore.value = score;

  if (scoreQualifies.value) {
    // Check if we need to prompt for nickname
    if (!leaderboardStore.currentNickname) {
      showNicknamePrompt.value = true;
    } else if (leaderboardStore.currentNickname) {
      // Already have nickname, submit directly
      submitScoreToServer(score);
    }
  } else {
    // just show the result
  }
}

function handleNicknameReady(): void {
  showNicknamePrompt.value = false;

  if (pendingScore.value !== null) {
    submitScoreToServer(pendingScore.value);
    pendingScore.value = null;
  }
}

function submitScoreToServer(score: number) {
  submitScore({
    nickname: leaderboardStore.currentNickname,
    score,
    framework: "vue",
  });
}
</script>

<template>
  <div id="app">
    <!-- Connection status -->
    <div class="fixed top-4 right-4 z-50">
      <div class="px-4 py-2 rounded-full text-sm font-semibold"
           :class="connected ? 'bg-opacity-20 success' : 'bg-opacity-20 danger'">
        <span v-if="connected">🟢 Connected</span>
        <span v-if="isReconnecting"><span :class="isReconnecting ? 'blink' : ''">🔴 connecting...</span></span>
        <span v-if="!connected && !isReconnecting">🔴 Disconnected</span>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-0 py-20 md:px-4 md:py-8 md:space-y-8">
      <!-- Nickname prompt modal (overlay) -->
      <div v-if="showNicknamePrompt"
           class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
        <div class="max-w-md w-full">
          <div class="bg-gray-800 rounded-xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold mb-4 text-center">🎉 Great Score!</h2>
            <p class="text-gray-400 text-center mb-6">
              You scored
              <span class="text-yellow-400 font-bold text-2xl">{{
                pendingScore
                }}</span>
              points!
              <br />
              Enter your nickname to save it on the leaderboard.
            </p>
            <NicknameInput @ready="handleNicknameReady" />
            <button class="mt-4 text-gray-500 text-sm w-full hover:text-gray-300"
                    @click="
                      showNicknamePrompt = false;
                    pendingScore = null;
                    ">
              Skip (don't save)
            </button>
          </div>
        </div>
      </div>

      <!-- Game -->
      <SliderGame :on-score-submit="handleScoreAchieved" />

      <!-- Leaderboard -->
      <Leaderboard />

      <footer class="flex flex-col items-center justify-center">
        <span>© 2025 <a href="https://drazenorsolic.xyz">dražen o. glava</a></span>
        <span><a href="https://github.com/glava11/web-game-demo">github</a></span>
      </footer>
    </div>

    <!-- Memory Monitor (dev only) -->
    <MemoryMonitor />

  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}

.success {
  color: var(--color-success);
  background-color: var(--color-success-02);
}

.danger {
  color: var(--color-danger);
  background-color: var(--color-danger-02);
}

.blink {
  margin: 0 auto;
  margin: 0 auto;
  display: inline-block;
  width: 18px;
  height: 18px;
  z-index: 10;
  opacity: 1;
  vertical-align: middle;
  background-color: #f00;
  border-radius: 50%;
  box-shadow:
    rgba(0, 0, 0, 0.2) 0 -1px 7px 1px,
    inset #441313 0 -1px 9px,
    rgba(255, 0, 0, 0.5) 0 2px 12px;
  animation: blinkRed 0.5s infinite;
}

@keyframes blinkRed {
  from {
    background-color: #f00;
  }

  50% {
    background-color: #a00;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0 -1px 7px 1px,
      inset #441313 0 -1px 9px,
      rgba(255, 0, 0, 0.5) 0 2px 0;
  }

  to {
    background-color: #f00;
  }
}
</style>
