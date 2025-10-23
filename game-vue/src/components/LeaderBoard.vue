<script setup lang="ts">
import { useLeaderboardStore } from "../stores/leaderboardStore";

const leaderboardStore = useLeaderboardStore();

const frameworkEmoji: Record<string, string> = {
  vue: "💚",
  react: "⚛️",
  angular: "🅰️",
};

function getFrameworkEmoji(framework: string): string {
  return frameworkEmoji[framework] || "🎮";
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
</script>

<template>
  <div class="max-w-sm sm:max-w-4xl w-full mx-auto">
    <div
      class="rounded-xl p-2 md:p-8 shadow-2xl"
      style="background-color: var(--color-bg-card)"
    >
      <div class="flex items-center justify-center mb-2">
        <h2 class="text-2xl font-bold">🏆 Global Leaderboard 🏆</h2>
      </div>
      <div class="text-sm text-center text-gray-400">
        {{ leaderboardStore.players.length }} players
      </div>

      <!-- Current player stats -->
      <div
        v-if="leaderboardStore.currentPlayerRank"
        class="bg-gray-700 rounded-lg p-4 mb-4 border-2 border-primary"
      >
        <div class="flex justify-between items-center">
          <div>
            <span class="text-gray-400">Your Rank:</span>
            <span class="text-2xl font-bold ml-2 text-primary">
              #{{ leaderboardStore.currentPlayerRank }}
            </span>
          </div>
          <div>
            <span class="text-gray-400">Your Score:</span>
            <span class="text-2xl font-bold ml-2 text-yellow-400">
              {{ leaderboardStore.currentPlayerScore }}
            </span>
          </div>
        </div>
      </div>

      <!-- Leaderboard table -->
      <div class="overflow-hidden rounded-lg">
        <div
          v-if="leaderboardStore.topPlayers.length === 0"
          class="text-center py-12 text-gray-500"
        >
          No scores yet. Be the first!
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                Rank
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                Player
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                Score
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                Framework
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-400"
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr
              v-for="(player, index) in leaderboardStore.topPlayers"
              :key="player.id"
              :class="{
                'bg-yellow-900 bg-opacity-20': index === 0,
                'bg-gray-700 bg-opacity-30': index === 1,
                'bg-orange-900 bg-opacity-20': index === 2,
                'bg-primary bg-opacity-10':
                  player.nickname === leaderboardStore.currentNickname,
              }"
              class="hover:bg-gray-700 hover:bg-opacity-50 transition-colors"
            >
              <!-- Rank -->
              <td class="px-4 py-3 text-lg font-bold">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else class="text-gray-400">#{{ index + 1 }}</span>
              </td>

              <!-- Player name -->
              <td class="px-4 py-3 font-semibold">
                {{ player.nickname }}
                <span
                  v-if="player.nickname === leaderboardStore.currentNickname"
                  class="ml-2 text-xs text-primary"
                >
                  (You)
                </span>
              </td>

              <!-- Score -->
              <td class="px-4 py-3 text-xl font-bold text-yellow-400">
                {{ player.score }}
              </td>

              <!-- Framework -->
              <td class="px-4 py-3 text-2xl">
                {{ getFrameworkEmoji(player.framework) }}
              </td>

              <!-- Time -->
              <td class="px-4 py-3 text-sm text-gray-400">
                {{ formatTime(player.timestamp) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
